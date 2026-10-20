import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  ShieldCheck,
  Warehouse,
  Pill,
  Users,
} from "lucide-react";

import MainLayout from "../../../layouts/MainLayout";

type Company = {
  id: string;
  companyName: string;
  companyType: string;
  email: string;
  phone?: string | null;
  gstNumber?: string | null;
  drugLicenseNumber?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  status: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;

  warehouses: Warehouse[];
  medicines: Medicine[];
  users: CompanyUser[];
};

type Warehouse = {
  id: string;
  warehouseName: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type Medicine = {
  id: string;
  medicineName: string;
  genericName?: string | null;
  strength?: string | null;
  dosageForm?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type CompanyUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type CompanyResponse = {
  success: boolean;
  data?: Company;
  message?: string;
};

function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] =
    useState<Company | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          throw new Error(
            "Company ID is missing"
          );
        }

        const token =
          localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Authentication token not found"
          );
        }

        const response = await fetch(
          `http://localhost:5000/api/companies/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          }
        );

        const result: CompanyResponse =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to fetch company"
          );
        }

        if (!result.data) {
          throw new Error(
            "Company data not found"
          );
        }

        setCompany(result.data);
      } catch (err) {
        console.error(
          "Fetch company error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load company"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  if (loading) {
    return (
      <MainLayout role="admin">
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <p className="text-gray-600">
            Loading company details...
          </p>
        </div>
      </MainLayout>
    );
  }

  if (error || !company) {
    return (
      <MainLayout role="admin">
        <div className="space-y-4">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:underline"
          >
            <ArrowLeft size={18} />
            Back to Companies
          </button>

          <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-6">
            {error || "Company not found"}
          </div>

        </div>
      </MainLayout>
    );
  }

  const location = [
    company.address,
    company.city,
    company.state,
    company.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <MainLayout role="admin">
      <div className="space-y-6">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Companies
        </button>

        <div className="bg-white rounded-xl shadow-sm border p-6">

          <div className="flex justify-between items-start">

            <div className="flex gap-4">

              <div className="bg-blue-100 text-blue-600 p-4 rounded-xl">
                <Building2 size={36} />
              </div>

              <div>

                <h1 className="text-3xl font-bold text-gray-800">
                  {company.companyName}
                </h1>

                <p className="text-gray-500 mt-1">
                  {company.companyType}
                </p>

              </div>

            </div>

            <div className="flex gap-3">

              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
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

              {company.isVerified && (
                <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  <ShieldCheck size={16} />
                  Verified
                </span>
              )}

            </div>

          </div>

        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">

          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Company Information
          </h2>

          <div className="grid grid-cols-2 gap-6">

            <InfoItem
              icon={<Mail size={20} />}
              label="Email"
              value={company.email}
            />

            <InfoItem
              icon={<Phone size={20} />}
              label="Phone"
              value={
                company.phone ||
                "Not provided"
              }
            />

            <InfoItem
              icon={<FileText size={20} />}
              label="GST Number"
              value={
                company.gstNumber ||
                "Not provided"
              }
            />

            <InfoItem
              icon={<FileText size={20} />}
              label="Drug License Number"
              value={
                company.drugLicenseNumber ||
                "Not provided"
              }
            />

            <InfoItem
              icon={<MapPin size={20} />}
              label="Address"
              value={
                location ||
                "Not provided"
              }
              fullWidth
            />

          </div>

        </div>

        <div className="grid grid-cols-3 gap-6">

          <StatBox
            icon={<Warehouse size={26} />}
            label="Warehouses"
            value={
              company.warehouses.length
            }
          />

          <StatBox
            icon={<Pill size={26} />}
            label="Medicines"
            value={
              company.medicines.length
            }
          />

          <StatBox
            icon={<Users size={26} />}
            label="Users"
            value={
              company.users.length
            }
          />

        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">

          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Account Information
          </h2>

          <div className="grid grid-cols-2 gap-6">

            <InfoItem
              label="Company ID"
              value={company.id}
            />

            <InfoItem
              label="Verification Status"
              value={
                company.isVerified
                  ? "Verified"
                  : "Not Verified"
              }
            />

            <InfoItem
              label="Created"
              value={new Date(
                company.createdAt
              ).toLocaleString()}
            />

            <InfoItem
              label="Last Updated"
              value={new Date(
                company.updatedAt
              ).toLocaleString()}
            />

          </div>

        </div>

      </div>
    </MainLayout>
  );
}

type InfoItemProps = {
  icon?: ReactNode;
  label: string;
  value: string;
  fullWidth?: boolean;
};

function InfoItem({
  icon,
  label,
  value,
  fullWidth = false,
}: InfoItemProps) {
  return (
    <div
      className={
        fullWidth
          ? "col-span-2"
          : ""
      }
    >

      <p className="text-sm text-gray-500 mb-1">
        {label}
      </p>

      <div className="flex items-center gap-2 font-medium text-gray-800">

        {icon && (
          <span className="text-blue-600">
            {icon}
          </span>
        )}

        <span>{value}</span>

      </div>

    </div>
  );
}

type StatBoxProps = {
  icon: ReactNode;
  label: string;
  value: number;
};

function StatBox({
  icon,
  label,
  value,
}: StatBoxProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">

      <div className="flex items-center gap-3">

        <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
          {icon}
        </div>

        <div>

          <p className="text-sm text-gray-500">
            {label}
          </p>

          <p className="text-2xl font-bold text-gray-800">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}

export default CompanyDetails;