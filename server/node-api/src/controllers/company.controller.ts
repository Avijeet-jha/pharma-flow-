import { Request, Response } from "express";

import {
  getCompanies,
  registerCompany,
  approveCompanyService,
  getCompanyDetails,
  changeCompanyStatus,
  getCompanyPerformanceService,
} from "../services/company.service";

/*
|--------------------------------------------------------------------------
| Get all companies
|--------------------------------------------------------------------------
*/
export const getCompaniesController = async (
  _req: Request,
  res: Response
) => {
  try {
    const companies = await getCompanies();

    return res.status(200).json({
      success: true,
      data: companies,
    });
  } catch (error) {
    console.error(
      "Get companies error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch companies",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get single company details
|--------------------------------------------------------------------------
*/
export const getCompanyDetailsController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id as string;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    const company =
      await getCompanyDetails(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error(
      "Get company details error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch company details",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};

/*
|--------------------------------------------------------------------------
| Create / Register company
|--------------------------------------------------------------------------
*/
export const createCompanyController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      companyName,
      companyType,
      email,
      passwordHash,
      phone,
      gstNumber,
      drugLicenseNumber,
      address,
      city,
      state,
      pincode,
    } = req.body;

    if (
      !companyName ||
      !companyType ||
      !email ||
      !passwordHash
    ) {
      return res.status(400).json({
        success: false,
        message:
          "companyName, companyType, email and passwordHash are required",
      });
    }

    const company =
      await registerCompany({
        companyName,
        companyType,
        email,
        passwordHash,
        phone,
        gstNumber,
        drugLicenseNumber,
        address,
        city,
        state,
        pincode,
      });

    return res.status(201).json({
      success: true,
      message:
        "Company registered successfully",
      data: company,
    });
  } catch (error) {
    console.error(
      "Create company error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to register company",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Approve company
|--------------------------------------------------------------------------
*/
export const approveCompanyController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id as string;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    const company =
      await approveCompanyService(id);

    return res.status(200).json({
      success: true,
      message:
        "Company approved successfully",
      data: company,
    });
  } catch (error) {
    console.error(
      "Approve company error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to approve company",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};

/*
|--------------------------------------------------------------------------
| Change company status
|--------------------------------------------------------------------------
*/
export const changeCompanyStatusController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const id =
        req.params.id as string;

      const { status } = req.body;

      /*
      |--------------------------------------------------------------------------
      | Validate company ID
      |--------------------------------------------------------------------------
      */
      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Company ID is required",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Validate status
      |--------------------------------------------------------------------------
      */
      const allowedStatuses = [
        "ACTIVE",
        "SUSPENDED",
        "REJECTED",
      ];

      if (
        !status ||
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status. Allowed values: ACTIVE, SUSPENDED, REJECTED",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Update status
      |--------------------------------------------------------------------------
      */
      const company =
        await changeCompanyStatus(
          id,
          status
        );

      return res.status(200).json({
        success: true,
        message:
          `Company status changed to ${status}`,
        data: company,
      });
    } catch (error) {
      console.error(
        "Change company status error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      /*
      |--------------------------------------------------------------------------
      | Company not found / invalid transition
      |--------------------------------------------------------------------------
      */
      if (
        message === "Company not found"
      ) {
        return res.status(404).json({
          success: false,
          message,
        });
      }

      if (
        message.startsWith(
          "Cannot change company status"
        )
      ) {
        return res.status(400).json({
          success: false,
          message,
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Server error
      |--------------------------------------------------------------------------
      */
      return res.status(500).json({
        success: false,
        message:
          "Failed to change company status",
      });
    }
  };

  export const getCompanyPerformanceController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const id =
        req.params.id as string;

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Company ID is required",
        });
      }

      const performance =
        await getCompanyPerformanceService(
          id
        );

      if (!performance) {
        return res.status(404).json({
          success: false,
          message:
            "Company not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: performance,
      });
    } catch (error) {
      console.error(
        "Get company performance error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch company performance",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  };