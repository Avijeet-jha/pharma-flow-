import {
  Warehouse,
  Plus,
  Search,
  MapPin,
  Eye,
  Pencil,
  X,
  Save,
  Building2,
  Trash2,
} from "lucide-react";

import { useEffect, useState } from "react";

type WarehouseData = {
  id: string;
  companyId: string;
  warehouseName: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  createdAt: string;
  updatedAt: string;
};

type WarehouseResponse = {
  success: boolean;
  data?: WarehouseData | WarehouseData[];
  message?: string;
};

type FormData = {
  warehouseName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

const emptyForm: FormData = {
  warehouseName: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

function WarehouseManagement() {
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingWarehouse, setEditingWarehouse] =
    useState<WarehouseData | null>(null);

  const [selectedWarehouse, setSelectedWarehouse] =
    useState<WarehouseData | null>(null);

  const [formData, setFormData] = useState<FormData>(emptyForm);

  const [saving, setSaving] = useState(false);

  const [deletingWarehouse, setDeletingWarehouse] =
    useState<WarehouseData | null>(null);

  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<{
    show: boolean;
    success: boolean;
    message: string;
  }>({
    show: false,
    success: true,
    message: "",
  });

  // ==========================================
  // API BASE URL
  // ==========================================

  const API_URL = "http://localhost:5000/api/warehouses";

  // ==========================================
  // NOTIFICATION
  // ==========================================

  const showNotification = (message: string, success: boolean) => {
    setToast({
      show: true,
      success,
      message,
    });

    window.setTimeout(() => {
      setToast((previous) => ({
        ...previous,
        show: false,
      }));
    }, 2500);
  };

  // ==========================================
  // FETCH WAREHOUSES
  // ==========================================

  const fetchWarehouses = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        showNotification("Unable to load warehouses", false);
        return;
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = (await response.json()) as WarehouseResponse;

      if (!response.ok || !result.success) {
        showNotification("Unable to load warehouses", false);
        return;
      }

      if (Array.isArray(result.data)) {
        setWarehouses(result.data);
      } else {
        setWarehouses([]);
      }
    } catch (error) {
      console.error("Fetch warehouses error:", error);

      showNotification("Unable to load warehouses", false);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const loadWarehouses = async () => {
      try {
        if (!cancelled) {
          setLoading(true);
        }

        const token = localStorage.getItem("token");

        if (!token) {
          if (!cancelled) {
            showNotification("Unable to load warehouses", false);
          }
          return;
        }

        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = (await response.json()) as WarehouseResponse;

        if (!response.ok || !result.success) {
          if (!cancelled) {
            showNotification("Unable to load warehouses", false);
          }
          return;
        }

        if (!cancelled) {
          if (Array.isArray(result.data)) {
            setWarehouses(result.data);
          } else {
            setWarehouses([]);
          }
        }
      } catch (error) {
        console.error("Fetch warehouses error:", error);

        if (!cancelled) {
          showNotification("Unable to load warehouses", false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadWarehouses();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredWarehouses = warehouses.filter((warehouse) => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return true;
    }

    return (
      warehouse.warehouseName.toLowerCase().includes(searchText) ||
      warehouse.city?.toLowerCase().includes(searchText) ||
      warehouse.state?.toLowerCase().includes(searchText) ||
      warehouse.pincode?.toLowerCase().includes(searchText)
    );
  });

  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  const handleAddWarehouse = () => {
    setEditingWarehouse(null);
    setSelectedWarehouse(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  const handleEditWarehouse = (warehouse: WarehouseData) => {
    setEditingWarehouse(warehouse);
    setSelectedWarehouse(null);

    setFormData({
      warehouseName: warehouse.warehouseName || "",
      address: warehouse.address || "",
      city: warehouse.city || "",
      state: warehouse.state || "",
      pincode: warehouse.pincode || "",
    });

    setShowForm(true);
  };

  // ==========================================
  // VIEW DETAILS
  // ==========================================

  const handleViewWarehouse = (warehouse: WarehouseData) => {
    setSelectedWarehouse(warehouse);
    setShowForm(false);
  };

  // ==========================================
  // CLOSE FORM
  // ==========================================

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingWarehouse(null);
    setFormData(emptyForm);
  };

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const updateFormField = (field: keyof FormData, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ==========================================
  // SAVE WAREHOUSE
  // ==========================================

  const handleSaveWarehouse = async () => {
    try {
      if (!formData.warehouseName.trim()) {
        showNotification("Changed unsuccessfully", false);
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        showNotification("Changed unsuccessfully", false);
        return;
      }

      setSaving(true);

      const isEditing = Boolean(editingWarehouse);

      const url = isEditing ? `${API_URL}/${editingWarehouse?.id}` : API_URL;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          warehouseName: formData.warehouseName.trim(),
          address: formData.address.trim() || undefined,
          city: formData.city.trim() || undefined,
          state: formData.state.trim() || undefined,
          pincode: formData.pincode.trim() || undefined,
        }),
      });

      const result = (await response.json()) as WarehouseResponse;

      if (!response.ok || !result.success) {
        showNotification("Changed unsuccessfully", false);
        return;
      }

      showNotification(
        isEditing
          ? "Warehouse updated successfully"
          : "Warehouse created successfully",
        true,
      );

      setShowForm(false);
      setEditingWarehouse(null);
      setFormData(emptyForm);

      await fetchWarehouses();
    } catch (error) {
      console.error("Save warehouse error:", error);

      showNotification("Changed unsuccessfully", false);
    } finally {
      setSaving(false);
    }
  };


  const handleDeleteWarehouse = async () => {
    if (!deletingWarehouse || deleting) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        showNotification("Please log in again", false);
        return;
      }

      setDeleting(true);

      const response = await fetch(
        `${API_URL}/${deletingWarehouse.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = (await response.json()) as WarehouseResponse;

      if (!response.ok || !result.success) {
        showNotification(
          result.message || "Unable to delete warehouse",
          false
        );
        return;
      }

      showNotification(
        result.message || "Warehouse deleted successfully",
        true
      );

      setDeletingWarehouse(null);
      setSelectedWarehouse(null);

      await fetchWarehouses();
    } catch (error) {
      console.error("Delete warehouse error:", error);
      showNotification("Unable to delete warehouse", false);
    } finally {
      setDeleting(false);
    }
  };


  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="space-y-6">
      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div
        className="
          flex
          items-center
          justify-between
        "
      >
        <div>
          <h1
            className="
              text-3xl
              font-bold
              text-gray-800
            "
          >
            Warehouse Management
          </h1>

          <p
            className="
              text-gray-500
              mt-1
            "
          >
            Manage your company's warehouses and locations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddWarehouse}
          className="
            flex
            items-center
            gap-2
            bg-blue-600
            hover:bg-blue-700
            text-white
            px-5
            py-3
            rounded-lg
            font-medium
            transition
          "
        >
          <Plus size={20} />
          Add Warehouse
        </button>
      </div>

      {/* ======================================
          SEARCH + SUMMARY
      ====================================== */}

      <div
        className="
          grid
          grid-cols-3
          gap-6
        "
      >
        <div
          className="
            bg-white
            rounded-xl
            border
            border-gray-200
            p-5
          "
        >
          <div
            className="
              flex
              items-center
              gap-4
            "
          >
            <div
              className="
                w-11
                h-11
                rounded-lg
                bg-blue-50
                text-blue-600
                flex
                items-center
                justify-center
              "
            >
              <Warehouse size={23} />
            </div>

            <div>
              <p
                className="
                  text-sm
                  text-gray-500
                "
              >
                Total Warehouses
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  text-gray-800
                "
              >
                {warehouses.length}
              </p>
            </div>
          </div>
        </div>

        <div
          className="
            col-span-2
            bg-white
            rounded-xl
            border
            border-gray-200
            p-5
          "
        >
          <div
            className="
              relative
            "
          >
            <Search
              size={20}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-gray-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="
                Search warehouse, city, state or pincode...
              "
              className="
                w-full
                pl-11
                pr-4
                py-3
                border
                border-gray-300
                rounded-lg
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />
          </div>
        </div>
      </div>

      {/* ======================================
          LOADING
      ====================================== */}

      {loading && (
        <div
          className="
            bg-white
            rounded-xl
            border
            border-gray-200
            p-10
            text-center
          "
        >
          <div
            className="
              animate-spin
              w-8
              h-8
              border-4
              border-gray-200
              border-t-blue-600
              rounded-full
              mx-auto
            "
          />

          <p
            className="
              text-gray-500
              mt-4
            "
          >
            Loading warehouses...
          </p>
        </div>
      )}

      {/* ======================================
          EMPTY
      ====================================== */}

      {!loading && filteredWarehouses.length === 0 && (
        <div
          className="
              bg-white
              rounded-xl
              border
              border-gray-200
              p-12
              text-center
            "
        >
          <div
            className="
                w-16
                h-16
                mx-auto
                rounded-full
                bg-gray-100
                text-gray-400
                flex
                items-center
                justify-center
              "
          >
            <Warehouse size={30} />
          </div>

          <h3
            className="
                text-lg
                font-semibold
                text-gray-800
                mt-5
              "
          >
            {search ? "No warehouses found" : "No warehouses yet"}
          </h3>

          <p
            className="
                text-gray-500
                mt-2
              "
          >
            {search
              ? "Try changing your search."
              : "Add your first warehouse to get started."}
          </p>

          {!search && (
            <button
              type="button"
              onClick={handleAddWarehouse}
              className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  px-5
                  py-2.5
                  rounded-lg
                  font-medium
                "
            >
              <Plus size={18} />
              Add Warehouse
            </button>
          )}
        </div>
      )}

      {/* ======================================
          WAREHOUSE LIST
      ====================================== */}

      {!loading && filteredWarehouses.length > 0 && (
        <div
          className="
              grid
              grid-cols-2
              gap-6
            "
        >
          {filteredWarehouses.map((warehouse) => (
            <div
              key={warehouse.id}
              className="
                    bg-white
                    rounded-xl
                    border
                    border-gray-200
                    shadow-sm
                    hover:shadow-md
                    transition
                    p-6
                  "
            >
              <div
                className="
                      flex
                      items-start
                      justify-between
                      gap-4
                    "
              >
                <div
                  className="
                        flex
                        items-center
                        gap-4
                      "
                >
                  <div
                    className="
                          w-12
                          h-12
                          rounded-xl
                          bg-blue-50
                          text-blue-600
                          flex
                          items-center
                          justify-center
                          flex-shrink-0
                        "
                  >
                    <Warehouse size={25} />
                  </div>

                  <div>
                    <h3
                      className="
                            text-lg
                            font-semibold
                            text-gray-800
                          "
                    >
                      {warehouse.warehouseName}
                    </h3>

                    <div
                      className="
                            flex
                            items-center
                            gap-1
                            mt-1
                            text-sm
                            text-gray-500
                          "
                    >
                      <MapPin size={15} />

                      <span>
                        {[warehouse.city, warehouse.state]
                          .filter(Boolean)
                          .join(", ") || "Location not provided"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="
                      mt-5
                      space-y-2
                    "
              >
                <InfoRow
                  label="Address"
                  value={warehouse.address || "Not provided"}
                />

                <InfoRow
                  label="Pincode"
                  value={warehouse.pincode || "Not provided"}
                />
              </div>

              <div
                className="
                      mt-6
                      pt-4
                      border-t
                      border-gray-100
                      flex
                      items-center
                      gap-3
                    "
              >
                <button
                  type="button"
                  onClick={() => handleViewWarehouse(warehouse)}
                  className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        flex-1
                        px-4
                        py-2.5
                        rounded-lg
                        border
                        border-gray-300
                        text-gray-700
                        hover:bg-gray-50
                        transition
                      "
                >
                  <Eye size={17} />
                  View Details
                </button>


                <button
                  type="button"
                  onClick={() => handleEditWarehouse(warehouse)}
                  className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                >
                  <Pencil size={17} />
                  Edit
                </button>

                {/* ADD THE DELETE BUTTON HERE */}
                <button
                  type="button"
                  onClick={() => setDeletingWarehouse(warehouse)}
                  title="Delete warehouse"
                  aria-label={`Delete ${warehouse.warehouseName}`}
                  className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 p-2.5 transition"
                >
                  <Trash2 size={18} />
                </button>

              </div>

            </div>
          ))}
    </div>
  )
}

{/* ======================================
          ADD / EDIT MODAL
      ====================================== */}

{
  showForm && (
    <div
      className="
            fixed
            inset-0
            z-50
            bg-black/50
            flex
            items-center
            justify-center
            p-6
          "
    >
      <div
        className="
              bg-white
              w-full
              max-w-2xl
              rounded-2xl
              shadow-2xl
              overflow-hidden
            "
      >
        <div
          className="
                flex
                items-center
                justify-between
                px-6
                py-5
                border-b
                border-gray-200
              "
        >
          <div>
            <p
              className="
                    text-xs
                    text-gray-400
                    mb-1
                  "
            >
              Warehouse Management
            </p>

            <h2
              className="
                    text-xl
                    font-bold
                    text-gray-800
                  "
            >
              {editingWarehouse ? "Edit Warehouse" : "Add Warehouse"}
            </h2>
          </div>

          <button
            type="button"
            onClick={closeForm}
            disabled={saving}
            className="
                  w-10
                  h-10
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  text-gray-500
                  hover:bg-gray-100
                "
          >
            <X size={21} />
          </button>
        </div>

        <div
          className="
                p-6
                space-y-5
              "
        >
          <Input
            label="Warehouse Name"
            required
            value={formData.warehouseName}
            onChange={(value) => updateFormField("warehouseName", value)}
            placeholder="
                  Enter warehouse name
                "
          />

          <Input
            label="Address"
            value={formData.address}
            onChange={(value) => updateFormField("address", value)}
            placeholder="
                  Enter complete address
                "
          />

          <div
            className="
                  grid
                  grid-cols-2
                  gap-5
                "
          >
            <Input
              label="City"
              value={formData.city}
              onChange={(value) => updateFormField("city", value)}
              placeholder="
                    Enter city
                  "
            />

            <Input
              label="State"
              value={formData.state}
              onChange={(value) => updateFormField("state", value)}
              placeholder="
                    Enter state
                  "
            />
          </div>

          <Input
            label="Pincode"
            value={formData.pincode}
            onChange={(value) => updateFormField("pincode", value)}
            placeholder="
                  Enter pincode
                "
          />
        </div>

        <div
          className="
                px-6
                py-5
                border-t
                border-gray-200
                flex
                justify-end
                gap-3
              "
        >
          <button
            type="button"
            onClick={closeForm}
            disabled={saving}
            className="
                  px-5
                  py-2.5
                  rounded-lg
                  border
                  border-gray-300
                  text-gray-700
                  hover:bg-gray-50
                "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveWarehouse}
            disabled={saving}
            className="
                  flex
                  items-center
                  gap-2
                  px-5
                  py-2.5
                  rounded-lg
                  bg-blue-600
                  hover:bg-blue-700
                  disabled:bg-blue-300
                  text-white
                  font-medium
                "
          >
            <Save size={18} />

            {saving
              ? "Saving..."
              : editingWarehouse
                ? "Update Warehouse"
                : "Save Warehouse"}
          </button>
        </div>
      </div>
    </div>
  )
}

{/* ======================================
          VIEW DETAILS MODAL
      ====================================== */}

{
  selectedWarehouse && (
    <div
      className="
            fixed
            inset-0
            z-50
            bg-black/50
            flex
            items-center
            justify-center
            p-6
          "
    >
      <div
        className="
              bg-white
              w-full
              max-w-2xl
              rounded-2xl
              shadow-2xl
              overflow-hidden
            "
      >
        <div
          className="
                flex
                items-center
                justify-between
                px-6
                py-5
                border-b
                border-gray-200
              "
        >
          <div>
            <p
              className="
                    text-xs
                    text-gray-400
                    mb-1
                  "
            >
              Warehouse Details
            </p>

            <h2
              className="
                    text-xl
                    font-bold
                    text-gray-800
                  "
            >
              {selectedWarehouse.warehouseName}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setSelectedWarehouse(null)}
            className="
                  w-10
                  h-10
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  text-gray-500
                  hover:bg-gray-100
                "
          >
            <X size={21} />
          </button>
        </div>

        <div
          className="
                p-6
                space-y-5
              "
        >
          <div
            className="
                  grid
                  grid-cols-2
                  gap-5
                "
          >
            <DetailBox
              icon={<Warehouse size={20} />}
              label="Warehouse Name"
              value={selectedWarehouse.warehouseName}
            />

            <DetailBox
              icon={<Building2 size={20} />}
              label="Company ID"
              value={selectedWarehouse.companyId}
            />

            <DetailBox
              icon={<MapPin size={20} />}
              label="City"
              value={selectedWarehouse.city || "Not provided"}
            />

            <DetailBox
              icon={<MapPin size={20} />}
              label="State"
              value={selectedWarehouse.state || "Not provided"}
            />
          </div>

          <DetailBox
            icon={<MapPin size={20} />}
            label="Address"
            value={selectedWarehouse.address || "Not provided"}
          />

          <DetailBox
            icon={<MapPin size={20} />}
            label="Pincode"
            value={selectedWarehouse.pincode || "Not provided"}
          />

          <div
            className="
                  grid
                  grid-cols-2
                  gap-5
                "
          >
            <DetailBox
              icon={<Building2 size={20} />}
              label="Created"
              value={formatDate(selectedWarehouse.createdAt)}
            />

            <DetailBox
              icon={<Building2 size={20} />}
              label="Last Updated"
              value={formatDate(selectedWarehouse.updatedAt)}
            />
          </div>
        </div>

        <div
          className="
                px-6
                py-5
                border-t
                border-gray-200
                flex
                justify-end
              "
        >
          <button
            type="button"
            onClick={() => {
              setSelectedWarehouse(null);

              handleEditWarehouse(selectedWarehouse);
            }}
            className="
                  flex
                  items-center
                  gap-2
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  px-5
                  py-2.5
                  rounded-lg
                  font-medium
                "
          >
            <Pencil size={18} />
            Edit Warehouse
          </button>
        </div>
      </div>
    </div>
  )
}


{/* DELETE CONFIRMATION MODAL */ }
{
  deletingWarehouse && (
    <div
      className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4"
      onClick={() => {
        if (!deleting) setDeletingWarehouse(null);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-warehouse-title"
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-red-100 text-red-600 p-3">
            <Trash2 size={24} />
          </div>

          <div>
            <h2
              id="delete-warehouse-title"
              className="text-xl font-bold text-gray-800"
            >
              Delete Warehouse?
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                {deletingWarehouse.warehouseName}
              </span>
              ? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={deleting}
            onClick={() => setDeletingWarehouse(null)}
            className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={handleDeleteWarehouse}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 size={17} />
            {deleting ? "Deleting..." : "Delete Warehouse"}
          </button>
        </div>
      </div>
    </div>
  )
}


{/* ======================================
          TOAST
      ====================================== */}

{
  toast.show && (
    <div
      className="
            fixed
            top-6
            right-6
            z-[100]
            bg-white
            rounded-xl
            shadow-xl
            border
            border-gray-200
            px-5
            py-4
            flex
            items-center
            gap-3
          "
    >
      <div
        className={`
              w-9
              h-9
              rounded-full
              flex
              items-center
              justify-center
              font-bold
              ${toast.success
            ? "bg-green-100 text-green-600"
            : "bg-red-100 text-red-600"
          }
            `}
      >
        {toast.success ? "✓" : "!"}
      </div>

      <p
        className="
              font-medium
              text-gray-800
            "
      >
        {toast.message}
      </p>
    </div>
  )
}
    </div >
);
}

// ==========================================
// INPUT COMPONENT
// ==========================================

function Input({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        className="
          block
          text-sm
          font-medium
          text-gray-700
          mb-2
        "
      >
        {label}

        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full
          border
          border-gray-300
          rounded-lg
          px-4
          py-3
          outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      />
    </div>
  );
}

// ==========================================
// INFO ROW
// ==========================================

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="
        flex
        items-start
        gap-3
        text-sm
      "
    >
      <span
        className="
          text-gray-400
          min-w-[70px]
        "
      >
        {label}:
      </span>

      <span
        className="
          text-gray-600
          break-words
        "
      >
        {value}
      </span>
    </div>
  );
}

// ==========================================
// DETAIL BOX
// ==========================================

function DetailBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        bg-gray-50
        rounded-xl
        p-4
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
          text-blue-600
          mb-2
        "
      >
        {icon}

        <span
          className="
            text-xs
            font-medium
            text-gray-500
          "
        >
          {label}
        </span>
      </div>

      <p
        className="
          text-sm
          font-medium
          text-gray-800
          break-words
        "
      >
        {value}
      </p>
    </div>
  );
}

// ==========================================
// DATE
// ==========================================

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default WarehouseManagement;
