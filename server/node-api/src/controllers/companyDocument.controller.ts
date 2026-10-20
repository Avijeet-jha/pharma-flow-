import { Request, Response } from "express";

import {
  createCompanyDocumentService,
  getCompanyDocumentsService,
  getCompanyDocumentByIdService,
  updateCompanyDocumentStatusService,
  getAllCompanyDocumentsService,
} from "../services/companyDocument.service";

export const getCompanyDocumentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const companyId = req.params.companyId as string;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    const documents =
      await getCompanyDocumentsService(companyId);

    return res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error(
      "Get company documents error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch company documents",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};

export const getCompanyDocumentController = async (
  req: Request,
  res: Response
) => {
  try {
    const documentId =
      req.params.documentId as string;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "Document ID is required",
      });
    }

    const document =
      await getCompanyDocumentByIdService(
        documentId
      );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error(
      "Get company document error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch company document",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};

export const createCompanyDocumentController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        companyId,
        documentType,
      } = req.body;

      const file = req.file;

      /*
      |--------------------------------------------------------------------------
      | Validate company and document type
      |--------------------------------------------------------------------------
      */

      if (!companyId || !documentType) {
        return res.status(400).json({
          success: false,
          message:
            "companyId and documentType are required",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Validate uploaded file
      |--------------------------------------------------------------------------
      */

      if (!file) {
        return res.status(400).json({
          success: false,
          message:
            "Document file is required",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Create database record
      |--------------------------------------------------------------------------
      */

      const fileUrl =
        `/uploads/company-documents/${file.filename}`;

      const document =
        await createCompanyDocumentService({
          companyId,
          documentType,
          fileName: file.originalname,
          fileUrl,
        });

      /*
      |--------------------------------------------------------------------------
      | Response
      |--------------------------------------------------------------------------
      */

      return res.status(201).json({
        success: true,
        message:
          "Company document uploaded successfully",
        data: document,
      });

    } catch (error) {

      console.error(
        "Upload company document error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to upload company document",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  };

  export const updateCompanyDocumentStatusController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const documentId =
        req.params.documentId as string;

      const {
        status,
        rejectionReason,
      } = req.body;

      if (!documentId) {
        return res.status(400).json({
          success: false,
          message:
            "Document ID is required",
        });
      }

      const allowedStatuses = [
        "PENDING",
        "VERIFIED",
        "REJECTED",
      ];

      if (
        !status ||
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status. Allowed values: PENDING, VERIFIED, REJECTED",
        });
      }

      if (
        status === "REJECTED" &&
        !rejectionReason
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Rejection reason is required when rejecting a document",
        });
      }

      const document =
        await updateCompanyDocumentStatusService(
          documentId,
          status,
          rejectionReason
        );

      return res.status(200).json({
        success: true,
        message:
          `Document status changed to ${status}`,
        data: document,
      });
    } catch (error) {
      console.error(
        "Update company document status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update company document status",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  };

  export const getAllCompanyDocumentsController = async (
  _req: Request,
  res: Response
) => {
  try {
    const documents =
      await getAllCompanyDocumentsService();

    return res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error(
      "Get all company documents error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch company documents",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};