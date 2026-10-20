import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import KPICard from "../../../components/cards/KPICard";

import {
  Building2,
  CircleCheckBig,
  Clock3,
  MoreVertical,
} from "lucide-react";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Company = {
  id: string;
  companyName: string;
  companyType: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  status: string;
  isVerified: boolean;
  createdAt: string;
};

type CompaniesResponse = {
  success: boolean;
  data: Company[];
  message?: string;
};

const exportOptions = [
  {
    id: 1,
    label: "Export as PDF",
    value: "pdf",
  },
  {
    id: 2,
    label: "Export as Excel",
    value: "xlsx",
  },
  {
    id: 3,
    label: "Export as CSV",
    value: "csv",
  },
];

function CompanyApprovals() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        "http://localhost:5000/api/companies",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result: CompaniesResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch companies"
        );
      }

      setCompanies(result.data || []);
    } catch (err) {
      console.error("Fetch companies error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load companies"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setOpenActionMenu(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleApprove = async (companyId: string) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `http://localhost:5000/api/companies/${companyId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to approve company"
        );
      }

      setCompanies((currentCompanies) =>
        currentCompanies.map((company) =>
          company.id === companyId
            ? {
                ...company,
                status: "ACTIVE",
                isVerified: true,
              }
            : company
        )
      );
    } catch (err) {
      console.error("Approve company error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to approve company"
      );
    }
  };

  const handleReject = async (companyId: string) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `http://localhost:5000/api/companies/${companyId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "REJECTED",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to reject company"
        );
      }

      setCompanies((currentCompanies) =>
        currentCompanies.map((company) =>
          company.id === companyId
            ? {
                ...company,
                status: "REJECTED",
                isVerified: false,
              }
            : company
        )
      );
    } catch (err) {
      console.error("Reject company error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to reject company"
      );
    }
  };

  const companyTypes: string[] = [
    ...new Set(
      companies
        .map((company) => company.companyType)
        .filter(
          (type): type is string => Boolean(type)
        )
    ),
  ];

  const cities: string[] = [
    ...new Set(
      companies
        .map((company) => company.city)
        .filter(
          (city): city is string => Boolean(city)
        )
    ),
  ];

  const statuses: string[] = [
    ...new Set(
      companies
        .map((company) => company.status)
        .filter(
          (status): status is string => Boolean(status)
        )
    ),
  ];

  const filteredCompanies = companies.filter((company) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      company.companyName
        .toLowerCase()
        .includes(searchValue) ||
      company.email
        .toLowerCase()
        .includes(searchValue) ||
      (company.city || "")
        .toLowerCase()
        .includes(searchValue) ||
      (company.state || "")
        .toLowerCase()
        .includes(searchValue);

    const matchesType =
      selectedType === "" ||
      company.companyType === selectedType;

    const matchesCity =
      selectedCity === "" ||
      company.city === selectedCity;

    const matchesStatus =
      selectedStatus === "" ||
      company.status === selectedStatus;

    return (
      matchesSearch &&
      matchesType &&
      matchesCity &&
      matchesStatus
    );
  });

  const pendingCount = companies.filter(
    (company) => company.status === "PENDING"
  ).length;

  const activeCount = companies.filter(
    (company) => company.status === "ACTIVE"
  ).length;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getExportData = () => {
    return filteredCompanies.map((company) => ({
      "Company Name": company.companyName,
      Type: company.companyType,
      Email: company.email,
      Phone: company.phone || "—",
      City: company.city || "—",
      State: company.state || "—",
      "Registration Date": formatDate(
        company.createdAt
      ),
      Status: company.status,
    }));
  };

  const exportCSV = () => {
    const data = getExportData();

    if (data.length === 0) {
      alert("There are no companies to export.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "company-approvals.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    const data = getExportData();

    if (data.length === 0) {
      alert("There are no companies to export.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Company Approvals"
    );

    XLSX.writeFile(
      workbook,
      "company-approvals.xlsx"
    );
  };

  const exportPDF = () => {
    const data = getExportData();

    if (data.length === 0) {
      alert("There are no companies to export.");
      return;
    }

    const doc = new jsPDF("landscape");

    doc.setFontSize(18);

    doc.text(
      "PharmaFlow - Company Approvals",
      14,
      15
    );

    doc.setFontSize(10);

    doc.text(
      `Generated on ${new Date().toLocaleDateString(
        "en-IN"
      )}`,
      14,
      22
    );

    autoTable(doc, {
      startY: 28,

      head: [
        [
          "Company",
          "Type",
          "Email",
          "Phone",
          "City",
          "State",
          "Registration",
          "Status",
        ],
      ],

      body: data.map((company) => [
        company["Company Name"],
        company.Type,
        company.Email,
        company.Phone,
        company.City,
        company.State,
        company["Registration Date"],
        company.Status,
      ]),

      styles: {
        fontSize: 7,
        cellPadding: 3,
      },

      headStyles: {
        fontSize: 7,
      },
    });

    doc.save("company-approvals.pdf");
  };

  const handleExport = (value: string) => {
    setShowExportMenu(false);

    if (value === "pdf") {
      exportPDF();
      return;
    }

    if (value === "xlsx") {
      exportExcel();
      return;
    }

    if (value === "csv") {
      exportCSV();
      return;
    }
  };

  return (
    <MainLayout role="admin">
      <div className="space-y-6">

        <p className="text-sm text-gray-500">
          Dashboard &gt; Company Management &gt; Company Approvals
        </p>

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Company Approvals
          </h1>

          <p className="text-gray-500 mt-1">
            Review, approve and manage company registrations.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">

          <KPICard
            title="Total Companies"
            value={companies.length}
            icon={<Building2 size={28} />}
            onClick={() => {
              setSelectedStatus("");
            }}
          />

          <KPICard
            title="Pending Approval"
            value={pendingCount}
            icon={<Clock3 size={28} />}
            onClick={() => {
              setSelectedStatus("PENDING");
            }}
          />

          <KPICard
            title="Active Companies"
            value={activeCount}
            icon={<CircleCheckBig size={28} />}
            onClick={() => {
              setSelectedStatus("ACTIVE");
            }}
          />

        </div>

        {loading && (
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            Loading companies...
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl border border-red-200 p-6">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>

            <div className="bg-white rounded-xl shadow-sm border p-4">

              <div className="flex justify-between items-center">

                <div className="flex gap-3">

                  <input
                    type="text"
                    placeholder="🔍 Search company, email or city..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    className="
                      border
                      rounded-lg
                      px-4
                      py-2
                      w-80
                      outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  />

                  <select
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value)
                    }
                    className="border rounded-lg px-3 py-2"
                  >
                    <option value="">
                      All Status
                    </option>

                    {statuses.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedType}
                    onChange={(e) =>
                      setSelectedType(e.target.value)
                    }
                    className="border rounded-lg px-3 py-2"
                  >
                    <option value="">
                      All Types
                    </option>

                    {companyTypes.map((type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedCity}
                    onChange={(e) =>
                      setSelectedCity(e.target.value)
                    }
                    className="border rounded-lg px-3 py-2"
                  >
                    <option value="">
                      All Cities
                    </option>

                    {cities.map((city) => (
                      <option
                        key={city}
                        value={city}
                      >
                        {city}
                      </option>
                    ))}
                  </select>

                </div>

                <div className="relative">

                  <button
                    onClick={() =>
                      setShowExportMenu(
                        !showExportMenu
                      )
                    }
                    className="
                      border
                      px-5
                      py-2
                      rounded-lg
                      hover:bg-gray-100
                    "
                  >
                    Export ▼
                  </button>

                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20">

                      {exportOptions.map(
                        (option) => (
                          <button
                            key={option.id}
                            onClick={() =>
                              handleExport(
                                option.value
                              )
                            }
                            className="
                              w-full
                              text-left
                              px-4
                              py-2
                              hover:bg-gray-100
                            "
                          >
                            {option.label}
                          </button>
                        )
                      )}

                    </div>
                  )}

                </div>

              </div>

            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-100">

                    <tr className="text-left">

                      <th className="p-4">
                        Company
                      </th>

                      <th className="p-4">
                        Type
                      </th>

                      <th className="p-4">
                        Email
                      </th>

                      <th className="p-4">
                        City
                      </th>

                      <th className="p-4">
                        State
                      </th>

                      <th className="p-4">
                        Registration Date
                      </th>

                      <th className="p-4">
                        Status
                      </th>

                      <th className="p-4">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredCompanies.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="p-8 text-center text-gray-500"
                        >
                          No companies found.
                        </td>
                      </tr>
                    ) : (
                      filteredCompanies.map(
                        (company) => (
                          <tr
                            key={company.id}
                            className="border-t hover:bg-gray-50"
                          >

                            <td className="p-4 font-medium whitespace-nowrap">
                              {company.companyName}
                            </td>

                            <td className="p-4 whitespace-nowrap">
                              {company.companyType}
                            </td>

                            <td className="p-4 whitespace-nowrap">
                              {company.email}
                            </td>

                            <td className="p-4 whitespace-nowrap">
                              {company.city || "—"}
                            </td>

                            <td className="p-4 whitespace-nowrap">
                              {company.state || "—"}
                            </td>

                            <td className="p-4 whitespace-nowrap">
                              {formatDate(
                                company.createdAt
                              )}
                            </td>

                            <td className="p-4 whitespace-nowrap">

                              <span
                                className={`px-3 py-1 rounded-full text-sm ${
                                  company.status ===
                                  "ACTIVE"
                                    ? "bg-green-100 text-green-700"
                                    : company.status ===
                                      "PENDING"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : company.status ===
                                      "REJECTED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {company.status}
                              </span>

                            </td>

                            <td className="p-4">

                              <div
                                ref={
                                  openActionMenu ===
                                  company.id
                                    ? actionMenuRef
                                    : null
                                }
                                className="relative inline-block"
                              >

                                <button
                                  onClick={() =>
                                    setOpenActionMenu(
                                      openActionMenu ===
                                        company.id
                                        ? null
                                        : company.id
                                    )
                                  }
                                  className="
                                    flex
                                    items-center
                                    gap-1
                                    text-gray-700
                                    hover:text-blue-600
                                    font-medium
                                  "
                                >
                                  More
                                  <MoreVertical
                                    size={18}
                                  />
                                </button>

                                {openActionMenu ===
                                  company.id && (
                                  <div className="absolute right-0 top-8 w-52 bg-white border rounded-lg shadow-lg z-30">

                                    <button
                                      onClick={() => {
                                        setOpenActionMenu(
                                          null
                                        );

                                        navigate(
                                          `/admin/company-management/companies/${company.id}`
                                        );
                                      }}
                                      className="
                                        w-full
                                        text-left
                                        px-4
                                        py-3
                                        hover:bg-gray-100
                                      "
                                    >
                                      View Details
                                    </button>

                                    <button
                                      onClick={() => {
                                        setOpenActionMenu(
                                          null
                                        );

                                        navigate(
                                          `/admin/company-management/documents/${company.id}`
                                        );
                                      }}
                                      className="
                                        w-full
                                        text-left
                                        px-4
                                        py-3
                                        hover:bg-gray-100
                                      "
                                    >
                                      View Documents
                                    </button>

                                    {company.status ===
                                      "PENDING" && (
                                      <>
                                        <button
                                          onClick={() => {
                                            setOpenActionMenu(
                                              null
                                            );

                                            handleApprove(
                                              company.id
                                            );
                                          }}
                                          className="
                                            w-full
                                            text-left
                                            px-4
                                            py-3
                                            text-green-600
                                            hover:bg-green-50
                                          "
                                        >
                                          Approve Company
                                        </button>

                                        <button
                                          onClick={() => {
                                            setOpenActionMenu(
                                              null
                                            );

                                            handleReject(
                                              company.id
                                            );
                                          }}
                                          className="
                                            w-full
                                            text-left
                                            px-4
                                            py-3
                                            text-red-600
                                            hover:bg-red-50
                                          "
                                        >
                                          Reject Company
                                        </button>
                                      </>
                                    )}

                                  </div>
                                )}

                              </div>

                            </td>

                          </tr>
                        )
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </>
        )}

      </div>
    </MainLayout>
  );
}

export default CompanyApprovals;