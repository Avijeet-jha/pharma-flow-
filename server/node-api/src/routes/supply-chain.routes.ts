import { Router } from "express";

import {
  getPartnersController,
  getSupplierCatalogController,
} from "../controllers/supply-chain.controller";

import {
  authenticate,
  requireCompany,
} from "../middlewares/auth.middleware";


const router = Router();


/* =========================================================
   GET SUPPLY CHAIN PARTNERS
========================================================= */

router.get(
  "/partners",
  authenticate,
  requireCompany,
  getPartnersController
);


/* =========================================================
   GET SUPPLIER CATALOG
========================================================= */

router.get(
  "/partners/:companyId/catalog",
  authenticate,
  requireCompany,
  getSupplierCatalogController
);


export default router;