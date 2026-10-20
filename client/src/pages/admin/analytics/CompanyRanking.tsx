import MainLayout from "../../../layouts/MainLayout";

function CompanyRanking() {
  return (
    <MainLayout role="admin">
      <div className="space-y-6">

        <h1 className="text-3xl font-bold">
          Top Performing Companies
        </h1>

        <p className="text-gray-500">
          View companies ranked according to overall platform performance.
        </p>

      </div>
    </MainLayout>
  );
}

export default CompanyRanking;