import prisma from "../config/prisma";
import { Prisma } from "../generated/prisma";

/*
 * =========================================================
 * GET ALL DISPATCHES FOR A COMPANY
 * =========================================================
 *
 * A company can see a dispatch when it is either:
 *
 * - The seller/source company
 * - The buyer/destination company
 */
export const getDispatchesByCompany = async (companyId: string) => {
  return prisma.dispatch.findMany({
    where: {
      OR: [
        {
          sourceWarehouse: {
            companyId,
          },
        },
        {
          destinationWarehouse: {
            companyId,
          },
        },
      ],
    },

    include: {
      purchaseOrder: {
        include: {
          buyerCompany: {
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
            },
          },

          sellerCompany: {
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
            },
          },

          items: {
            include: {
              medicine: true,
              batch: true,
            },
          },
        },
      },

      sourceWarehouse: true,

      destinationWarehouse: true,

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

/*
 * =========================================================
 * GET DISPATCH BY ID
 * =========================================================
 */
export const getDispatchById = async (
  dispatchId: string,
  companyId: string,
) => {
  return prisma.dispatch.findFirst({
    where: {
      id: dispatchId,

      OR: [
        {
          sourceWarehouse: {
            companyId,
          },
        },
        {
          destinationWarehouse: {
            companyId,
          },
        },
      ],
    },

    include: {
      purchaseOrder: {
        include: {
          buyerCompany: {
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
            },
          },

          sellerCompany: {
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
            },
          },

          items: {
            include: {
              medicine: true,
              batch: true,
            },
          },
        },
      },

      sourceWarehouse: true,

      destinationWarehouse: true,

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

/*
 * =========================================================
 * CREATE DISPATCH
 * =========================================================
 *
 * Seller creates a dispatch from:
 *
 *     Seller Warehouse
 *            ↓
 *        Dispatch
 *            ↓
 *     Buyer Warehouse
 *
 * Inventory is NOT reduced here.
 *
 * Inventory is reduced only when the dispatch is actually
 * marked DISPATCHED.
 */
export const createDispatch = async (data: {
  purchaseOrderId: string;

  sourceWarehouseId: string;

  destinationWarehouseId: string;

  items: {
    batchId: string;
    quantity: number;
  }[];
}) => {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    /*
     * =====================================================
     * 1. FIND PURCHASE ORDER
     * =====================================================
     */

    const purchaseOrder = await tx.purchaseOrder.findUnique({
      where: {
        id: data.purchaseOrderId,
      },

      include: {
        items: true,
      },
    });

    if (!purchaseOrder) {
      throw new Error("Purchase order not found");
    }

    /*
     * =====================================================
     * 2. ONLY APPROVED PO CAN BE DISPATCHED
     * =====================================================
     */

    if (purchaseOrder.status !== "APPROVED") {
      throw new Error("Only approved purchase orders can be dispatched");
    }

    /*
     * =====================================================
     * 3. VALIDATE DISPATCH ITEMS
     * =====================================================
     */

    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new Error("At least one dispatch item is required");
    }

    /*
     * =====================================================
     * 4. VERIFY SOURCE WAREHOUSE
     *
     * Source warehouse must belong to seller.
     * =====================================================
     */

    const sourceWarehouse = await tx.warehouse.findFirst({
      where: {
        id: data.sourceWarehouseId,
        companyId: purchaseOrder.sellerCompanyId,
      },
    });

    if (!sourceWarehouse) {
      throw new Error("Source warehouse does not belong to the seller company");
    }

    /*
     * =====================================================
     * 5. VERIFY DESTINATION WAREHOUSE
     *
     * Destination warehouse must belong to buyer.
     * =====================================================
     */

    const destinationWarehouse = await tx.warehouse.findFirst({
      where: {
        id: data.destinationWarehouseId,
        companyId: purchaseOrder.buyerCompanyId,
      },
    });

    if (!destinationWarehouse) {
      throw new Error(
        "Destination warehouse does not belong to the buyer company",
      );
    }

    /*
     * =====================================================
     * 6. SOURCE AND DESTINATION CANNOT BE SAME
     * =====================================================
     */

    if (data.sourceWarehouseId === data.destinationWarehouseId) {
      throw new Error("Source and destination warehouses cannot be the same");
    }

    /*
     * =====================================================
     * 7. GET EXISTING DISPATCH QUANTITIES
     *
     * This prevents:
     *
     * PO = 100
     *
     * Dispatch 1 = 70
     * Dispatch 2 = 50
     *
     * Total = 120 ❌
     *
     * Only 30 should remain available.
     * =====================================================
     */

    const existingDispatchItems = await tx.dispatchItem.findMany({
      where: {
        dispatch: {
          purchaseOrderId: data.purchaseOrderId,

          status: {
            in: ["PENDING", "DISPATCHED", "DELIVERED"],
          },
        },
      },
    });

    /*
     * =====================================================
     * 8. VALIDATE EACH ITEM
     * =====================================================
     */

    for (const item of data.items) {
      /*
       * Quantity must be a positive integer.
       */

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error("Dispatch quantity must be a positive integer");
      }

      /*
       * Find batch.
       */

      const batch = await tx.medicineBatch.findUnique({
        where: {
          id: item.batchId,
        },
      });

      if (!batch) {
        throw new Error(`Batch not found: ${item.batchId}`);
      }

      /*
       * Find corresponding PO item.
       */

      const purchaseOrderItem = purchaseOrder.items.find(
        (poItem) => poItem.medicineId === batch.medicineId,
      );

      if (!purchaseOrderItem) {
        throw new Error(
          `Batch ${item.batchId} does not belong to this purchase order`,
        );
      }

      /*
       * =================================================
       * CALCULATE ALREADY DISPATCHED QUANTITY
       *
       * IMPORTANT:
       *
       * We calculate this by MEDICINE / PO ITEM,
       * not only by batch.
       *
       * This prevents:
       *
       * PO = 200
       *
       * Batch A = 120
       * Batch B = 100
       *
       * Total = 220 ❌
       *
       * =================================================
       */

      let alreadyDispatched = 0;

      for (const dispatchItem of existingDispatchItems) {
        const dispatchedBatch = await tx.medicineBatch.findUnique({
          where: {
            id: dispatchItem.batchId,
          },
        });

        if (
          dispatchedBatch &&
          dispatchedBatch.medicineId === purchaseOrderItem.medicineId
        ) {
          alreadyDispatched += dispatchItem.quantity;
        }
      }

      /*
       * =================================================
       * REMAINING PO QUANTITY
       * =================================================
       */

      const remainingQuantity = purchaseOrderItem.quantity - alreadyDispatched;

      /*
       * =================================================
       * VALIDATE CURRENT DISPATCH
       * =================================================
       */

      if (item.quantity > remainingQuantity) {
        throw new Error(
          `Dispatch quantity for medicine ${purchaseOrderItem.medicineId} exceeds remaining ordered quantity. Remaining quantity: ${remainingQuantity}`,
        );
      }

      /*
       * =================================================
       * CHECK SOURCE INVENTORY
       * =================================================
       */

      const sourceInventory = await tx.inventory.findUnique({
        where: {
          warehouseId_batchId: {
            warehouseId: data.sourceWarehouseId,

            batchId: item.batchId,
          },
        },
      });

      if (!sourceInventory) {
        throw new Error(
          `Batch ${item.batchId} is not available in the source warehouse`,
        );
      }

      /*
       * =================================================
       * CHECK AVAILABLE INVENTORY
       * =================================================
       */

      if (sourceInventory.quantity < item.quantity) {
        throw new Error(
          `Insufficient inventory for batch ${item.batchId}. Available: ${sourceInventory.quantity}, requested: ${item.quantity}`,
        );
      }
    }

    /*
     * =====================================================
     * 9. CREATE DISPATCH
     * =====================================================
     */

    const dispatch = await tx.dispatch.create({
      data: {
        purchaseOrderId: data.purchaseOrderId,

        sourceWarehouseId: data.sourceWarehouseId,

        destinationWarehouseId: data.destinationWarehouseId,

        items: {
          create: data.items.map((item) => ({
            batchId: item.batchId,

            quantity: item.quantity,
          })),
        },
      },

      include: {
        purchaseOrder: {
          include: {
            items: {
              include: {
                medicine: true,
                batch: true,
              },
            },
          },
        },

        sourceWarehouse: true,

        destinationWarehouse: true,

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

    return dispatch;
  });
};

/*
 * =========================================================
 * UPDATE DISPATCH STATUS
 * =========================================================
 */
export const updateDispatchStatus = async (
  dispatchId: string,
  companyId: string,
  status: "PENDING" | "DISPATCHED" | "DELIVERED" | "CANCELLED",
) => {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    /*
     * =====================================================
     * 1. FIND DISPATCH
     * =====================================================
     */

    const dispatch = await tx.dispatch.findFirst({
      where: {
        id: dispatchId,

        OR: [
          {
            sourceWarehouse: {
              companyId,
            },
          },
          {
            destinationWarehouse: {
              companyId,
            },
          },
        ],
      },

      include: {
        purchaseOrder: true,

        sourceWarehouse: true,

        destinationWarehouse: true,

        items: true,
      },
    });

    if (!dispatch) {
      throw new Error("Dispatch not found");
    }

    /*
     * =====================================================
     * 2. DETERMINE SELLER / BUYER
     * =====================================================
     */

    const isSeller = companyId === dispatch.purchaseOrder.sellerCompanyId;

    const isBuyer = companyId === dispatch.purchaseOrder.buyerCompanyId;

    /*
     * =====================================================
     * 3. SELLER CAN MARK DISPATCHED
     * =====================================================
     */

    if (status === "DISPATCHED" && !isSeller) {
      throw new Error(
        "Only the seller company can mark a dispatch as DISPATCHED",
      );
    }

    /*
     * =====================================================
     * 4. BUYER CAN MARK DELIVERED
     * =====================================================
     */

    if (status === "DELIVERED" && !isBuyer) {
      throw new Error(
        "Only the buyer company can mark a dispatch as DELIVERED",
      );
    }

    /*
     * =====================================================
     * 5. PREVENT FINAL STATUS CHANGES
     * =====================================================
     */

    if (dispatch.status === "DELIVERED" || dispatch.status === "CANCELLED") {
      throw new Error(`Cannot change dispatch status from ${dispatch.status}`);
    }

    /*
     * =====================================================
     * 6. VALIDATE STATUS TRANSITIONS
     * =====================================================
     */

    if (
      dispatch.status === "PENDING" &&
      status !== "DISPATCHED" &&
      status !== "CANCELLED"
    ) {
      throw new Error("Pending dispatch can only be DISPATCHED or CANCELLED");
    }

    if (
      dispatch.status === "DISPATCHED" &&
      status !== "DELIVERED" &&
      status !== "CANCELLED"
    ) {
      throw new Error("Dispatched order can only be DELIVERED or CANCELLED");
    }

    /*
     * =====================================================
     * 7. CANCEL PENDING DISPATCH
     * =====================================================
     */

    if (status === "CANCELLED") {
      /*
       * Only seller can cancel a pending dispatch.
       */

      if (!isSeller) {
        throw new Error(
          "Only the seller company can cancel a pending dispatch",
        );
      }

      /*
       * Only pending dispatches can be cancelled.
       */

      if (dispatch.status !== "PENDING") {
        throw new Error("Only pending dispatches can be cancelled");
      }

      /*
       * Update dispatch.
       */

      const updatedDispatch = await tx.dispatch.update({
        where: {
          id: dispatchId,
        },

        data: {
          status: "CANCELLED",
        },

        include: {
          purchaseOrder: true,

          sourceWarehouse: true,

          destinationWarehouse: true,

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

      /*
       * Cancel the PO as well.
       */

      
      return updatedDispatch;

    }

    /*
     * =====================================================
     * 8. MARK DISPATCHED
     *
     * Seller inventory decreases here.
     * =====================================================
     */

    if (status === "DISPATCHED") {
      for (const item of dispatch.items) {
        /*
         * Find seller inventory.
         */

        const sourceInventory = await tx.inventory.findUnique({
          where: {
            warehouseId_batchId: {
              warehouseId: dispatch.sourceWarehouseId,

              batchId: item.batchId,
            },
          },
        });

        if (!sourceInventory) {
          throw new Error(
            `Batch ${item.batchId} is not available in the source warehouse`,
          );
        }

        /*
         * Check available quantity.
         */

        if (sourceInventory.quantity < item.quantity) {
          throw new Error(
            `Insufficient inventory for batch ${item.batchId}. Available: ${sourceInventory.quantity}, required: ${item.quantity}`,
          );
        }

        /*
         * Reduce seller inventory.
         */

        await tx.inventory.update({
          where: {
            id: sourceInventory.id,
          },

          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

        /*
         * Record inventory movement.
         */

        await tx.inventoryTransaction.create({
          data: {
            inventoryId: sourceInventory.id,

            type: "DISPATCH",

            quantity: item.quantity,

            referenceId: dispatch.id,

            notes: `Inventory dispatched from ${dispatch.sourceWarehouseId} to ${dispatch.destinationWarehouseId}`,
          },
        });
      }

      /*
       * Update dispatch.
       */

      const updatedDispatch = await tx.dispatch.update({
        where: {
          id: dispatchId,
        },

        data: {
          status: "DISPATCHED",

          dispatchedAt: dispatch.dispatchedAt ?? new Date(),
        },

        include: {
          purchaseOrder: true,

          sourceWarehouse: true,

          destinationWarehouse: true,

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

      /*
       * Update PO status.
       */

      await tx.purchaseOrder.update({
        where: {
          id: dispatch.purchaseOrderId,
        },

        data: {
          status: "DISPATCHED",
        },
      });

      return updatedDispatch;
    }

    /*
     * =====================================================
     * 9. MARK DELIVERED
     *
     * Buyer inventory increases here.
     * =====================================================
     */

    if (status === "DELIVERED") {
      for (const item of dispatch.items) {
        /*
         * Find destination inventory.
         */

        const existingInventory = await tx.inventory.findUnique({
          where: {
            warehouseId_batchId: {
              warehouseId: dispatch.destinationWarehouseId,

              batchId: item.batchId,
            },
          },
        });

        let inventory:
          | Awaited<ReturnType<typeof tx.inventory.update>>
          | Awaited<ReturnType<typeof tx.inventory.create>>;

        /*
         * Existing inventory.
         */

        if (existingInventory) {
          inventory = await tx.inventory.update({
            where: {
              id: existingInventory.id,
            },

            data: {
              quantity: {
                increment: item.quantity,
              },
            },
          });
        } else {

        /*
         * New inventory.
         */
          inventory = await tx.inventory.create({
            data: {
              warehouseId: dispatch.destinationWarehouseId,

              batchId: item.batchId,

              quantity: item.quantity,
            },
          });
        }

        /*
         * Record PURCHASE transaction.
         */

        await tx.inventoryTransaction.create({
          data: {
            inventoryId: inventory.id,

            type: "PURCHASE",

            quantity: item.quantity,

            referenceId: dispatch.id,

            notes: `Inventory received from dispatch ${dispatch.id}`,
          },
        });
      }

      /*
       * Update dispatch.
       */

      const updatedDispatch = await tx.dispatch.update({
        where: {
          id: dispatchId,
        },

        data: {
          status: "DELIVERED",

          deliveredAt: new Date(),
        },

        include: {
          purchaseOrder: true,

          sourceWarehouse: true,

          destinationWarehouse: true,

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

      /*
       * Update PO.
       */

      /*
       * Update PO status based on all dispatches.
       */

      const purchaseOrderItems = await tx.purchaseOrderItem.findMany({
        where: {
          purchaseOrderId: dispatch.purchaseOrderId,
        },
      });

      const allDispatches = await tx.dispatch.findMany({
        where: {
          purchaseOrderId: dispatch.purchaseOrderId,
        },
        include: {
          items: true,
        },
      });

      const allItemsDelivered = purchaseOrderItems.every((poItem) => {
        const deliveredQuantity = allDispatches
          .filter((d) => d.status === "DELIVERED")
          .flatMap((d) => d.items)
          .filter((item) => item.batchId === poItem.batchId)
          .reduce((total, item) => total + item.quantity, 0);

        return deliveredQuantity >= poItem.quantity;
      });

      const anyDispatchStarted = allDispatches.some(
        (d) => d.status === "DISPATCHED" || d.status === "DELIVERED",
      );

      await tx.purchaseOrder.update({
        where: {
          id: dispatch.purchaseOrderId,
        },
        data: {
          status: allItemsDelivered
            ? "DELIVERED"
            : anyDispatchStarted
              ? "DISPATCHED"
              : "APPROVED",
        },
      });

      return updatedDispatch;
    }

    /*
     * =====================================================
     * 10. INVALID STATUS
     * =====================================================
     */

    throw new Error("Invalid dispatch status transition");
  });
};
