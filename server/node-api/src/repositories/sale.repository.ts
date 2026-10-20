  import prisma from "../config/prisma";

  export const getSalesByCompany = async (
    companyId: string
  ) => {
    return prisma.sale.findMany({
      where: {
        companyId,
      },
      include: {
        company: true,
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
      orderBy: {
        createdAt: "desc",
      },
    });
  };

  export const getSaleById = async (
    saleId: string,
    companyId: string
  ) => {
    return prisma.sale.findFirst({
      where: {
        id: saleId,
        companyId,
      },
      include: {
        company: true,
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
    });
  };

  export const createSale = async (data: {
    companyId: string;
    warehouseId: string;
    invoiceNumber: string;
    totalAmount: number;
    notes?: string;
    items: {
      batchId: string;
      quantity: number;
      unitPrice: number;
    }[];
  }) => {
    return prisma.$transaction(async (tx) => {
      // 1. Validate items
      if (
        !Array.isArray(data.items) ||
        data.items.length === 0
      ) {
        throw new Error(
          "At least one sale item is required"
        );
      }

      // 2. Validate warehouse belongs to company
      const warehouse =
        await tx.warehouse.findFirst({
          where: {
            id: data.warehouseId,
            companyId: data.companyId,
          },
        });

      if (!warehouse) {
        throw new Error(
          "Warehouse not found for this company"
        );
      }

      const saleItems = [];

      let calculatedTotal = 0;

      // 3. Validate every sale item
      for (const item of data.items) {
        if (!item.batchId) {
          throw new Error(
            "Batch ID is required for every sale item"
          );
        }

        if (item.quantity <= 0) {
          throw new Error(
            "Sale quantity must be greater than zero"
          );
        }

        if (item.unitPrice < 0) {
          throw new Error(
            "Unit price cannot be negative"
          );
        }

        // Find inventory for this warehouse + batch
        const inventory =
          await tx.inventory.findUnique({
            where: {
              warehouseId_batchId: {
                warehouseId:
                  data.warehouseId,
                batchId: item.batchId,
              },
            },
            include: {
              batch: {
                include: {
                  medicine: true,
                },
              },
            },
          });

        if (!inventory) {
          throw new Error(
            `Inventory not found for batch ${item.batchId}`
          );
        }

        // 4. Verify medicine belongs to company
        if (
          inventory.batch.medicine.companyId !==
          data.companyId
        ) {
          throw new Error(
            `Batch ${item.batchId} does not belong to this company`
          );
        }

        // 5. Check available stock
        if (
          inventory.quantity <
          item.quantity
        ) {
          throw new Error(
            `Insufficient inventory for batch ${inventory.batch.batchNumber}. Available: ${inventory.quantity}, requested: ${item.quantity}`
          );
        }

        const itemTotal =
          item.quantity *
          item.unitPrice;

        calculatedTotal += itemTotal;

        saleItems.push({
          batchId: item.batchId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: itemTotal,
          inventoryId: inventory.id,
        });
      }

      // 6. Create sale using calculated total
      const sale = await tx.sale.create({
        data: {
          companyId:
            data.companyId,

          warehouseId:
            data.warehouseId,

          invoiceNumber:
            data.invoiceNumber,

          totalAmount:
            calculatedTotal,

          notes: data.notes,

          status: "COMPLETED",

          items: {
            create: saleItems.map(
              (item) => ({
                batchId:
                  item.batchId,

                quantity:
                  item.quantity,

                unitPrice:
                  item.unitPrice,

                totalPrice:
                  item.totalPrice,
              })
            ),
          },
        },

        include: {
          company: true,
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
      });

      // 7. Deduct inventory and create SALE transactions
      for (const item of saleItems) {
        const inventory =
          await tx.inventory.update({
            where: {
              id: item.inventoryId,
            },

            data: {
              quantity: {
                decrement:
                  item.quantity,
              },
            },
          });

        await tx.inventoryTransaction.create({
          data: {
            inventoryId:
              inventory.id,

            type: "SALE",

            quantity:
              item.quantity,

            referenceId:
              sale.id,

            notes:
              `Sale ${sale.invoiceNumber}`,
          },
        });
      }

      return sale;
    });
  };