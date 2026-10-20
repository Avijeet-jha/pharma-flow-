import { Router } from "express";

import {
  getCompanyDocumentsController,
  getCompanyDocumentController,
  createCompanyDocumentController,
  updateCompanyDocumentStatusController,
  getAllCompanyDocumentsController,
} from "../controllers/companyDocument.controller";

import { uploadCompanyDocument } from "../middlewares/upload.middleware";

import {
  authenticate,
  authorize,
} from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/upload",
  authenticate,
  authorize("SUPER_ADMIN"),
  uploadCompanyDocument.single("document"),
  createCompanyDocumentController
);

router.get(
  "/company/:companyId",
  authenticate,
  authorize("SUPER_ADMIN"),
  getCompanyDocumentsController
);

router.get(
  "/",
  authenticate,
  authorize("SUPER_ADMIN"),
  getAllCompanyDocumentsController
);


router.patch(
  "/:documentId/status",
  authenticate,
  authorize("SUPER_ADMIN"),
  updateCompanyDocumentStatusController
);

router.get(
  "/:documentId",
  authenticate,
  authorize("SUPER_ADMIN"),
  getCompanyDocumentController
);

export default router;