import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

type MainLayoutProps = {
  role: string;
  children: React.ReactNode;
};

function MainLayout({
  role,
  children,
}: MainLayoutProps) {
  // Normalize role so Sidebar/Navbar always receive
  // lowercase role values such as:
  // "admin", "pharma", "wholesaler", "retailer"
  const normalizedRole = role.toLowerCase();

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar role={normalizedRole} />

      <div className="flex">
        <Sidebar role={normalizedRole} />

        <main className="min-w-0 flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;