import { Router } from "express";

import {
  getWarehousesController,
  getWarehouseController,
  createWarehouseController,
  updateWarehouseController,
  deleteWarehouseController,
} from "../controllers/warehouse.controller";

import {
  authenticate,
  requireCompany,
} from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  requireCompany,
  getWarehousesController
);

router.get(
  "/:id",
  authenticate,
  requireCompany,
  getWarehouseController
);

router.post(
  "/",
  authenticate,
  requireCompany,
  createWarehouseController
);

router.put(
  "/:id",
  authenticate,
  requireCompany,
  updateWarehouseController
);

router.delete(
  "/:id",
  authenticate,
  requireCompany,
  deleteWarehouseController
);

export default router;