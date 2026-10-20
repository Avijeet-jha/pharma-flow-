import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import companyRoutes from "./routes/company.routes";
import warehouseRoutes from "./routes/warehouse.routes";
import categoryRoutes from "./routes/category.routes";
import medicineRoutes from "./routes/medicine.routes";
import medicineBatchRoutes from "./routes/medicineBatch.routes";
import inventoryRoutes from "./routes/inventory.routes";
import inventoryTransactionRoutes from "./routes/inventoryTransaction.routes";
import purchaseOrderRoutes from "./routes/purchaseOrder.routes";
import purchaseRequestRoutes from "./routes/purchaseRequest.routes";
import dispatchRoutes from "./routes/dispatch.routes";
import saleRoutes from "./routes/sale.routes";
import returnRoutes from "./routes/return.routes";
import expiryRoutes from "./routes/expiry.routes";
import stockRoutes from "./routes/stock.routes";
import recommendationRoutes from "./routes/recommendation.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import adminDashboardRoutes from "./routes/adminDashboard.routes";
import companyDocumentRoutes from "./routes/companyDocument.routes";
import settingsRoutes from "./routes/settings.routes";
import notificationRoutes from "./routes/notification.routes";
import invoiceRoutes from "./routes/invoice.routes";

// =========================================================
// NEW: SUPPLY CHAIN ROUTES
// =========================================================
import supplyChainRoutes from "./routes/supply-chain.routes";

// =========================================================
// CUSTOMER BALANCE ROUTES
// =========================================================
import customerBalanceRoutes from "./routes/customerBalance.routes";

const app = express();

/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
*/

app.use(helmet());

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/*
|--------------------------------------------------------------------------
| Request Logging
|--------------------------------------------------------------------------
*/

app.use(morgan("dev"));

/*
|--------------------------------------------------------------------------
| Body Parsers
|--------------------------------------------------------------------------
*/

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/*
|--------------------------------------------------------------------------
| Uploaded Files
|--------------------------------------------------------------------------
|
| Company documents are stored inside:
|
| uploads/company-documents/
|
| They can be accessed through:
|
| http://localhost:5000/uploads/...
|
| IMPORTANT:
| This is placed AFTER CORS so the frontend can
| fetch uploaded documents for downloading.
|-------------------------------------------------------------------------- 
*/

app.use(
  "/uploads",
  express.static(
    path.join(
      process.cwd(),
      "uploads"
    )
  )
);

/* INVOICE MODULE */
app.use(
  "/api/invoices",
  invoiceRoutes,
);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message:
      "🚀 PharmaFlow Backend is Running...",
  });
});

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

app.use(
  "/api/auth",
  authRoutes
);

/*
|--------------------------------------------------------------------------
| Company Management
|--------------------------------------------------------------------------
*/

app.use(
  "/api/companies",
  companyRoutes
);

/*
|--------------------------------------------------------------------------
| Warehouse Management
|--------------------------------------------------------------------------
*/

app.use(
  "/api/warehouses",
  warehouseRoutes
);

/*
|--------------------------------------------------------------------------
| Category Management
|--------------------------------------------------------------------------
*/

app.use(
  "/api/categories",
  categoryRoutes
);

/*
|--------------------------------------------------------------------------
| Medicine Management
|--------------------------------------------------------------------------
*/

app.use(
  "/api/medicines",
  medicineRoutes
);

/*
|--------------------------------------------------------------------------
| Medicine Batch Management
|--------------------------------------------------------------------------
*/

app.use(
  "/api/medicine-batches",
  medicineBatchRoutes
);

/*
|--------------------------------------------------------------------------
| Inventory Management
|--------------------------------------------------------------------------
*/

app.use(
  "/api/inventory",
  inventoryRoutes
);

/*
|--------------------------------------------------------------------------
| Inventory Transactions
|--------------------------------------------------------------------------
*/

app.use(
  "/api/inventory-transactions",
  inventoryTransactionRoutes
);

/*
|--------------------------------------------------------------------------
| Purchase Orders
|--------------------------------------------------------------------------
*/

app.use(
  "/api/purchase-orders",
  purchaseOrderRoutes
);

/*
|--------------------------------------------------------------------------
| Supply Chain
|--------------------------------------------------------------------------
|
| Partners
| Supplier Catalog
|
| GET:
| /api/supply-chain/partners
|
| GET:
| /api/supply-chain/partners/:companyId/catalog
|
|--------------------------------------------------------------------------
*/

app.use(
  "/api/supply-chain",
  supplyChainRoutes
);

/*
|--------------------------------------------------------------------------
| Customer Balance
|--------------------------------------------------------------------------
|
| GET:
| /api/customer-balances/wholesaler/:wholesalerCompanyId
|
|--------------------------------------------------------------------------
*/

app.use(
  "/api/customer-balances",
  customerBalanceRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes,
);

/*
|--------------------------------------------------------------------------
| Dispatches
|--------------------------------------------------------------------------
*/

app.use(
  "/api/dispatches",
  dispatchRoutes
);

/*
|--------------------------------------------------------------------------
| Sales
|--------------------------------------------------------------------------
*/

app.use(
  "/api/sales",
  saleRoutes
);

/*
|--------------------------------------------------------------------------
| Returns
|--------------------------------------------------------------------------
*/

app.use(
  "/api/returns",
  returnRoutes
);

/*
|--------------------------------------------------------------------------
| Expiry
|--------------------------------------------------------------------------
*/

app.use(
  "/api/expiry",
  expiryRoutes
);

/*
|--------------------------------------------------------------------------
| Stock
|--------------------------------------------------------------------------
*/

app.use(
  "/api/stock",
  stockRoutes
);

/*
|--------------------------------------------------------------------------
| Recommendations
|--------------------------------------------------------------------------
*/

app.use(
  "/api/recommendations",
  recommendationRoutes
);

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

app.use(
  "/api/dashboard",
  dashboardRoutes
);

/*
|--------------------------------------------------------------------------
| Admin Dashboard
|--------------------------------------------------------------------------
*/

app.use(
  "/api/admin/dashboard",
  adminDashboardRoutes
);

/*
|--------------------------------------------------------------------------
| Company Documents
|--------------------------------------------------------------------------
*/

app.use(
  "/api/company-documents",
  companyDocumentRoutes
);

/*
|--------------------------------------------------------------------------
| Settings
|--------------------------------------------------------------------------
*/

app.use(
  "/api/settings",
  settingsRoutes
);

app.use(
  "/api/purchase-requests",
  purchaseRequestRoutes
);

/*
|--------------------------------------------------------------------------
| Export App
|--------------------------------------------------------------------------
*/

export default app;