import { Response } from "express";

import {
  getPartners,
  getCatalog,
} from "../services/supply-chain.service";

import { AuthRequest } from "../middlewares/auth.middleware";


/* =========================================================
   GET SUPPLY CHAIN PARTNERS
========================================================= */

export const getPartnersController = async (
  req: AuthRequest,
  res: Response
) => {

  try {

    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Company account required",
      });
    }

    const partners = await getPartners(
      companyId
    );

    return res.status(200).json({
      success: true,
      data: partners,
    });

  } catch (error) {

    console.error(
      "Get supply chain partners error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch supply chain partners",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};


/* =========================================================
   GET SUPPLIER CATALOG
========================================================= */

export const getSupplierCatalogController = async (
  req: AuthRequest,
  res: Response
) => {

  try {

    const companyId = req.user?.companyId;

    const supplierCompanyId =
      String(req.params.companyId);


    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Company account required",
      });
    }


    if (!supplierCompanyId) {
      return res.status(400).json({
        success: false,
        message: "Supplier company ID is required",
      });
    }


    const catalog = await getCatalog(
      companyId,
      supplierCompanyId
    );


    if (!catalog) {
      return res.status(404).json({
        success: false,
        message: "Supplier company not found",
      });
    }


    return res.status(200).json({
      success: true,
      data: catalog,
    });

  } catch (error) {

    console.error(
      "Get supplier catalog error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch supplier catalog",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};