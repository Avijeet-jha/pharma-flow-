import {
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";

type Company = {
  id: string;
  companyName: string;
  companyType: string;
  email: string;
  phone?: string | null;
  status: string;
  isVerified: boolean;
  createdAt: string;
};

const API_URL = "http://localhost:5000";

function CompanyPerformance() {
  const navigate = useNavigate();

  const [companies, setCompanies] =
    useState<Company[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchCompanies =
      async () => {
        try {
          setLoading(true);
          setError("");

          const token =
            localStorage.getItem(
              "token"
            );

          if (!token) {
            throw new Error(
              "Authentication token not found"
            );
          }

          const response =
            await fetch(
              `${API_URL}/api/companies`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
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
                "Failed to fetch companies"
            );
          }

          setCompanies(
            result.data || []
          );
        } catch (err) {
          console.error(
            "Company performance list error:",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : "Failed to fetch companies"
          );
        } finally {
          setLoading(false);
        }
      };

    fetchCompanies();
  }, []);

  return (
    <MainLayout role="admin">

      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Company Performance
          </h1>

          <p className="text-gray-500 mt-1">
            View sales, purchases, inventory and
            operational performance of companies.
          </p>
        </div>

        {loading && (
          <div className="bg-white rounded-xl border shadow-sm p-8 text-center">
            <p className="text-gray-500">
              Loading companies...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-600">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          companies.length === 0 && (
            <div className="bg-white rounded-xl border shadow-sm p-8 text-center">
              <p className="text-gray-500">
                No companies found.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          companies.length > 0 && (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-50 border-b">

                    <tr>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Company
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Type
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Email
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Status
                      </th>

                      <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y">

                    {companies.map(
                      (company) => (
                        <tr
                          key={
                            company.id
                          }
                          className="hover:bg-gray-50"
                        >

                          <td className="px-6 py-4">

                            <div className="font-medium text-gray-800">
                              {
                                company.companyName
                              }
                            </div>

                          </td>

                          <td className="px-6 py-4">

                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                              {
                                company.companyType
                              }
                            </span>

                          </td>

                          <td className="px-6 py-4 text-sm text-gray-600">
                            {
                              company.email
                            }
                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                company.status ===
                                "ACTIVE"
                                  ? "bg-green-100 text-green-700"
                                  : company.status ===
                                      "PENDING"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : company.status ===
                                        "SUSPENDED"
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-red-100 text-red-700"
                              }`}
                            >
                              {
                                company.status
                              }
                            </span>

                          </td>

                          <td className="px-6 py-4 text-right">

                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/company-management/performance/${company.id}`
                                )
                              }
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                            >
                              View Performance
                            </button>

                          </td>

                        </tr>
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

export default CompanyPerformance;