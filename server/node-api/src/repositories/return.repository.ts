import prisma from "../config/prisma";

export const createSaleReturn = async (data: {
  saleId: string;
  companyId: string;
}) => {
  return prisma.$transaction(async (tx) => {
    // 1. Find the sale and make sure it belongs to the company
    const sale = await tx.sale.findFirst({
      where: {
        id: data.saleId,
        companyId: data.companyId,
      },
      include: {
        items: {
          include: {
            batch: {
              include: {
                medicine: true,
              },
            },
          },
        },
        warehouse: true,
      },
    });

    if (!sale) {
      throw new Error("Sale not found");
    }

    // 2. Check sale status
    if (sale.status === "RETURNED") {
      throw new Error("Sale has already been returned");
    }

    if (sale.status === "CANCELLED") {
      throw new Error("Cancelled sale cannot be returned");
    }

    // 3. Process every sold item
    for (const item of sale.items) {
      const inventory = await tx.inventory.findUnique({
        where: {
          warehouseId_batchId: {
            warehouseId: sale.warehouseId,
            batchId: item.batchId,
          },
        },
      });

      if (!inventory) {
        throw new Error(
          `Inventory not found for batch ${item.batch.batchNumber}`
        );
      }

      // 4. Add returned quantity back to inventory
      await tx.inventory.update({
        where: {
          id: inventory.id,
        },
        data: {
          quantity: {
            increment: item.quantity,
          },
        },
      });

      // 5. Create RETURN transaction
      await tx.inventoryTransaction.create({
        data: {
          inventoryId: inventory.id,
          type: "RETURN",
          quantity: item.quantity,
          referenceId: sale.id,
          notes: `Return for sale ${sale.invoiceNumber}`,
        },
      });
    }

    // 6. Mark sale as RETURNED
    const updatedSale = await tx.sale.update({
      where: {
        id: sale.id,
      },
      data: {
        status: "RETURNED",
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

    return updatedSale;
  });
};