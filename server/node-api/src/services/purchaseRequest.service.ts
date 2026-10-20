import {
  getPurchaseRequestsByCompany,
  getPurchaseRequestById,
  createPurchaseRequest,
  approvePurchaseRequest,
  rejectPurchaseRequest,
  cancelPurchaseRequest,
  acceptPurchaseRequest,
  declinePurchaseRequest,
} from "../repositories/purchaseRequest.repository";

export const getPurchaseRequests = async (
  companyId: string
) => {
  return getPurchaseRequestsByCompany(
    companyId
  );
};

export const getPurchaseRequest = async (
  requestId: string,
  companyId: string
) => {
  return getPurchaseRequestById(
    requestId,
    companyId
  );
};

export const registerPurchaseRequest = async (
  data: {
    requestNumber: string;
    buyerCompanyId: string;
    sellerCompanyId: string;
    preferredDeliveryDate?: Date;
    requirement?: string;
    items: {
      medicineId: string;
      requestedQuantity: number;
    }[];
  }
) => {
  return createPurchaseRequest(data);
};

export const approveRequest = async (
  requestId: string,
  companyId: string,
  items: {
    itemId: string;
    approvedQuantity: number;
    unitPrice: number;
    batchId: string;
  }[],
  preferredDeliveryDate?: Date
) => {
  return approvePurchaseRequest(
    requestId,
    companyId,
    items,
    preferredDeliveryDate
  );
};

export const rejectRequest = async (
  requestId: string,
  companyId: string
) => {
  return rejectPurchaseRequest(
    requestId,
    companyId
  );
};

export const cancelRequest = async (
  requestId: string,
  companyId: string
) => {
  return cancelPurchaseRequest(
    requestId,
    companyId
  );
};

export const acceptRequest = async (
  requestId: string,
  companyId: string
) => {
  return acceptPurchaseRequest(
    requestId,
    companyId
  );
};

export const declineRequest = async (
  requestId: string,
  companyId: string
) => {
  return declinePurchaseRequest(
    requestId,
    companyId
  );
};