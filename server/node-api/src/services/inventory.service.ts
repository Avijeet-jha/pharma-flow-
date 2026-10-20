import {
  getInventoryByCompany,
  getInventoryById,
  createInventory,
  updateInventoryQuantity,
  adjustInventory,
  getLowStockInventory,
} from "../repositories/inventory.repository";

export const getInventory = async (
  companyId: string
) => {
  return getInventoryByCompany(companyId);
};

export const getInventoryItem = async (
  inventoryId: string,
  companyId: string
) => {
  return getInventoryById(
    inventoryId,
    companyId
  );
};

export const registerInventory = async (data: {
  warehouseId: string;
  batchId: string;
  quantity: number;
}) => {
  return createInventory(data);
};

export const editInventoryQuantity = async (
  inventoryId: string,
  companyId: string,
  quantity: number
) => {
  return updateInventoryQuantity(
    inventoryId,
    companyId,
    quantity
  );
};

export const updateInventoryStock = async (data: {
  inventoryId: string;
  companyId: string;
  quantity: number;
  type: "ADJUSTMENT" | "DAMAGE";
  notes?: string;
}) => {
  return adjustInventory(data);
};

// =========================================================
// GET LOW STOCK INVENTORY
// =========================================================
export const getLowStockItems = async (
  companyId: string
) => {
  const inventory = await getLowStockInventory(companyId);

  return inventory.map((item) => {
    let stockStatus:
      | "OUT_OF_STOCK"
      | "CRITICAL"
      | "LOW";

    if (item.quantity === 0) {
      stockStatus = "OUT_OF_STOCK";
    } else if (item.quantity <= 10) {
      stockStatus = "CRITICAL";
    } else {
      stockStatus = "LOW";
    }

    return {
      ...item,
      stockStatus,
    };
  });
};