import MainLayout from "../../../layouts/MainLayout";

function DemandTrends() {
  return (
    <MainLayout role="admin">
      <div className="space-y-6">

        <h1 className="text-3xl font-bold">
          Demand Trends
        </h1>

        <p className="text-gray-500">
          AI based demand prediction across the PharmaFlow platform.
        </p>

      </div>
    </MainLayout>
  );
}

export default DemandTrends;