import MainLayout from "../../../layouts/MainLayout";

function MedicineUsage() {
  return (
    <MainLayout role="admin">
      <div className="space-y-6">

        <h1 className="text-3xl font-bold">
          Most Used Medicines
        </h1>

        <p className="text-gray-500">
          This page will display all medicines ranked by their usage across the platform.
        </p>

      </div>
    </MainLayout>
  );
}

export default MedicineUsage;