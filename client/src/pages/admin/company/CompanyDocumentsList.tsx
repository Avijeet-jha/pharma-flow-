import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";

type CompanyDocument = {
  id: string;
  companyId: string;
  documentType: string;
  fileName?: string | null;
  fileUrl?: string | null;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  rejectionReason?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  company: {
    id: string;
    companyName: string;
    companyType: string;
    status: string;
  };
};

type DocumentsResponse = {
  success: boolean;
  data: CompanyDocument[];
  message?: string;
};

function CompanyDocumentsList() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<
    CompanyDocument[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // Search and filter
  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      "ALL" | "PENDING" | "VERIFIED" | "REJECTED"
    >("ALL");

  /*
  |--------------------------------------------------------------------------
  | Fetch all company documents
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Authentication token not found"
          );
        }

        const response = await fetch(
          "http://localhost:5000/api/company-documents",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result: DocumentsResponse =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to fetch company documents"
          );
        }

        setDocuments(
          result.data || []
        );
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

    fetchDocuments();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Status badge styling
  |--------------------------------------------------------------------------
  */

  const getStatusStyle = (
    status: CompanyDocument["status"]
  ) => {
    switch (status) {
      case "VERIFIED":
        return "bg-green-100 text-green-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "PENDING":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Format document type
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | Filter documents
  |--------------------------------------------------------------------------
  */

  const filteredDocuments = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesSearch =
        !searchValue ||
        document.company.companyName
          .toLowerCase()
          .includes(searchValue) ||
        document.documentType
          .toLowerCase()
          .includes(searchValue) ||
        (document.fileName || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        document.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    documents,
    search,
    statusFilter,
  ]);

  return (
    <MainLayout role="admin">

      <div className="space-y-6">

        {/* =========================
            PAGE HEADER
        ========================= */}

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Company Documents
          </h1>

          <p className="text-gray-500 mt-1">
            Review documents submitted by all companies.
          </p>
        </div>


        {/* =========================
            LOADING
        ========================= */}

        {loading && (
          <div className="bg-white rounded-xl border shadow-sm p-8 text-center">
            <p className="text-gray-500">
              Loading company documents...
            </p>
          </div>
        )}


        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-6">
            <p className="font-medium">
              {error}
            </p>
          </div>
        )}


        {/* =========================
            SEARCH & FILTERS
        ========================= */}

        {!loading && !error && (
          <div className="bg-white rounded-xl border shadow-sm p-4">

            <div className="flex flex-col md:flex-row gap-4">

              {/* Search */}

              <div className="flex-1">

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Documents
                </label>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search company, document type or file name..."
                  className="
                    w-full
                    px-4
                    py-2.5
                    border
                    border-gray-300
                    rounded-lg
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                />

              </div>


              {/* Status Filter */}

              <div className="w-full md:w-56">

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as
                        | "ALL"
                        | "PENDING"
                        | "VERIFIED"
                        | "REJECTED"
                    )
                  }
                  className="
                    w-full
                    px-4
                    py-2.5
                    border
                    border-gray-300
                    rounded-lg
                    bg-white
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                >

                  <option value="ALL">
                    All Statuses
                  </option>

                  <option value="PENDING">
                    Pending
                  </option>

                  <option value="VERIFIED">
                    Verified
                  </option>

                  <option value="REJECTED">
                    Rejected
                  </option>

                </select>

              </div>

            </div>

          </div>
        )}


        {/* =========================
            DOCUMENT TABLE
        ========================= */}

        {!loading && !error && (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-100">

                  <tr className="text-left">

                    <th className="p-4">
                      Company
                    </th>

                    <th className="p-4">
                      Company Type
                    </th>

                    <th className="p-4">
                      Document
                    </th>

                    <th className="p-4">
                      File
                    </th>

                    <th className="p-4">
                      Status
                    </th>

                    <th className="p-4">
                      Details
                    </th>

                    <th className="p-4">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredDocuments.length === 0 ? (

                    <tr>

                      <td
                        colSpan={7}
                        className="p-10 text-center text-gray-500"
                      >
                        {documents.length === 0
                          ? "No company documents found."
                          : "No documents match your search or filter."}
                      </td>

                    </tr>

                  ) : (

                    filteredDocuments.map(
                      (document) => (

                        <tr
                          key={document.id}
                          className="border-t hover:bg-gray-50"
                        >

                          {/* Company */}

                          <td className="p-4">

                            <div className="font-medium text-gray-800">
                              {document.company.companyName}
                            </div>

                            <div className="text-xs text-gray-500 mt-1">
                              {document.company.status}
                            </div>

                          </td>


                          {/* Company Type */}

                          <td className="p-4">

                            <span className="text-sm">
                              {document.company.companyType}
                            </span>

                          </td>


                          {/* Document Type */}

                          <td className="p-4">

                            <span className="font-medium">
                              {formatDocumentType(
                                document.documentType
                              )}
                            </span>

                          </td>


                          {/* File */}

                          <td className="p-4">

                            <span className="text-sm text-gray-600">
                              {document.fileName ||
                                "No file name"}
                            </span>

                          </td>


                          {/* Status */}

                          <td className="p-4">

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                                document.status
                              )}`}
                            >
                              {document.status}
                            </span>

                          </td>


                          {/* Details */}

                          <td className="p-4">

                            {document.status ===
                              "REJECTED" &&
                            document.rejectionReason ? (

                              <div className="max-w-xs">

                                <p className="text-xs font-medium text-red-600">
                                  Rejection reason:
                                </p>

                                <p className="text-xs text-gray-600 mt-1">
                                  {document.rejectionReason}
                                </p>

                              </div>

                            ) : document.status ===
                              "VERIFIED" &&
                              document.verifiedAt ? (

                              <div>

                                <p className="text-xs font-medium text-green-600">
                                  Verified on:
                                </p>

                                <p className="text-xs text-gray-600 mt-1">
                                  {new Date(
                                    document.verifiedAt
                                  ).toLocaleDateString()}
                                </p>

                              </div>

                            ) : (

                              <span className="text-xs text-gray-400">
                                No additional details
                              </span>

                            )}

                          </td>


                          {/* Action */}

                          <td className="p-4">

                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/company-management/documents/${document.companyId}`
                                )
                              }
                              className="
                                text-blue-600
                                hover:text-blue-800
                                hover:underline
                                font-medium
                              "
                            >
                              View
                            </button>

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </div>

    </MainLayout>
  );
}

export default CompanyDocumentsList;  