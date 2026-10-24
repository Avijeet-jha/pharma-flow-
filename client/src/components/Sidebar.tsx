  import { useState } from "react";
  import { useNavigate, useLocation } from "react-router-dom";

  import {
    LayoutDashboard,
    Building2,
    Users,
    BarChart3,
    CreditCard,
    Bell,
    Settings,
    Warehouse,
    Boxes,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    ShoppingCart,
    Truck,
    Receipt,
    RotateCcw,
  } from "lucide-react";

  type SidebarProps = {
    role: string;
  };

  function Sidebar({ role }: SidebarProps) {
    const location = useLocation();

    /* =========================
      COMPANY MANAGEMENT STATE
    ========================= */

    const isCompanySection =
      location.pathname.startsWith(
        "/admin/company-management"
      );

    const [companyOpen, setCompanyOpen] =
      useState(isCompanySection);

    /* =========================
      SUPPLY CHAIN STATE
    ========================= */

    const isSupplyChainSection =
      location.pathname.startsWith(
        "/pharma/supply-chain"
      ) ||
      location.pathname.startsWith(
        "/wholesaler/supply-chain"
      ) ||
      location.pathname.startsWith(
        "/retailer/supply-chain"
      );

    const [supplyChainOpen, setSupplyChainOpen] =
      useState(isSupplyChainSection);

    /* =========================
      ROLE CHECKS
    ========================= */

    const isAdmin = role === "admin";

    const isPharma = role === "pharma";

    const isWholesaler =
      role === "wholesaler";

    const isRetailer =
      role === "retailer";

    const isOperationalRole =
      isPharma ||
      isWholesaler ||
      isRetailer;

    /* =========================
      OPERATIONAL DASHBOARD PATH
    ========================= */

    const dashboardPath = isPharma
      ? "/pharma"
      : isWholesaler
      ? "/wholesaler"
      : "/retailer";

    /* =========================
      WAREHOUSE PATH
    ========================= */

    const warehousePath = isPharma
      ? "/pharma/warehouses"
      : isWholesaler
      ? "/wholesaler/warehouses"
      : "/retailer/warehouses";

    /* =========================
      INVENTORY PATH
    ========================= */

    const inventoryPath = isPharma
      ? "/pharma/inventory"
      : isWholesaler
      ? "/wholesaler/inventory"
      : "/retailer/inventory";

    /* =========================
      EXPIRY MANAGEMENT PATH
    ========================= */

    const expiryPath = isPharma
      ? "/pharma/inventory/expiry"
      : isWholesaler
      ? "/wholesaler/inventory/expiry"
      : "/retailer/inventory/expiry";

    /* =========================
      SETTINGS PATH
    ========================= */

    const settingsPath = isPharma
      ? "/pharma/settings"
      : isWholesaler
      ? "/wholesaler/settings"
      : "/retailer/settings";

    /* =========================
      SUPPLY CHAIN BASE PATH
    ========================= */

    const supplyChainPath = isPharma
      ? "/pharma/supply-chain"
      : isWholesaler
      ? "/wholesaler/supply-chain"
      : "/retailer/supply-chain";

    return (
      <aside className="sticky top-16 h-[calc(100vh-4rem)] w-72 shrink-0 self-start overflow-y-auto bg-slate-900 text-white">

        {/* =========================
            SIDEBAR HEADER
        ========================= */}

        <div className="p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold">
            Navigation
          </h2>
        </div>

        <nav className="p-4 space-y-2">

          {/* ==================================================
              SUPER ADMIN SIDEBAR
          ================================================== */}

          {isAdmin && (
            <>

              {/* =========================
                  DASHBOARD
              ========================= */}

              <SidebarItem
                icon={
                  <LayoutDashboard size={20} />
                }
                text="Dashboard"
                path="/admin"
                active={
                  location.pathname ===
                  "/admin"
                }
              />

              {/* =========================
                  COMPANY MANAGEMENT
              ========================= */}

              <div>

                <button
                  type="button"
                  onClick={() =>
                    setCompanyOpen(
                      !companyOpen
                    )
                  }
                  className="
                    flex
                    items-center
                    justify-between
                    w-full
                    px-4
                    py-3
                    rounded-lg
                    hover:bg-slate-800
                    transition
                  "
                >

                  <div className="flex items-center gap-3">

                    <Building2 size={20} />

                    <span>
                      Company Management
                    </span>

                  </div>

                  {companyOpen ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}

                </button>

                {/* Company submenu */}

                {companyOpen && (
                  <div
                    className="
                      ml-10
                      mt-2
                      space-y-1
                      border-l
                      border-slate-700
                      pl-3
                    "
                  >

                    <SidebarItem
                      text="Companies"
                      path="/admin/company-management/companies"
                      active={
                        location.pathname ===
                        "/admin/company-management/companies"
                      }
                    />

                    <SidebarItem
                      text="Company Approvals"
                      path="/admin/company-management/approvals"
                      active={
                        location.pathname ===
                        "/admin/company-management/approvals"
                      }
                    />

                    <SidebarItem
                      text="Company Documents"
                      path="/admin/company-management/documents"
                      active={
                        location.pathname ===
                        "/admin/company-management/documents"
                      }
                    />

                    <SidebarItem
                      text="Company Performance"
                      path="/admin/company-management/performance"
                      active={
                        location.pathname ===
                        "/admin/company-management/performance"
                      }
                    />

                    <SidebarItem
                      text="Register Company"
                      path="/admin/company-management/register"
                      active={
                        location.pathname ===
                        "/admin/company-management/register"
                      }
                    />

                  </div>
                )}

              </div>

              {/* =========================
                  USER MANAGEMENT
              ========================= */}

              <SidebarItem
                icon={<Users size={20} />}
                text="User Management"
              />

              {/* =========================
                  MARKET INTELLIGENCE
              ========================= */}

              <SidebarItem
                icon={
                  <BarChart3 size={20} />
                }
                text="Market Intelligence"
                path="/admin/market-insights"
                active={
                  location.pathname ===
                  "/admin/market-insights"
                }
              />

              {/* =========================
                  BILLING & REPORTS
              ========================= */}

              <SidebarItem
                icon={
                  <CreditCard size={20} />
                }
                text="Billing & Reports"
              />

              {/* =========================
                  SYSTEM
              ========================= */}

              <SidebarItem
                icon={<Bell size={20} />}
                text="System"
              />

              {/* =========================
                  SETTINGS
              ========================= */}

              <SidebarItem
                icon={
                  <Settings size={20} />
                }
                text="Settings"
                path="/admin/settings"
                active={
                  location.pathname ===
                  "/admin/settings"
                }
              />

            </>
          )}

          {/* ==================================================
              PHARMA / WHOLESALER / RETAILER
          ================================================== */}

          {isOperationalRole && (
            <>

              {/* =========================
                  DASHBOARD
              ========================= */}

              <SidebarItem
                icon={
                  <LayoutDashboard size={20} />
                }
                text="Dashboard"
                path={dashboardPath}
                active={
                  location.pathname ===
                  dashboardPath
                }
              />

              {/* =========================
                  WAREHOUSE MANAGEMENT
              ========================= */}

              <SidebarItem
                icon={
                  <Warehouse size={20} />
                }
                text="Warehouse Management"
                path={warehousePath}
                active={
                  location.pathname ===
                  warehousePath
                }
              />

              {/* =========================
                  INVENTORY
              ========================= */}

              <SidebarItem
                icon={
                  <Boxes size={20} />
                }
                text="Inventory"
                path={inventoryPath}
                active={
                  location.pathname ===
                  inventoryPath
                }
              />

              {/* =========================
                  EXPIRY MANAGEMENT
              ========================= */}

              <SidebarItem
                icon={
                  <CalendarDays size={20} />
                }
                text="Expiry Management"
                path={expiryPath}
                active={
                  location.pathname ===
                  expiryPath
                }
              />

              {/* =========================
                  SUPPLY CHAIN
              ========================= */}

              <div>

                <button
                  type="button"
                  onClick={() =>
                    setSupplyChainOpen(
                      !supplyChainOpen
                    )
                  }
                  className={`
                    flex
                    items-center
                    justify-between
                    w-full
                    px-4
                    py-3
                    rounded-lg
                    transition
                    ${
                      isSupplyChainSection
                        ? "bg-slate-800"
                        : "hover:bg-slate-800"
                    }
                  `}
                >

                  <div className="flex items-center gap-3">

                    <ShoppingCart size={20} />

                    <span>
                      Supply Chain
                    </span>

                  </div>

                  {supplyChainOpen ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}

                </button>

                {/* =========================
                    SUPPLY CHAIN SUBMENU
                ========================= */}

                {supplyChainOpen && (
                  <div
                    className="
                      ml-10
                      mt-2
                      space-y-1
                      border-l
                      border-slate-700
                      pl-3
                    "
                  >

                    {/* Purchase Orders */}

                    <SidebarItem
                      icon={
                        <ShoppingCart size={17} />
                      }
                      text="Purchase Orders"
                      path={`${supplyChainPath}/purchase-orders`}
                      active={
                        location.pathname ===
                        `${supplyChainPath}/purchase-orders`
                      }
                    />

                    {/* Dispatches */}

                    <SidebarItem
                      icon={
                        <Truck size={17} />
                      }
                      text="Dispatches"
                      path={`${supplyChainPath}/dispatches`}
                      active={
                        location.pathname ===
                        `${supplyChainPath}/dispatches`
                      }
                    />

                    {/* Sales */}

                    <SidebarItem
                      icon={
                        <Receipt size={17} />
                      }
                      text="Sales"
                      path={`${supplyChainPath}/sales`}
                      active={
                        location.pathname ===
                        `${supplyChainPath}/sales`
                      }
                    />

                    {/* Returns */}

                    <SidebarItem
                      icon={
                        <RotateCcw size={17} />
                      }
                      text="Returns"
                      path={`${supplyChainPath}/returns`}
                      active={
                        location.pathname ===
                        `${supplyChainPath}/returns`
                      }
                    />

                  </div>
                )}

              </div>

              {/* =========================
                  SETTINGS
              ========================= */}

              <SidebarItem
                icon={
                  <Settings size={20} />
                }
                text="Settings"
                path={settingsPath}
                active={
                  location.pathname ===
                  settingsPath
                }
              />

            </>
          )}

        </nav>

      </aside>
    );
  }

  /* =================================
    SIDEBAR ITEM
  ================================= */

  type SidebarItemProps = {
    icon?: React.ReactNode;
    text: string;
    path?: string;
    active?: boolean;
  };

  function SidebarItem({
    icon,
    text,
    path,
    active = false,
  }: SidebarItemProps) {

    const navigate = useNavigate();

    return (
      <button
        type="button"
        onClick={() => {
          if (path) {
            navigate(path);
          }
        }}
        className={`
          flex
          items-center
          gap-3
          w-full
          px-4
          py-2.5
          rounded-lg
          text-left
          transition
          duration-200
          ${
            active
              ? "bg-blue-600 text-white"
              : "hover:bg-slate-800"
          }
        `}
      >

        {icon && icon}

        <span className="text-sm">
          {text}
        </span>

      </button>
    );
  }

  export default Sidebar;