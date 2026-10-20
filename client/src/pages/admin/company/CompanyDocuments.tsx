import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useNavigate,
} from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";

type DocumentStatus =
  | "PENDING"
  | "VERIFIED"
  | "REJECTED";

type CompanyDocument = {
  id: string;
  companyId: string;
  documentType: string;
  fileName?: string | null;
  fileUrl?: string | null;
  status: DocumentStatus;
  rejectionReason?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type Company = {
  id: string;
  companyName: string;
  companyType: string;
  gstNumber?: string | null;
  drugLicenseNumber?: string | null;
  status: string;
};

type CompanyResponse = {
  success: boolean;
  data: Company;
  message?: string;
};

type DocumentsResponse = {
  success: boolean;
  data: CompanyDocument[];
  message?: string;
};

const API_URL = "http://localhost:5000";

function CompanyDocuments() {
  const { companyId } = useParams<{
    companyId: string;
  }>();

  const navigate = useNavigate();

  const [company, setCompany] =
    useState<Company | null>(null);

  const [documents, setDocuments] =
    useState<CompanyDocument[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const getFileUrl = (
    fileUrl?: string | null
  ) => {
    if (!fileUrl) {
      return null;
    }

    if (
      fileUrl.startsWith("http://") ||
      fileUrl.startsWith("https://")
    ) {
      return fileUrl;
    }

    return `${API_URL}${fileUrl}`;
  };

  const formatDocumentType = (
    documentType: string
  ) => {
    return documentType
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const fetchDocuments = useCallback(
    async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found"
        );
      }

      if (!companyId) {
        throw new Error(
          "Company ID not found"
        );
      }

      const companyResponse =
        await fetch(
          `${API_URL}/api/companies/${companyId}`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const companyResult: CompanyResponse =
        await companyResponse.json();

      if (
        !companyResponse.ok ||
        !companyResult.success
      ) {
        throw new Error(
          companyResult.message ||
            "Failed to fetch company"
        );
      }

      setCompany(
        companyResult.data
      );

      const documentsResponse =
        await fetch(
          `${API_URL}/api/company-documents/company/${companyId}`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const documentsResult: DocumentsResponse =
        await documentsResponse.json();

      if (
        !documentsResponse.ok ||
        !documentsResult.success
      ) {
        throw new Error(
          documentsResult.message ||
            "Failed to fetch company documents"
        );
      }

      setDocuments(
        documentsResult.data || []
      );
    },
    [companyId]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        await fetchDocuments();
      } catch (err) {
        console.error(
          "Fetch company documents error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load company documents"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchDocuments]);

  const downloadDocument = async (
    companyDocument: CompanyDocument
  ) => {
    try {
      const fileUrl = getFileUrl(
        companyDocument.fileUrl
      );

      if (!fileUrl) {
        alert(
          "Document file not available."
        );
        return;
      }

      const response =
        await fetch(fileUrl);

      if (!response.ok) {
        throw new Error(
          "Failed to download document"
        );
      }

      const blob =
        await response.blob();

      const blobUrl =
        window.URL.createObjectURL(
          blob
        );

      const link =
        window.document.createElement(
          "a"
        );

      link.href = blobUrl;

      link.download =
        companyDocument.fileName ||
        "company-document";

      window.document.body.appendChild(
        link
      );

      link.click();

      window.document.body.removeChild(
        link
      );

      window.URL.revokeObjectURL(
        blobUrl
      );
    } catch (error) {
      console.error(
        "Download document error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to download document"
      );
    }
  };

  const updateDocumentStatus = async (
    documentId: string,
    status:
      | "VERIFIED"
      | "REJECTED"
  ) => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found"
        );
      }

      let rejectionReason:
        | string
        | undefined;

      if (status === "REJECTED") {
        const reason =
          window.prompt(
            "Enter rejection reason:"
          );

        if (reason === null) {
          return;
        }

        if (!reason.trim()) {
          alert(
            "Rejection reason is required."
          );
          return;
        }

        rejectionReason =
          reason.trim();
      }

      setActionLoading(
        documentId
      );

      const response =
        await fetch(
          `${API_URL}/api/company-documents/${documentId}/status`,
          {
            method: "PATCH",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              status,
              ...(status ===
              "REJECTED"
                ? {
                    rejectionReason,
                  }
                : {}),
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to update document status"
        );
      }

      setDocuments(
        (previous) =>
          previous.map(
            (document) =>
              document.id ===
              documentId
                ? {
                    ...document,
                    status,
                    rejectionReason:
                      status ===
                      "REJECTED"
                        ? rejectionReason
                        : null,
                    verifiedAt:
                      status ===
                      "VERIFIED"
                        ? new Date().toISOString()
                        : null,
                  }
                : document
          )
      );

      alert(
        status === "VERIFIED"
          ? "Document verified successfully."
          : "Document rejected successfully."
      );
    } catch (err) {
      console.error(
        "Update document status error:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to update document status"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusStyle = (
    status: DocumentStatus
  ) => {
    switch (status) {
      case "VERIFIED":
        return "bg-green-100 text-green-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  if (loading) {
    return (
      <MainLayout role="admin">
        <div className="p-8 text-center">
          Loading company documents...
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout role="admin">
        <div className="space-y-6">

          <button
            onClick={() =>
              navigate(
                "/admin/company-management/companies"
              )
            }
            className="text-blue-600 hover:underline"
          >
            ← Back to Companies
          </button>

          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-6">
            {error}
          </div>

        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout role="admin">

      <div className="space-y-6">

        <div>

          <button
            onClick={() =>
              navigate(
                "/admin/company-management/companies"
              )
            }
            className="text-blue-600 hover:underline mb-4"
          >
            ← Back to Companies
          </button>

          <h1 className="text-3xl font-bold text-gray-800">
            Company Documents
          </h1>

          <p className="text-gray-500 mt-1">
            Review documents submitted by{" "}
            {company?.companyName ||
              "company"}
          </p>

        </div>

        {company && (
          <div className="bg-white rounded-xl border shadow-sm p-6">

            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Company Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <p className="text-sm text-gray-500">
                  Company Name
                </p>

                <p className="font-semibold mt-1">
                  {company.companyName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Company Type
                </p>

                <p className="font-semibold mt-1">
                  {company.companyType}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  GST Number
                </p>

                <p className="font-semibold mt-1">
                  {company.gstNumber ||
                    "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Drug License Number
                </p>

                <p className="font-semibold mt-1">
                  {company.drugLicenseNumber ||
                    "Not provided"}
                </p>
              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Company Status
                </p>

                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                    company.status ===
                    "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : company.status ===
                          "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {company.status}
                </span>

              </div>

            </div>

          </div>
        )}

        <div className="bg-white rounded-xl border shadow-sm p-6">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Documents
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Review and verify documents submitted by the company.
              </p>
            </div>

            <div className="text-sm text-gray-500">
              {documents.length} document
              {documents.length !== 1
                ? "s"
                : ""}
            </div>

          </div>

          {documents.length === 0 ? (

            <div className="border rounded-xl p-8 text-center text-gray-500">
              No documents uploaded for this company yet.
            </div>

          ) : (

            <div className="space-y-4">

              {documents.map(
                (document) => {

                  const isLoading =
                    actionLoading ===
                    document.id;

                  const fileUrl =
                    getFileUrl(
                      document.fileUrl
                    );

                  return (

                    <div
                      key={document.id}
                      className="border rounded-xl p-5 hover:shadow-sm transition"
                    >

                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                        <div className="min-w-0">

                          <h3 className="font-semibold text-lg text-gray-800">
                            {formatDocumentType(
                              document.documentType
                            )}
                          </h3>

                          <p className="text-gray-500 mt-1 truncate">
                            {document.fileName ||
                              "No file name"}
                          </p>

                          <p className="text-xs text-gray-400 mt-2">
                            Uploaded on{" "}
                            {new Date(
                              document.createdAt
                            ).toLocaleString()}
                          </p>

                          {document.status ===
                            "REJECTED" &&
                            document.rejectionReason && (

                              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">

                                <p className="text-sm font-semibold text-red-700">
                                  Rejection Reason
                                </p>

                                <p className="text-sm text-red-600 mt-1">
                                  {document.rejectionReason}
                                </p>

                              </div>

                            )}

                          {document.status ===
                            "VERIFIED" &&
                            document.verifiedAt && (

                              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">

                                <p className="text-sm font-semibold text-green-700">
                                  Verified
                                </p>

                                <p className="text-sm text-green-600 mt-1">
                                  {new Date(
                                    document.verifiedAt
                                  ).toLocaleString()}
                                </p>

                              </div>

                            )}

                        </div>

                        <div className="flex items-center gap-3 flex-wrap lg:justify-end">

                          <span
                            className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusStyle(
                              document.status
                            )}`}
                          >
                            {document.status}
                          </span>

                          {fileUrl && (

                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="
                                px-4
                                py-2
                                border
                                border-blue-200
                                rounded-lg
                                text-blue-600
                                hover:bg-blue-50
                                font-medium
                              "
                            >
                              View
                            </a>

                          )}

                          {fileUrl && (

                            <button
                              type="button"
                              onClick={() =>
                                downloadDocument(
                                  document
                                )
                              }
                              className="
                                px-4
                                py-2
                                border
                                border-gray-200
                                rounded-lg
                                text-gray-700
                                hover:bg-gray-50
                                font-medium
                              "
                            >
                              Download
                            </button>

                          )}

                          {document.status ===
                            "PENDING" && (

                            <>

                              <button
                                disabled={
                                  isLoading
                                }
                                onClick={() =>
                                  updateDocumentStatus(
                                    document.id,
                                    "VERIFIED"
                                  )
                                }
                                className="
                                  px-4
                                  py-2
                                  rounded-lg
                                  bg-green-600
                                  text-white
                                  hover:bg-green-700
                                  disabled:opacity-50
                                  disabled:cursor-not-allowed
                                "
                              >
                                {isLoading
                                  ? "Processing..."
                                  : "Verify"}
                              </button>

                              <button
                                disabled={
                                  isLoading
                                }
                                onClick={() =>
                                  updateDocumentStatus(
                                    document.id,
                                    "REJECTED"
                                  )
                                }
                                className="
                                  px-4
                                  py-2
                                  rounded-lg
                                  bg-red-600
                                  text-white
                                  hover:bg-red-700
                                  disabled:opacity-50
                                  disabled:cursor-not-allowed
                                "
                              >
                                {isLoading
                                  ? "Processing..."
                                  : "Reject"}
                              </button>

                            </>

                          )}

                        </div>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </div>

      </div>

    </MainLayout>
  );
}

export default CompanyDocuments;