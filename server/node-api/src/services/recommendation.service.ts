import { getRecommendationData } from "../repositories/recommendation.repository";

type RecommendationInventoryItem = {
  warehouseId: string;
  warehouse: {
    warehouseName: string;
  };
  batchId: string;
  quantity: number;
  batch: {
    batchNumber: string;
    medicineId: string;
    medicine: {
      id: string;
      medicineName: string;
    };
  };
};

type RecommendationSaleItem = {
  quantity: number;
  batch: {
    medicineId: string;
  };
};

export const generateRecommendations = async (
  companyId: string,
  days: number = 30,
) => {
  const { inventory, sales } = await getRecommendationData(companyId, days);

  console.log("========== RECOMMENDATION DEBUG ==========");
  console.log("Company ID:", companyId);
  console.log("Days:", days);
  console.log("Inventory count:", inventory.length);
  console.log("Sales count:", sales.length);
  console.log("Inventory:", inventory);
  console.log("Sales:", sales);
  console.log("==========================================");

  const salesByMedicine = new Map<string, number>();

  for (const sale of sales as RecommendationSaleItem[]) {
    const medicineId = sale.batch.medicineId;

    const current = salesByMedicine.get(medicineId) || 0;

    salesByMedicine.set(medicineId, current + sale.quantity);
  }

  const recommendations = (inventory as RecommendationInventoryItem[]).map(
    (item) => {
      const medicine = item.batch.medicine;

      const sold = salesByMedicine.get(medicine.id) || 0;

      const averageDailyDemand = sold / days;

      const targetStock = Math.ceil(averageDailyDemand * days);

      const recommendedQuantity = Math.max(0, targetStock - item.quantity);

      return {
        medicineId: medicine.id,
        medicineName: medicine.medicineName,

        warehouseId: item.warehouseId,

        warehouseName: item.warehouse.warehouseName,

        batchId: item.batchId,

        batchNumber: item.batch.batchNumber,  

        currentStock: item.quantity,

        soldLastDays: sold,

        averageDailyDemand: Number(averageDailyDemand.toFixed(2)),

        targetStock,

        recommendedQuantity,
      };
    },
  );

  return recommendations.filter((item) => item.recommendedQuantity > 0);
};
