import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Power,
  X,
  Pill,
  Package,
  CalendarDays,
  IndianRupee,
} from "lucide-react";

const API_URL = "http://localhost:5000";

type Category = {
  id: string;
  name: string;
  description?: string;
};

type Batch = {
  id: string;
  medicineId: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  mrp: string | number;
  quantity: number;
};

type Medicine = {
  id: string;
  companyId: string;
  categoryId: string;
  medicineName: string;
  genericName?: string;
  strength: string;
  dosageForm: string;
  description?: string;
  isActive: boolean;
  category: Category;
  batches: Batch[];
};

type MedicineForm = {
  categoryId: string;
  medicineName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  description: string;
};

type BatchForm = {
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  mrp: string;
  quantity: string;
};

function MedicineManagement() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [showMedicineForm, setShowMedicineForm] =
    useState(false);

  const [showDetails, setShowDetails] =
    useState(false);

  const [showBatchForm, setShowBatchForm] =
    useState(false);

  const [editingMedicine, setEditingMedicine] =
    useState<Medicine | null>(null);

  const [selectedMedicine, setSelectedMedicine] =
    useState<Medicine | null>(null);

  const [editingBatch, setEditingBatch] =
    useState<Batch | null>(null);

  const [notification, setNotification] =
    useState("");

  const [medicineForm, setMedicineForm] =
    useState<MedicineForm>({
      categoryId: "",
      medicineName: "",
      genericName: "",
      strength: "",
      dosageForm: "",
      description: "",
    });

  const [batchForm, setBatchForm] =
    useState<BatchForm>({
      batchNumber: "",
      manufacturingDate: "",
      expiryDate: "",
      mrp: "",
      quantity: "",
    });

  /* =====================================================
     TOKEN
  ===================================================== */

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      ""
    );
  };

  /* =====================================================
     NOTIFICATION
  ===================================================== */

  const showNotification = (message: string) => {
    setNotification(message);

    window.setTimeout(() => {
      setNotification("");
    }, 2500);
  };

  /* =====================================================
     FETCH MEDICINES
  ===================================================== */

  const fetchMedicines = async () => {
    try {
      const token = getToken();

      if (!token) {
        setError("Unable to load medicines");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/medicines`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch medicines"
        );
      }

      setMedicines(result.data || []);
      setError("");
    } catch (error) {
      console.error(
        "Fetch medicines error:",
        error
      );

      setError("Unable to load medicines");
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      try {
        const token = getToken();

        if (!token) {
          if (!cancelled) {
            setError("Unable to load medicine data");
            setLoading(false);
          }

          return;
        }

        const [medicineResponse, categoryResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/medicines`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),

            fetch(`${API_URL}/api/categories`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        const medicineResult =
          await medicineResponse.json();

        const categoryResult =
          await categoryResponse.json();

        if (
          !medicineResponse.ok ||
          !medicineResult.success
        ) {
          throw new Error(
            medicineResult.message ||
              "Failed to fetch medicines"
          );
        }

        if (
          !categoryResponse.ok ||
          !categoryResult.success
        ) {
          throw new Error(
            categoryResult.message ||
              "Failed to fetch categories"
          );
        }

        if (!cancelled) {
          setMedicines(
            medicineResult.data || []
          );

          setCategories(
            categoryResult.data || []
          );

          setError("");
        }
      } catch (error) {
        console.error(
          "Initial medicine load error:",
          error
        );

        if (!cancelled) {
          setError(
            "Unable to load medicine data"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =====================================================
     FILTER MEDICINES
  ===================================================== */

  const filteredMedicines = medicines.filter(
    (medicine) => {
      const searchText =
        `${medicine.medicineName} ${
          medicine.genericName || ""
        } ${medicine.strength}`.toLowerCase();

      const matchesSearch =
        searchText.includes(
          search.toLowerCase()
        );

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" &&
          medicine.isActive) ||
        (statusFilter === "INACTIVE" &&
          !medicine.isActive);

      const matchesCategory =
        categoryFilter === "ALL" ||
        medicine.categoryId === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    }
  );

  /* =====================================================
     OPEN ADD MEDICINE
  ===================================================== */

  const openAddMedicine = () => {
    setEditingMedicine(null);

    setMedicineForm({
      categoryId:
        categories.length > 0
          ? categories[0].id
          : "",
      medicineName: "",
      genericName: "",
      strength: "",
      dosageForm: "",
      description: "",
    });

    setShowMedicineForm(true);
  };

  /* =====================================================
     OPEN EDIT MEDICINE
  ===================================================== */

  const openEditMedicine = (
    medicine: Medicine
  ) => {
    setEditingMedicine(medicine);

    setMedicineForm({
      categoryId: medicine.categoryId,
      medicineName: medicine.medicineName,
      genericName:
        medicine.genericName || "",
      strength: medicine.strength,
      dosageForm: medicine.dosageForm,
      description:
        medicine.description || "",
    });

    setShowMedicineForm(true);
  };

  /* =====================================================
     SAVE MEDICINE
  ===================================================== */

  const saveMedicine = async () => {
    try {
      const token = getToken();

      if (!token) {
        showNotification(
          "Medicine change unsuccessful"
        );
        return;
      }

      const method = editingMedicine
        ? "PUT"
        : "POST";

      const url = editingMedicine
        ? `${API_URL}/api/medicines/${editingMedicine.id}`
        : `${API_URL}/api/medicines`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoryId:
            medicineForm.categoryId,
          medicineName:
            medicineForm.medicineName,
          genericName:
            medicineForm.genericName || undefined,
          strength:
            medicineForm.strength,
          dosageForm:
            medicineForm.dosageForm,
          description:
            medicineForm.description ||
            undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to save medicine"
        );
      }

      setShowMedicineForm(false);

      showNotification(
        editingMedicine
          ? "Medicine updated successfully"
          : "Medicine created successfully"
      );

      await fetchMedicines();
    } catch (error) {
      console.error(
        "Save medicine error:",
        error
      );

      showNotification(
        "Medicine change unsuccessful"
      );
    }
  };

  /* =====================================================
     DEACTIVATE MEDICINE
  ===================================================== */

  const deactivateMedicine = async (
    medicine: Medicine
  ) => {
    try {
      const token = getToken();

      if (!token) {
        showNotification(
          "Medicine change unsuccessful"
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/api/medicines/${medicine.id}/deactivate`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to deactivate medicine"
        );
      }

      showNotification(
        "Medicine deactivated successfully"
      );

      await fetchMedicines();
    } catch (error) {
      console.error(
        "Deactivate medicine error:",
        error
      );

      showNotification(
        "Medicine change unsuccessful"
      );
    }
  };

  /* =====================================================
     VIEW DETAILS
  ===================================================== */

  const openDetails = (
    medicine: Medicine
  ) => {
    setSelectedMedicine(medicine);
    setShowDetails(true);
  };

  /* =====================================================
     OPEN ADD BATCH
  ===================================================== */

  const openAddBatch = () => {
    setEditingBatch(null);

    setBatchForm({
      batchNumber: "",
      manufacturingDate: "",
      expiryDate: "",
      mrp: "",
      quantity: "",
    });

    setShowBatchForm(true);
  };

  /* =====================================================
     OPEN EDIT BATCH
  ===================================================== */

  const openEditBatch = (
    batch: Batch
  ) => {
    setEditingBatch(batch);

    setBatchForm({
      batchNumber: batch.batchNumber,
      manufacturingDate:
        batch.manufacturingDate.split("T")[0],
      expiryDate:
        batch.expiryDate.split("T")[0],
      mrp: String(batch.mrp),
      quantity: String(batch.quantity),
    });

    setShowBatchForm(true);
  };

  /* =====================================================
     SAVE BATCH
  ===================================================== */

  const saveBatch = async () => {
    if (!selectedMedicine) {
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        showNotification(
          "Batch change unsuccessful"
        );
        return;
      }

      const method = editingBatch
        ? "PUT"
        : "POST";

      const url = editingBatch
        ? `${API_URL}/api/medicine-batches/${editingBatch.id}`
        : `${API_URL}/api/medicine-batches`;

      const body = editingBatch
        ? {
            batchNumber:
              batchForm.batchNumber,
            manufacturingDate:
              batchForm.manufacturingDate,
            expiryDate:
              batchForm.expiryDate,
            mrp: Number(batchForm.mrp),
            quantity:
              Number(batchForm.quantity),
          }
        : {
            medicineId:
              selectedMedicine.id,
            batchNumber:
              batchForm.batchNumber,
            manufacturingDate:
              batchForm.manufacturingDate,
            expiryDate:
              batchForm.expiryDate,
            mrp: Number(batchForm.mrp),
            quantity:
              Number(batchForm.quantity),
          };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to save batch"
        );
      }

      setShowBatchForm(false);

      showNotification(
        editingBatch
          ? "Batch updated successfully"
          : "Batch created successfully"
      );

      await fetchMedicines();

      const refreshedResponse =
        await fetch(
          `${API_URL}/api/medicines/${selectedMedicine.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const refreshedResult =
        await refreshedResponse.json();

      if (
        refreshedResponse.ok &&
        refreshedResult.success
      ) {
        setSelectedMedicine(
          refreshedResult.data
        );
      }
    } catch (error) {
      console.error(
        "Save batch error:",
        error
      );

      showNotification(
        "Batch change unsuccessful"
      );
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">

          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-600">
            Loading medicines...
          </p>

        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="space-y-6">

      {/* =================================================
          NOTIFICATION
      ================================================= */}

      {notification && (
        <div className="fixed top-6 right-6 z-[100] bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl">
          {notification}
        </div>
      )}

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Medicine Management
          </h1>

          <p className="text-slate-500 mt-1">
            Manage medicines, batches and medicine
            information.
          </p>
        </div>

        <button
          onClick={openAddMedicine}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium transition"
        >
          <Plus size={19} />
          Add Medicine
        </button>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* =================================================
          FILTER BAR
      ================================================= */}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="relative">

            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search medicines..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(
                e.target.value
              )
            }
            className="px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">
              All Categories
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">
              All Status
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Inactive
            </option>
          </select>

        </div>

      </div>

      {/* =================================================
          MEDICINE LIST
      ================================================= */}

      {filteredMedicines.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">

          <Pill
            size={50}
            className="mx-auto text-slate-300 mb-4"
          />

          <h3 className="text-lg font-semibold text-slate-700">
            No medicines found
          </h3>

          <p className="text-slate-500 mt-1">
            Try changing your search or filters.
          </p>

        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {filteredMedicines.map(
            (medicine) => (
              <div
                key={medicine.id}
                className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition"
              >

                <div className="p-5 border-b border-slate-100">

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-start gap-3">

                      <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Pill size={24} />
                      </div>

                      <div>

                        <h2 className="text-lg font-semibold text-slate-900">
                          {medicine.medicineName}
                        </h2>

                        <p className="text-sm text-slate-500">
                          {medicine.genericName ||
                            "Generic name not available"}
                        </p>

                      </div>

                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        medicine.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {medicine.isActive
                        ? "ACTIVE"
                        : "INACTIVE"}
                    </span>

                  </div>

                </div>

                <div className="p-5">

                  <div className="grid grid-cols-2 gap-4 text-sm">

                    <div>
                      <p className="text-slate-400">
                        Strength
                      </p>

                      <p className="font-medium text-slate-800 mt-1">
                        {medicine.strength}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400">
                        Dosage Form
                      </p>

                      <p className="font-medium text-slate-800 mt-1">
                        {medicine.dosageForm}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400">
                        Category
                      </p>

                      <p className="font-medium text-slate-800 mt-1">
                        {medicine.category?.name ||
                          "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400">
                        Batches
                      </p>

                      <p className="font-medium text-slate-800 mt-1">
                        {medicine.batches?.length ||
                          0}
                      </p>
                    </div>

                  </div>

                  <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-100">

                    <button
                      onClick={() =>
                        openDetails(medicine)
                      }
                      className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                    >
                      <Eye size={16} />
                      View
                    </button>

                    <button
                      onClick={() =>
                        openEditMedicine(medicine)
                      }
                      className="flex items-center gap-2 px-3 py-2 text-sm border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                    >
                      <Edit size={16} />
                      Edit
                    </button>

                    {medicine.isActive && (
                      <button
                        onClick={() =>
                          deactivateMedicine(
                            medicine
                          )
                        }
                        className="flex items-center gap-2 px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
                      >
                        <Power size={16} />
                        Deactivate
                      </button>
                    )}

                  </div>

                </div>

              </div>
            )
          )}

        </div>
      )}

      {/* =================================================
          MEDICINE FORM MODAL
      ================================================= */}

      {showMedicineForm && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-slate-200">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingMedicine
                    ? "Edit Medicine"
                    : "Add Medicine"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Enter medicine information below.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowMedicineForm(false)
                }
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            <div className="p-6 space-y-5">

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category *
                </label>

                <select
                  value={
                    medicineForm.categoryId
                  }
                  onChange={(e) =>
                    setMedicineForm({
                      ...medicineForm,
                      categoryId:
                        e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    Select Category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Medicine Name *
                </label>

                <input
                  type="text"
                  value={
                    medicineForm.medicineName
                  }
                  onChange={(e) =>
                    setMedicineForm({
                      ...medicineForm,
                      medicineName:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. Paracetamol 500mg"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Generic Name
                </label>

                <input
                  type="text"
                  value={
                    medicineForm.genericName
                  }
                  onChange={(e) =>
                    setMedicineForm({
                      ...medicineForm,
                      genericName:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. Paracetamol"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Strength *
                  </label>

                  <input
                    type="text"
                    value={
                      medicineForm.strength
                    }
                    onChange={(e) =>
                      setMedicineForm({
                        ...medicineForm,
                        strength:
                          e.target.value,
                      })
                    }
                    placeholder="e.g. 500 mg"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Dosage Form *
                  </label>

                  <input
                    type="text"
                    value={
                      medicineForm.dosageForm
                    }
                    onChange={(e) =>
                      setMedicineForm({
                        ...medicineForm,
                        dosageForm:
                          e.target.value,
                      })
                    }
                    placeholder="e.g. Tablet"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>

                <textarea
                  value={
                    medicineForm.description
                  }
                  onChange={(e) =>
                    setMedicineForm({
                      ...medicineForm,
                      description:
                        e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Medicine description..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-200">

              <button
                onClick={() =>
                  setShowMedicineForm(false)
                }
                className="px-5 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={saveMedicine}
                disabled={
                  !medicineForm.categoryId ||
                  !medicineForm.medicineName ||
                  !medicineForm.strength ||
                  !medicineForm.dosageForm
                }
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingMedicine
                  ? "Save Changes"
                  : "Create Medicine"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          MEDICINE DETAILS
      ================================================= */}

      {showDetails &&
        selectedMedicine && (
          <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">

            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">

              <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-slate-200">

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Medicine Details
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    {selectedMedicine.medicineName}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowDetails(false)
                  }
                  className="p-2 rounded-lg hover:bg-slate-100"
                >
                  <X size={20} />
                </button>

              </div>

              <div className="p-6">

                <div className="bg-slate-50 rounded-xl p-5">

                  <div className="flex items-center gap-3 mb-5">

                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                      <Pill size={25} />
                    </div>

                    <div>
                      <h3 className="font-bold text-lg">
                        {
                          selectedMedicine.medicineName
                        }
                      </h3>

                      <p className="text-sm text-slate-500">
                        {
                          selectedMedicine.genericName ||
                          "Generic name not available"
                        }
                      </p>
                    </div>

                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

                    <DetailItem
                      label="Category"
                      value={
                        selectedMedicine.category?.name ||
                        "N/A"
                      }
                    />

                    <DetailItem
                      label="Strength"
                      value={
                        selectedMedicine.strength
                      }
                    />

                    <DetailItem
                      label="Dosage Form"
                      value={
                        selectedMedicine.dosageForm
                      }
                    />

                    <DetailItem
                      label="Status"
                      value={
                        selectedMedicine.isActive
                          ? "Active"
                          : "Inactive"
                      }
                    />

                  </div>

                  {selectedMedicine.description && (
                    <div className="mt-5">

                      <p className="text-sm text-slate-400">
                        Description
                      </p>

                      <p className="text-sm text-slate-700 mt-1">
                        {
                          selectedMedicine.description
                        }
                      </p>

                    </div>
                  )}

                </div>

                <div className="mt-6">

                  <div className="flex items-center justify-between mb-4">

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Medicine Batches
                      </h3>

                      <p className="text-sm text-slate-500">
                        Manage batches associated with this medicine.
                      </p>
                    </div>

                    <button
                      onClick={openAddBatch}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus size={17} />
                      Add Batch
                    </button>

                  </div>

                  {selectedMedicine.batches?.length ===
                  0 ? (
                    <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center">

                      <Package
                        size={40}
                        className="mx-auto text-slate-300 mb-3"
                      />

                      <p className="font-medium text-slate-700">
                        No batches available
                      </p>

                      <p className="text-sm text-slate-500 mt-1">
                        Add a batch to start tracking this medicine.
                      </p>

                    </div>
                  ) : (
                    <div className="space-y-3">

                      {selectedMedicine.batches.map(
                        (batch) => (
                          <div
                            key={batch.id}
                            className="border border-slate-200 rounded-xl p-4"
                          >

                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                              <div>

                                <div className="flex items-center gap-2">

                                  <Package
                                    size={18}
                                    className="text-blue-600"
                                  />

                                  <h4 className="font-semibold">
                                    {
                                      batch.batchNumber
                                    }
                                  </h4>

                                </div>

                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm flex-1 lg:max-w-2xl">

                                <BatchInfo
                                  icon={
                                    <CalendarDays
                                      size={15}
                                    />
                                  }
                                  label="Manufactured"
                                  value={formatDate(
                                    batch.manufacturingDate
                                  )}
                                />

                                <BatchInfo
                                  icon={
                                    <CalendarDays
                                      size={15}
                                    />
                                  }
                                  label="Expiry"
                                  value={formatDate(
                                    batch.expiryDate
                                  )}
                                />

                                <BatchInfo
                                  icon={
                                    <IndianRupee
                                      size={15}
                                    />
                                  }
                                  label="MRP"
                                  value={`₹${batch.mrp}`}
                                />

                                <BatchInfo
                                  icon={
                                    <Package
                                      size={15}
                                    />
                                  }
                                  label="Quantity"
                                  value={String(
                                    batch.quantity
                                  )}
                                />

                              </div>

                              <button
                                onClick={() =>
                                  openEditBatch(
                                    batch
                                  )
                                }
                                className="flex items-center justify-center gap-2 px-3 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50"
                              >
                                <Edit size={15} />
                                Edit
                              </button>

                            </div>

                          </div>
                        )
                      )}

                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>
        )}

      {/* =================================================
          BATCH FORM
      ================================================= */}

      {showBatchForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl">

            <div className="flex items-center justify-between p-6 border-b border-slate-200">

              <div>
                <h2 className="text-xl font-bold">
                  {editingBatch
                    ? "Edit Batch"
                    : "Add Medicine Batch"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {
                    selectedMedicine?.medicineName
                  }
                </p>
              </div>

              <button
                onClick={() =>
                  setShowBatchForm(false)
                }
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            <div className="p-6 space-y-5">

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Batch Number *
                </label>

                <input
                  type="text"
                  value={
                    batchForm.batchNumber
                  }
                  onChange={(e) =>
                    setBatchForm({
                      ...batchForm,
                      batchNumber:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. PCM-BATCH-002"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Manufacturing Date *
                  </label>

                  <input
                    type="date"
                    value={
                      batchForm.manufacturingDate
                    }
                    onChange={(e) =>
                      setBatchForm({
                        ...batchForm,
                        manufacturingDate:
                          e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Expiry Date *
                  </label>

                  <input
                    type="date"
                    value={
                      batchForm.expiryDate
                    }
                    onChange={(e) =>
                      setBatchForm({
                        ...batchForm,
                        expiryDate:
                          e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    MRP *
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={batchForm.mrp}
                    onChange={(e) =>
                      setBatchForm({
                        ...batchForm,
                        mrp: e.target.value,
                      })
                    }
                    placeholder="e.g. 27"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Quantity *
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      batchForm.quantity
                    }
                    onChange={(e) =>
                      setBatchForm({
                        ...batchForm,
                        quantity:
                          e.target.value,
                      })
                    }
                    placeholder="e.g. 1000"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

              </div>

            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-200">

              <button
                onClick={() =>
                  setShowBatchForm(false)
                }
                className="px-5 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={saveBatch}
                disabled={
                  !batchForm.batchNumber ||
                  !batchForm.manufacturingDate ||
                  !batchForm.expiryDate ||
                  !batchForm.mrp ||
                  !batchForm.quantity
                }
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingBatch
                  ? "Save Changes"
                  : "Create Batch"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

/* =====================================================
   DETAIL ITEM
===================================================== */

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="font-medium text-slate-800 mt-1">
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   BATCH INFO
===================================================== */

function BatchInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-slate-400">
        {icon}

        <span className="text-xs">
          {label}
        </span>
      </div>

      <p className="font-medium text-slate-800 mt-1">
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   DATE FORMATTER
===================================================== */

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

export default MedicineManagement;