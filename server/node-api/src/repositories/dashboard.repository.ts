import prisma from "../config/prisma";

// ==========================================
// COMPANY DASHBOARD
// Pharma / Wholesaler / Retailer
// ==========================================

export const getDashboardOverview = async (
  companyId: string
) => {
  const today = new Date();

  const expiryLimit = new Date();

  expiryLimit.setDate(
    expiryLimit.getDate() + 30
  );

  const [
    medicineCount,
    inventoryItems,
    salesSummary,
    pendingPurchaseOrders,
    lowStockCount,
    expiringCount,
    recentSales,
    recentPurchaseOrders,
  ] = await Promise.all([
    // Total medicines
    prisma.medicine.count({
      where: {
        companyId,
        isActive: true,
      },
    }),

    // Inventory
    prisma.inventory.findMany({
      where: {
        warehouse: {
          companyId,
        },
      },
      include: {
        batch: true,
      },
    }),

    // Completed sales
    prisma.sale.aggregate({
      where: {
        companyId,
        status: "COMPLETED",
      },
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    }),

    // Pending purchase orders
    prisma.purchaseOrder.count({
      where: {
        buyerCompanyId: companyId,
        status: {
          in: [
            "PENDING",
            "APPROVED",
            "DISPATCHED",
          ],
        },
      },
    }),

    // Low stock
    prisma.inventory.count({
      where: {
        warehouse: {
          companyId,
        },
        quantity: {
          lte: 100,
        },
      },
    }),

    // Expiring within 30 days
    prisma.medicineBatch.count({
      where: {
        medicine: {
          companyId,
        },
        expiryDate: {
          gte: today,
          lte: expiryLimit,
        },
      },
    }),

    // Recent sales
    prisma.sale.findMany({
      where: {
        companyId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        warehouse: true,
        items: {
          include: {
            batch: {
              include: {
                medicine: true,
              },
            },
          },
        },
      },
    }),

    // Recent purchase orders
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
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        buyerCompany: true,
        sellerCompany: true,
        items: {
          include: {
            medicine: true,
          },
        },
      },
    }),
  ]);

  // ==========================================
  // TOTAL INVENTORY
  // ==========================================

  const totalInventory =
    inventoryItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  // ==========================================
  // INVENTORY VALUE
  // ==========================================

  const inventoryValue =
    inventoryItems.reduce(
      (total, item) =>
        total +
        item.quantity *
          Number(item.batch.mrp),
      0
    );

  return {
    summary: {
      totalMedicines: medicineCount,

      totalInventory,

      inventoryValue,

      totalSales:
        Number(
          salesSummary._sum.totalAmount ?? 0
        ),

      totalSalesCount:
        salesSummary._count.id,

      pendingPurchaseOrders,

      lowStockCount,

      expiringCount,
    },

    recentSales,

    recentPurchaseOrders,
  };
};


// ==========================================
// SUPER ADMIN DASHBOARD
// Platform-wide data
// ==========================================

export const getAdminDashboardOverview =
  async () => {

    // ==========================================
    // BASIC PLATFORM KPIs
    // ==========================================

    const [
      totalCompanies,
      totalUsers,
      pendingApprovals,
      activeCompanies,
    ] = await Promise.all([

      // Total companies
      prisma.company.count(),

      // Total users
      prisma.user.count(),

      // Pending companies
      prisma.company.count({
        where: {
          status: "PENDING",
        },
      }),

      // Active companies
      prisma.company.count({
        where: {
          status: "ACTIVE",
        },
      }),

    ]);


    // ==========================================
    // DATE RANGE
    // Last 12 Months
    // ==========================================

    const now = new Date();

    const twelveMonthsAgo =
      new Date(
        now.getFullYear(),
        now.getMonth() - 11,
        1
      );


    // ==========================================
    // COMPANY GROWTH
    // ==========================================

    const companies =
      await prisma.company.findMany({
        where: {
          createdAt: {
            gte: twelveMonthsAgo,
          },
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });


    // ==========================================
    // USER GROWTH
    // ==========================================

    const users =
      await prisma.user.findMany({
        where: {
          createdAt: {
            gte: twelveMonthsAgo,
          },
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });


    // ==========================================
    // MONTHLY DATA
    // ==========================================

    const companyGrowth: {
      month: string;
      companies: number;
    }[] = [];

    const userGrowth: {
      month: string;
      users: number;
    }[] = [];


    for (
      let i = 11;
      i >= 0;
      i--
    ) {

      const date =
        new Date(
          now.getFullYear(),
          now.getMonth() - i,
          1
        );


      const year =
        date.getFullYear();

      const month =
        date.getMonth();


      const monthName =
        date.toLocaleString(
          "default",
          {
            month: "short",
          }
        );


      // Companies created in this month

      const companyCount =
        companies.filter(
          (company) => {

            const created =
              new Date(
                company.createdAt
              );

            return (
              created.getFullYear() ===
                year &&
              created.getMonth() ===
                month
            );

          }
        ).length;


      // Users created in this month

      const userCount =
        users.filter(
          (user) => {

            const created =
              new Date(
                user.createdAt
              );

            return (
              created.getFullYear() ===
                year &&
              created.getMonth() ===
                month
            );

          }
        ).length;


      companyGrowth.push({
        month: monthName,
        companies: companyCount,
      });


      userGrowth.push({
        month: monthName,
        users: userCount,
      });

    }


    // ==========================================
    // QUARTERLY GROWTH
    // ==========================================

    const quarterlyCompanyGrowth: {
      quarter: string;
      companies: number;
    }[] = [];

    const quarterlyUserGrowth: {
      quarter: string;
      users: number;
    }[] = [];


    for (
      let i = 3;
      i >= 0;
      i--
    ) {

      const quarterDate =
        new Date(
          now.getFullYear(),
          now.getMonth() -
            i * 3,
          1
        );


      const quarter =
        Math.floor(
          quarterDate.getMonth() / 3
        ) + 1;


      const quarterStart =
        new Date(
          quarterDate.getFullYear(),
          (quarter - 1) * 3,
          1
        );


      const quarterEnd =
        new Date(
          quarterDate.getFullYear(),
          quarter * 3,
          1
        );


      const companyCount =
        companies.filter(
          (company) => {

            const created =
              new Date(
                company.createdAt
              );

            return (
              created >=
                quarterStart &&
              created <
                quarterEnd
            );

          }
        ).length;


      const userCount =
        users.filter(
          (user) => {

            const created =
              new Date(
                user.createdAt
              );

            return (
              created >=
                quarterStart &&
              created <
                quarterEnd
            );

          }
        ).length;


      quarterlyCompanyGrowth.push({
        quarter: `Q${quarter} ${quarterDate.getFullYear()}`,
        companies: companyCount,
      });


      quarterlyUserGrowth.push({
        quarter: `Q${quarter} ${quarterDate.getFullYear()}`,
        users: userCount,
      });

    }


    // ==========================================
    // YEARLY GROWTH
    // ==========================================

    const yearlyCompanyGrowth: {
      year: number;
      companies: number;
    }[] = [];

    const yearlyUserGrowth: {
      year: number;
      users: number;
    }[] = [];


    for (
      let i = 4;
      i >= 0;
      i--
    ) {

      const year =
        now.getFullYear() - i;


      const companyCount =
        await prisma.company.count({
          where: {
            createdAt: {
              gte: new Date(
                year,
                0,
                1
              ),
              lt: new Date(
                year + 1,
                0,
                1
              ),
            },
          },
        });


      const userCount =
        await prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(
                year,
                0,
                1
              ),
              lt: new Date(
                year + 1,
                0,
                1
              ),
            },
          },
        });


      yearlyCompanyGrowth.push({
        year,
        companies: companyCount,
      });


      yearlyUserGrowth.push({
        year,
        users: userCount,
      });

    }


    // ==========================================
    // USER DISTRIBUTION
    // ==========================================

    const [
      pharmaUsers,
      wholesalerUsers,
      retailerUsers,
    ] = await Promise.all([

      prisma.user.count({
        where: {
          role: "PHARMA",
          isActive: true,
        },
      }),

      prisma.user.count({
        where: {
          role: "WHOLESALER",
          isActive: true,
        },
      }),

      prisma.user.count({
        where: {
          role: "RETAILER",
          isActive: true,
        },
      }),

    ]);


    const userDistribution = [
      {
        role: "Pharma",
        users: pharmaUsers,
      },

      {
        role: "Wholesaler",
        users: wholesalerUsers,
      },

      {
        role: "Retailer",
        users: retailerUsers,
      },
    ];


    // ==========================================
    // RETURN ADMIN DASHBOARD
    // ==========================================

    return {

      summary: {

        totalCompanies,

        totalUsers,

        pendingApprovals,

        activeCompanies,

        // Subscription system does not
        // exist in current database schema.

        activeSubscriptions: null,

      },


      analytics: {

        companyGrowth: {

          monthly:
            companyGrowth,

          quarterly:
            quarterlyCompanyGrowth,

          yearly:
            yearlyCompanyGrowth,

        },


        userGrowth: {

          monthly:
            userGrowth,

          quarterly:
            quarterlyUserGrowth,

          yearly:
            yearlyUserGrowth,

        },


        userDistribution,

        subscriptionOverview: null,

      },

    };

  };