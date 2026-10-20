import MainLayout from "../../../layouts/MainLayout";

function InventoryMovement() {
  return (
    <MainLayout role="admin">
      <div className="space-y-6">

        <h1 className="text-3xl font-bold">
          Overall Inventory Movement
        </h1>

        <p className="text-gray-500">
          Track inventory movement across all registered companies.
        </p>

      </div>
    </MainLayout>
  );
}

export default InventoryMovement;