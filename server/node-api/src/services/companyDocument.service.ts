import {
  createCompanyDocument,
  getCompanyDocuments,
  getCompanyDocumentById,
  updateCompanyDocumentStatus,
  getAllCompanyDocuments,
} from "../repositories/companyDocument.repository";

/*
|--------------------------------------------------------------------------
| Create company document
|--------------------------------------------------------------------------
*/
export const createCompanyDocumentService = async (
  data: {
    companyId: string;
    documentType: string;
    fileName?: string;
    fileUrl?: string;
  }
) => {
  return createCompanyDocument(data);
};


/*
|--------------------------------------------------------------------------
| Get all company documents
|--------------------------------------------------------------------------
*/
export const getAllCompanyDocumentsService =
  async () => {
    return getAllCompanyDocuments();
  };


/*
|--------------------------------------------------------------------------
| Get documents for one company
|--------------------------------------------------------------------------
*/
export const getCompanyDocumentsService = async (
  companyId: string
) => {
  return getCompanyDocuments(companyId);
};


/*
|--------------------------------------------------------------------------
| Get single company document
|--------------------------------------------------------------------------
*/
export const getCompanyDocumentByIdService =
  async (documentId: string) => {
    return getCompanyDocumentById(documentId);
  };


/*
|--------------------------------------------------------------------------
| Update company document status
|--------------------------------------------------------------------------
*/
export const updateCompanyDocumentStatusService =
  async (
    documentId: string,
    status:
      | "PENDING"
      | "VERIFIED"
      | "REJECTED",
    rejectionReason?: string
  ) => {
    return updateCompanyDocumentStatus(
      documentId,
      status,
      rejectionReason
    );
  };