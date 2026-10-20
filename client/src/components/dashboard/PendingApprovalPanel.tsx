import {
  Building2,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { useEffect, useState } from "react";

type Company = {
  id: string;
  companyName: string;
  companyType:
    | "PHARMA"
    | "WHOLESALER"
    | "RETAILER";
  email: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  status: string;
};

type CompaniesResponse = {
  success: boolean;
  data?: Company[];
  message?: string;
};

function PendingApprovalPanel() {
  const [companies, setCompanies] =
    useState<Company[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadCompanies = async () => {
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
          "http://localhost:5000/api/companies",
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const result: CompaniesResponse =
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

        const pendingCompanies =
          (result.data || []).filter(
            (company) =>
              company.status ===
              "PENDING"
          );

        setCompanies(
          pendingCompanies
        );
      } catch (error) {
        console.error(
          "Fetch pending companies error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load pending companies"
        );
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  const handleApprove = async (
    companyId: string
  ) => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found"
        );
      }

      const response = await fetch(
        `http://localhost:5000/api/companies/${companyId}/approve`,
        {
          method: "PUT",
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
            "Failed to approve company"
        );
      }

      setCompanies(
        (currentCompanies) =>
          currentCompanies.filter(
            (company) =>
              company.id !==
              companyId
          )
      );
    } catch (error) {
      console.error(
        "Approve company error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to approve company"
      );
    }
  };

  const handleReject = (
    companyId: string
  ) => {
    console.log(
      "Reject company:",
      companyId
    );

    alert(
      "Reject functionality will be added next."
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-xl font-bold">
          Pending Company Approvals
        </h2>

        <button className="text-blue-600 hover:underline">
          View All
        </button>

      </div>

      {loading && (
        <p className="text-gray-500">
          Loading pending companies...
        </p>
      )}

      {!loading && error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        companies.length === 0 && (
          <div className="border rounded-xl p-6 text-center">

            <Building2
              className="mx-auto text-gray-400 mb-3"
              size={32}
            />

            <p className="font-medium text-gray-700">
              No pending approvals
            </p>

            <p className="text-sm text-gray-500 mt-1">
              All companies are currently
              approved.
            </p>

          </div>
        )}

      {!loading &&
        !error &&
        companies.length > 0 && (
          <div className="space-y-4">

            {companies.map(
              (company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onApprove={
                    handleApprove
                  }
                  onReject={
                    handleReject
                  }
                />
              )
            )}

          </div>
        )}

    </div>
  );
}

type CompanyCardProps = {
  company: Company;

  onApprove: (
    companyId: string
  ) => void;

  onReject: (
    companyId: string
  ) => void;
};

function CompanyCard({
  company,
  onApprove,
  onReject,
}: CompanyCardProps) {
  const location = [
    company.city,
    company.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="border rounded-xl p-4">

      <div className="flex items-start justify-between">

        <div className="flex gap-3">

          <Building2 className="text-blue-600 mt-1" />

          <div>

            <h3 className="font-semibold">
              {company.companyName}
            </h3>

            <p className="text-sm text-gray-500">
              📍{" "}
              {location ||
                "Location not provided"}
            </p>

            <p className="text-sm text-gray-500">
              🏢 {company.companyType}
            </p>

            <p className="text-sm text-gray-500">
              ✉️ {company.email}
            </p>

          </div>

        </div>

        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
          Pending
        </span>

      </div>

      <div className="flex gap-3 mt-5">

        <button
          onClick={() =>
            onApprove(company.id)
          }
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          <CheckCircle size={18} />
          Approve
        </button>

        <button
          onClick={() =>
            onReject(company.id)
          }
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          <XCircle size={18} />
          Reject
        </button>

      </div>

    </div>
  );
}

export default PendingApprovalPanel;