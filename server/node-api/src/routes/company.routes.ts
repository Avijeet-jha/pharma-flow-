import { Router } from "express";

import {
  getCompaniesController,
  createCompanyController,
  approveCompanyController,
  getCompanyDetailsController,
  changeCompanyStatusController,
  getCompanyPerformanceController,
} from "../controllers/company.controller";

import {
  authenticate,
  authorize,
  requireCompany,
} from "../middlewares/auth.middleware";

const router = Router();

/*
|--------------------------------------------------------------------------
| Get all companies
|--------------------------------------------------------------------------
| SUPER_ADMIN only
*/
router.get(
  "/",
  authenticate,
  authorize("SUPER_ADMIN"),
  getCompaniesController
);

/*
|--------------------------------------------------------------------------
| Create / Register company
|--------------------------------------------------------------------------
| Currently public because registration happens
| before company approval.
*/
router.post(
  "/",
  createCompanyController
);

/*
|--------------------------------------------------------------------------
| Temporary company access test
|--------------------------------------------------------------------------
| Keep this BEFORE /:id so "my-company" is not
| treated as a company ID.
*/
router.get(
  "/my-company",
  authenticate,
  requireCompany,
  (req: any, res) => {
    return res.status(200).json({
      success: true,
      message: "Company access verified",
      companyId: req.user.companyId,
    });
  }
);

/*
|--------------------------------------------------------------------------
| Get single company details
|--------------------------------------------------------------------------
| GET /api/companies/:id
|
| SUPER_ADMIN only
*/
router.get(
  "/:id/performance",
  authenticate,
  authorize("SUPER_ADMIN"),
  getCompanyPerformanceController
);

router.get(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN"),
  getCompanyDetailsController
);

/*
|--------------------------------------------------------------------------
| Approve company
|--------------------------------------------------------------------------
| PUT /api/companies/:id/approve
|
| SUPER_ADMIN only
|
| Existing route — keep this because your
| current Approve button already works.
*/
router.put(
  "/:id/approve",
  authenticate,
  authorize("SUPER_ADMIN"),
  approveCompanyController
);

/*
|--------------------------------------------------------------------------
| Change company status
|--------------------------------------------------------------------------
| PATCH /api/companies/:id/status
|
| Request body:
| {
|   "status": "SUSPENDED"
| }
|
| Allowed:
| ACTIVE
| SUSPENDED
| REJECTED
|
| SUPER_ADMIN only
*/
router.patch(
  "/:id/status",
  authenticate,
  authorize("SUPER_ADMIN"),
  changeCompanyStatusController
);

export default router;  