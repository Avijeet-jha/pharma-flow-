import { useState } from "react";
import MainLayout from "../../../layouts/MainLayout";

function RegisterCompany() {
  const [formData, setFormData] = useState({
    companyName: "",
    companyType: "PHARMA",
    email: "",
    password: "",
    phone: "",
    gstNumber: "",
    drugLicenseNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/companies",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companyName: formData.companyName,
            companyType: formData.companyType,
            email: formData.email,
            passwordHash: formData.password,
            phone: formData.phone,
            gstNumber: formData.gstNumber,
            drugLicenseNumber: formData.drugLicenseNumber,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to register company"
        );
      }

      setMessage("Company registered successfully!");

      setFormData({
        companyName: "",
        companyType: "PHARMA",
        email: "",
        password: "",
        phone: "",
        gstNumber: "",
        drugLicenseNumber: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
      });
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to register company"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <MainLayout role="admin">
      <div className="space-y-6">

        {/* Header */}

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Register Company
          </h1>

          <p className="text-gray-500 mt-1">
            Register a new pharmaceutical company on PharmaFlow.
          </p>
        </div>

        {/* Success Message */}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4">
            {message}
          </div>
        )}

        {/* Error Message */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border p-6"
        >

          <div className="grid grid-cols-2 gap-6">

            {/* Company Name */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>

              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter company name"
                required
                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Company Type */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Type
              </label>

              <select
                name="companyType"
                value={formData.companyType}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PHARMA">
                  Pharmaceutical Company
                </option>

                <option value="WHOLESALER">
                  Wholesaler
                </option>

                <option value="RETAILER">
                  Retailer
                </option>
              </select>
            </div>

            {/* Email */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="company@example.com"
                required
                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Phone */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* GST */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Number
              </label>

              <input
                type="text"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                placeholder="Enter GST number"
                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Drug License */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drug License Number
              </label>

              <input
                type="text"
                name="drugLicenseNumber"
                value={formData.drugLicenseNumber}
                onChange={handleChange}
                placeholder="Enter drug license number"
                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* City */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* State */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>

              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Pincode */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode
              </label>

              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Enter pincode"
                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>

          {/* Address */}

          <div className="mt-6">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>

            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter company address"
              className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            /> 

          </div>

          {/* Buttons */}

          <div className="flex justify-end gap-3 mt-8">

            <button
              type="button"
              onClick={() => {
                setFormData({
                  companyName: "",
                  companyType: "PHARMA",
                  email: "",
                  password: "",
                  phone: "",
                  gstNumber: "",
                  drugLicenseNumber: "",
                  address: "",
                  city: "",
                  state: "",
                  pincode: "",
                });

                setMessage("");
                setError("");
              }}
              className="border px-5 py-2 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Registering..."
                : "Register Company"}
            </button>

          </div>

        </form>

      </div>
    </MainLayout>
  );
}

export default RegisterCompany;