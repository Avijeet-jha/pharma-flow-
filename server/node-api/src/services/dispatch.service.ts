import {
  getDispatchesByCompany,
  getDispatchById,
  createDispatch,
  updateDispatchStatus,
} from "../repositories/dispatch.repository";


export const getDispatches = async (
  companyId: string
) => {
  return getDispatchesByCompany(
    companyId
  );
};


export const getDispatch = async (
  dispatchId: string,
  companyId: string
) => {
  return getDispatchById(
    dispatchId,
    companyId
  );
};


export const registerDispatch = async (data: {
  purchaseOrderId: string;

  sourceWarehouseId: string;

  destinationWarehouseId: string;

  items: {
    batchId: string;
    quantity: number;
  }[];
}) => {
  return createDispatch(data);
};


export const changeDispatchStatus = async (
  dispatchId: string,
  companyId: string,
  status:
    | "PENDING"
    | "DISPATCHED"
    | "DELIVERED"
    | "CANCELLED"
) => {
  return updateDispatchStatus(
    dispatchId,
    companyId,
    status
  );
};