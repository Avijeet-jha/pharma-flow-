import prisma from "../config/prisma";

/*
|--------------------------------------------------------------------------
| Create company document
|--------------------------------------------------------------------------
*/
export const createCompanyDocument = async (data: {
  companyId: string;
  documentType: string;
  fileName?: string;
  fileUrl?: string;
}) => {
  return prisma.companyDocument.create({
    data: {
      companyId: data.companyId,
      documentType: data.documentType,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
    },
  });
};


/*
|--------------------------------------------------------------------------
| Get ALL company documents
|--------------------------------------------------------------------------
*/
export const getAllCompanyDocuments = async () => {
  return prisma.companyDocument.findMany({
    orderBy: {
      createdAt: "desc",
    },

    include: {
      company: {
        select: {
          id: true,
          companyName: true,
          companyType: true,
          status: true,
        },
      },
    },
  });
};


/*
|--------------------------------------------------------------------------
| Get documents for one company
|--------------------------------------------------------------------------
*/
export const getCompanyDocuments = async (
  companyId: string
) => {
  return prisma.companyDocument.findMany({
    where: {
      companyId,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};


/*
|--------------------------------------------------------------------------
| Get single company document
|--------------------------------------------------------------------------
*/
export const getCompanyDocumentById = async (
  documentId: string
) => {
  return prisma.companyDocument.findUnique({
    where: {
      id: documentId,
    },
  });
};


/*
|--------------------------------------------------------------------------
| Update company document status
|--------------------------------------------------------------------------
*/
export const updateCompanyDocumentStatus = async (
  documentId: string,
  status: "PENDING" | "VERIFIED" | "REJECTED",
  rejectionReason?: string
) => {
  return prisma.companyDocument.update({
    where: {
      id: documentId,
    },

    data: {
      status,

      rejectionReason:
        status === "REJECTED"
          ? rejectionReason
          : null,

      verifiedAt:
        status === "VERIFIED"
          ? new Date()
          : null,
    },
  });
};