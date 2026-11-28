/* =========================================================
   PURCHASE ORDER API SERVICE
   Centralized API requests for the Purchase Order module.
========================================================= */

type Supplier = {
  id: string;
  companyName: string;
  companyType?: string;
  city?: string;
  state?: string;
};

type Medicine = {
  id: string;
  medicineName: string;
  genericName?: string;
  strength?: string;
  dosageForm?: string;
  manufacturer?: string;
  availableQuantity?: number;
};

type BatchOption = {
  id: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  mrp: number;
  quantity: number;
};

type PurchaseOrderItem = {
  id: string;
  medicineId: string;
  batchId?: string;
  requestedQuantity: number;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  medicine?: {
    id?: string;
    medicineName: string;
    strength?: string;
    dosageForm?: string;
  };
  batch?: {
    id: string;
    batchNumber: string;
    expiryDate: string;
    mrp: number;
  };
};

type PurchaseOrder = {
  id: string;
  orderNumber?: string;
  status?: string;
  totalAmount?: number;
  expectedDate?: string;
  createdAt?: string;
  notes?: string;
  buyerCompanyId?: string;
  sellerCompanyId?: string;

  sellerCompany?: {
    id?: string;
    companyName: string;
    state?: string;
  };

  buyerCompany?: {
    id?: string;
    companyName: string;
    state?: string;
  };

  items?: PurchaseOrderItem[];

  invoice?: {
    id: string;
    invoiceNumber: string;
    status: string;
    totalAmount: number;
  };

  dispatches?: {
    id: string;
    status: string;
  }[];
};

type AvailabilityItem = {
  medicineId: string;
  medicineName: string;
  requestedQuantity: number;
  availableQuantity: number;
  minimumRequiredQuantity: number;
  eligible: boolean;
};

type AvailabilityData = {
  purchaseOrderId: string;
  orderNumber: string;
  status: string;
  buyerCompany: string;
  sellerCompany: string;
  items: AvailabilityItem[];
};

export type ConfirmItemPayload = {
  purchaseOrderItemId: string;
  batchId: string;
  approvedQuantity: number;
  unitPrice: number;
  discountPercent: number;
  gstPercent: number;
};

export type ConfirmOrderPayload = {
  items: ConfirmItemPayload[];
};

export type CreatePurchaseRequestPayload = {
  sellerCompanyId: string;
  preferredDeliveryDate?: string;
  requirement?: string;
  items: {
    medicineId: string;
    requestedQuantity: number;
  }[];
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  medicines?: T;
};

const API_BASE_URL = "http://localhost:5000/api";

function getToken(): string {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiEnvelope<T>> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  let result: ApiEnvelope<T>;
  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an invalid response");
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || `Request failed (${response.status})`);
  }

  return result;
}

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const result = await apiRequest<PurchaseOrder[]>("/purchase-orders");
  return Array.isArray(result.data) ? result.data : [];
}

export async function checkPurchaseOrderAvailability(
  orderId: string
): Promise<AvailabilityData> {
  const result = await apiRequest<AvailabilityData>(
    `/purchase-orders/${encodeURIComponent(orderId)}/availability`
  );
  if (!result.data) throw new Error("Availability details were not returned");
  return result.data;
}

export async function getMedicineBatches(
  medicineId: string
): Promise<BatchOption[]> {
  const result = await apiRequest<BatchOption[]>(
    `/medicine-batches/medicine/${encodeURIComponent(medicineId)}`
  );
  return Array.isArray(result.data) ? result.data : [];
}

export async function confirmPurchaseOrder(
  orderId: string,
  payload: ConfirmOrderPayload
): Promise<void> {
  await apiRequest<unknown>(
    `/purchase-orders/${encodeURIComponent(orderId)}/confirm`,
    { method: "PUT", body: JSON.stringify(payload) }
  );
}

export async function sendPurchaseOrderPaymentReminder(
  orderId: string
): Promise<void> {
  await apiRequest<unknown>(
    `/purchase-orders/${encodeURIComponent(orderId)}/payment-reminder`,
    { method: "POST" }
  );
}

export async function getPurchaseOrderSuppliers(): Promise<Supplier[]> {
  const result = await apiRequest<Supplier[]>("/supply-chain/partners");
  return Array.isArray(result.data) ? result.data : [];
}

export async function getSupplierMedicineCatalog(
  supplierId: string
): Promise<Medicine[]> {
  const result = await apiRequest<Medicine[] | { medicines?: Medicine[] }>(
    `/supply-chain/partners/${encodeURIComponent(supplierId)}/catalog`
  );

  if (Array.isArray(result.data)) return result.data;
  if (result.data && Array.isArray(result.data.medicines)) {
    return result.data.medicines;
  }
  if (Array.isArray(result.medicines)) return result.medicines;
  return [];
}

export async function createPurchaseRequest(
  payload: CreatePurchaseRequestPayload
): Promise<{ message?: string }> {
  const result = await apiRequest<unknown>("/purchase-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { message: result.message };
}
