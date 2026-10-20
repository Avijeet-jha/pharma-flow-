import prisma from "../config/prisma";

/*
|--------------------------------------------------------------------------
| Get all companies
|--------------------------------------------------------------------------
*/
export const getAllCompanies = async () => {
  return prisma.company.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

/*
|--------------------------------------------------------------------------
| Get single company by ID
|--------------------------------------------------------------------------
*/
export const getCompanyById = async (
  companyId: string
) => {
  return prisma.company.findUnique({
    where: {
      id: companyId,
    },

    select: {
      id: true,
      companyName: true,
      companyType: true,
      email: true,
      phone: true,
      gstNumber: true,
      drugLicenseNumber: true,

      address: true,
      city: true,
      state: true,
      pincode: true,

      status: true,
      isVerified: true,

      createdAt: true,
      updatedAt: true,

      /*
      |--------------------------------------------------------------------------
      | Warehouses
      |--------------------------------------------------------------------------
      */
      warehouses: {
        select: {
          id: true,
          warehouseName: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          createdAt: true,
          updatedAt: true,
        },
      },

      /*
      |--------------------------------------------------------------------------
      | Medicines
      |--------------------------------------------------------------------------
      */
      medicines: {
        select: {
          id: true,
          medicineName: true,
          genericName: true,
          strength: true,
          dosageForm: true,
          description: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      },

      /*
      |--------------------------------------------------------------------------
      | Users
      |--------------------------------------------------------------------------
      */
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
};

/*
|--------------------------------------------------------------------------
| Create company
|--------------------------------------------------------------------------
*/
export const createCompany = async (data: {
  companyName: string;
  companyType:
    | "PHARMA"
    | "WHOLESALER"
    | "RETAILER";
  email: string;
  passwordHash: string;
  phone?: string;
  gstNumber?: string;
  drugLicenseNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}) => {
  return prisma.company.create({
    data,
  });
};

/*
|--------------------------------------------------------------------------
| Approve company
|--------------------------------------------------------------------------
*/
export const approveCompany = async (
  companyId: string
) => {
  return prisma.company.update({
    where: {
      id: companyId,
    },

    data: {
      status: "ACTIVE",
      isVerified: true,
    },
  });
};

/*
|--------------------------------------------------------------------------
| Update company status
|--------------------------------------------------------------------------
*/
export const updateCompanyStatus = async (
  companyId: string,
  status:
    | "PENDING"
    | "ACTIVE"
    | "SUSPENDED"
    | "REJECTED"
) => {
  return prisma.company.update({
    where: {
      id: companyId,
    },

    data: {
      status,
      isVerified: status === "ACTIVE",
    },
  });
};

export const getCompanyPerformance = async (
  companyId: string
) => {
  const company =
    await prisma.company.findUnique({
      where: {
        id: companyId,
      },
      select: {
        id: true,
        companyName: true,
        companyType: true,
        status: true,
      },
    });

  if (!company) {
    return null;
  }

  const [
    warehouses,
    medicines,
    inventory,
    sales,
    purchaseOrders,
    transactions,
  ] = await Promise.all([
    prisma.warehouse.count({
      where: {
        companyId,
      },
    }),

    prisma.medicine.count({
      where: {
        companyId,
      },
    }),

    prisma.inventory.findMany({
      where: {
        warehouse: {
          companyId,
        },
      },
      select: {
        quantity: true,
        batch: {
          select: {
            mrp: true,
            medicine: {
              select: {
                id: true,
                medicineName: true,
              },
            },
          },
        },
      },
    }),

    prisma.sale.findMany({
      where: {
        companyId,
        status: "COMPLETED",
      },
      select: {
        id: true,
        saleDate: true,
        totalAmount: true,
        items: {
          select: {
            quantity: true,
            totalPrice: true,
            batch: {
              select: {
                medicine: {
                  select: {
                    id: true,
                    medicineName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        saleDate: "asc",
      },
    }),

    prisma.purchaseOrder.findMany({
      where: {
        OR: [
          {
            buyerCompanyId: companyId,
          },
          {
            sellerCompanyId: companyId,
          },
        ],
      },
      select: {
        id: true,
        status: true,
        orderDate: true,
        buyerCompanyId: true,
        sellerCompanyId: true,
        items: {
          select: {
            quantity: true,
            totalPrice: true,
          },
        },
      },
      orderBy: {
        orderDate: "asc",
      },
    }),

    prisma.inventoryTransaction.findMany({
      where: {
        inventory: {
          warehouse: {
            companyId,
          },
        },
      },
      select: {
        type: true,
        quantity: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
  ]);

  const totalSales = sales.reduce(
    (total, sale) =>
      total +
      Number(sale.totalAmount),
    0
  );

  const totalPurchaseValue =
    purchaseOrders.reduce(
      (total, order) => {
        const orderTotal =
          order.items.reduce(
            (sum, item) =>
              sum +
              Number(item.totalPrice),
            0
          );

        return total + orderTotal;
      },
      0
    );

  const totalInventoryUnits =
    inventory.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  const inventoryValue =
    inventory.reduce(
      (total, item) =>
        total +
        item.quantity *
          Number(item.batch.mrp),
      0
    );

  const completedSales =
    sales.length;

  const pendingPurchaseOrders =
    purchaseOrders.filter(
      (order) =>
        order.status === "PENDING"
    ).length;

  const topMedicinesMap =
    new Map<
      string,
      {
        medicineId: string;
        medicineName: string;
        quantity: number;
        revenue: number;
      }
    >();

  for (const sale of sales) {
    for (const item of sale.items) {
      const medicine =
        item.batch.medicine;

      const existing =
        topMedicinesMap.get(
          medicine.id
        );

      if (existing) {
        existing.quantity +=
          item.quantity;

        existing.revenue +=
          Number(
            item.totalPrice
          );
      } else {
        topMedicinesMap.set(
          medicine.id,
          {
            medicineId:
              medicine.id,

            medicineName:
              medicine.medicineName,

            quantity:
              item.quantity,

            revenue:
              Number(
                item.totalPrice
              ),
          }
        );
      }
    }
  }

  const topSellingMedicines =
    Array.from(
      topMedicinesMap.values()
    )
      .sort(
        (a, b) =>
          b.quantity -
          a.quantity
      )
      .slice(0, 5);

  const monthlySalesMap =
    new Map<
      string,
      number
    >();

  for (const sale of sales) {
    const date =
      new Date(
        sale.saleDate
      );

    const key =
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

    monthlySalesMap.set(
      key,
      (monthlySalesMap.get(
        key
      ) || 0) +
        Number(
          sale.totalAmount
        )
    );
  }

  const monthlyPurchaseMap =
    new Map<
      string,
      number
    >();

  for (const order of purchaseOrders) {
    const date =
      new Date(
        order.orderDate
      );

    const key =
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

    const orderTotal =
      order.items.reduce(
        (sum, item) =>
          sum +
          Number(
            item.totalPrice
          ),
        0
      );

    monthlyPurchaseMap.set(
      key,
      (monthlyPurchaseMap.get(
        key
      ) || 0) +
        orderTotal
    );
  }

  const monthlySales =
    Array.from(
      monthlySalesMap.entries()
    ).map(
      ([month, amount]) => ({
        month,
        amount,
      })
    );

  const monthlyPurchases =
    Array.from(
      monthlyPurchaseMap.entries()
    ).map(
      ([month, amount]) => ({
        month,
        amount,
      })
    );

  const transactionSummary = {
    PURCHASE: 0,
    SALE: 0,
    DISPATCH: 0,
    RETURN: 0,
    EXPIRY: 0,
    DAMAGE: 0,
    ADJUSTMENT: 0,
  };

  for (const transaction of transactions) {
    transactionSummary[
      transaction.type
    ] += transaction.quantity;
  }

  return {
    company,

    summary: {
      totalSales,
      totalPurchaseValue,
      inventoryValue,
      totalInventoryUnits,
      totalWarehouses:
        warehouses,
      totalMedicines:
        medicines,
      completedSales,
      pendingPurchaseOrders,
    },

    monthlySales,

    monthlyPurchases,

    topSellingMedicines,

    transactionSummary,
  };
};