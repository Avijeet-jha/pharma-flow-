import {
  User,
  Lock,
  Bell,
  Globe,
  CreditCard,
  HelpCircle,
  Shield,
  X,
  Save,
  Mail,
  KeyRound,
  FileText,
  MessageCircle,
  ExternalLink,
  Activity,
  Package,
  ShoppingCart,
  Clock3,
  AlertTriangle,
  Scale,
  Database,
  Cookie,
  CircleHelp,
  Bug,
  ArrowLeft,
} from "lucide-react";

import { useEffect, useState } from "react";

import MainLayout from "../../layouts/MainLayout";

// ==========================================
// TYPES
// ==========================================

type SettingSection =
  | "account"
  | "privacy"
  | "notifications"
  | "language"
  | "billing"
  | "help"
  | "legal"
  | null;

type PrivacyDetail =
  | "password"
  | "protection"
  | "activity"
  | null;

type HelpDetail =
  | "faq"
  | "support"
  | "documentation"
  | "problem"
  | null;

type LegalDetail =
  | "terms"
  | "privacy"
  | "data"
  | "acceptable"
  | "cookie"
  | "disclaimer"
  | null;

type UserRole =
  | "SUPER_ADMIN"
  | "PHARMA"
  | "WHOLESALER"
  | "RETAILER";

type ProfileData = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ProfileResponse = {
  success: boolean;
  data?: ProfileData;
  message?: string;
};

type SettingsData = {
  emailNotifications: boolean;
  approvalNotifications: boolean;
  systemAlerts: boolean;
  language: string;
};

type SettingsResponse = {
  success: boolean;
  data?: SettingsData;
  message?: string;
};

// ==========================================
// MAIN SETTINGS
// ==========================================

function Settings() {
  const [activeSection, setActiveSection] =
    useState<SettingSection>(null);

  const [privacyDetail, setPrivacyDetail] =
    useState<PrivacyDetail>(null);

  const [helpDetail, setHelpDetail] =
    useState<HelpDetail>(null);

  const [legalDetail, setLegalDetail] =
    useState<LegalDetail>(null);

  // ========================================
  // PROFILE
  // ========================================

  const [profile, setProfile] =
    useState<ProfileData | null>(null);

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [loadingProfile, setLoadingProfile] =
    useState(false);

  const [savingProfile, setSavingProfile] =
    useState(false);

  // ========================================
  // PASSWORD
  // ========================================

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  // ========================================
  // NOTIFICATIONS
  // ========================================

  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [approvalNotifications, setApprovalNotifications] =
    useState(true);

  const [medicineRequests, setMedicineRequests] =
    useState(true);

  const [systemAlerts, setSystemAlerts] =
    useState(true);

  const [purchaseOrderAlerts, setPurchaseOrderAlerts] =
    useState(true);

  const [inventoryAlerts, setInventoryAlerts] =
    useState(true);

  const [expiryAlerts, setExpiryAlerts] =
    useState(true);

  // ========================================
  // LANGUAGE
  // ========================================

  const [language, setLanguage] =
    useState("English");

  // ========================================
  // TOAST
  // ========================================

  const [showToast, setShowToast] =
    useState(false);

  const [toastMessage, setToastMessage] =
    useState("");

  const [toastType, setToastType] =
    useState<"success" | "error">("success");

  // ========================================
  // ROLE
  // ========================================

  const userRole: UserRole =
    profile?.role ||
    (() => {
      try {
        const storedUser =
          localStorage.getItem("user");

        if (!storedUser) {
          return "SUPER_ADMIN";
        }

        const parsed =
          JSON.parse(storedUser);

        return (
          parsed.role ||
          "SUPER_ADMIN"
        );
      } catch {
        return "SUPER_ADMIN";
      }
    })();

  // ========================================
  // TOAST
  // ========================================

  const showResultToast = (
    message: string,
    type: "success" | "error",
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    window.setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  // ========================================
  // PROFILE
  // ========================================

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);

        const token =
          localStorage.getItem("token");

        if (!token) {
          return;
        }

        const response =
          await fetch(
            "http://localhost:5000/api/settings/profile",
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            },
          );

        const result =
          (await response.json()) as ProfileResponse;

        if (
          !response.ok ||
          !result.success ||
          !result.data
        ) {
          return;
        }

        setProfile(result.data);

        const nameParts =
          result.data.name
            .trim()
            .split(/\s+/);

        const first =
          nameParts.shift() || "";

        const last =
          nameParts.join(" ");

        setFirstName(first);
        setLastName(last);
        setEmail(result.data.email);

        localStorage.setItem(
          "user",
          JSON.stringify(result.data),
        );
      } catch (error) {
        console.error(
          "Profile fetch error:",
          error,
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  // ========================================
  // LOAD SETTINGS
  // ========================================

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token =
          localStorage.getItem("token");

        if (!token) {
          return;
        }

        const response =
          await fetch(
            "http://localhost:5000/api/settings",
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            },
          );

        if (!response.ok) {
          return;
        }

        const result =
          (await response.json()) as SettingsResponse;

        if (
          result.success &&
          result.data
        ) {
          setEmailNotifications(
            result.data.emailNotifications,
          );

          setApprovalNotifications(
            result.data.approvalNotifications,
          );

          setSystemAlerts(
            result.data.systemAlerts,
          );

          setLanguage(
            result.data.language,
          );
        }
      } catch (error) {
        console.error(
          "Settings fetch error:",
          error,
        );
      }
    };

    fetchSettings();
  }, []);

  // ========================================
  // SAVE PROFILE
  // ========================================

  const handleSaveProfile =
    async () => {
      try {
        setSavingProfile(true);

        const token =
          localStorage.getItem("token");

        if (!token) {
          showResultToast(
            "Changes unsuccessful",
            "error",
          );
          return;
        }

        if (!firstName.trim()) {
          showResultToast(
            "Changes unsuccessful",
            "error",
          );
          return;
        }

        if (!email.trim()) {
          showResultToast(
            "Changes unsuccessful",
            "error",
          );
          return;
        }

        const fullName =
          `${firstName.trim()} ${lastName.trim()}`
            .trim();

        const response =
          await fetch(
            "http://localhost:5000/api/settings/profile",
            {
              method: "PUT",
              headers: {
                "Content-Type":
                  "application/json",
                Authorization:
                  `Bearer ${token}`,
              },
              body: JSON.stringify({
                name: fullName,
                email: email.trim(),
              }),
            },
          );

        const result =
          (await response.json()) as ProfileResponse;

        if (
          !response.ok ||
          !result.success ||
          !result.data
        ) {
          showResultToast(
            "Changes unsuccessful",
            "error",
          );
          return;
        }

        setProfile(result.data);

        localStorage.setItem(
          "user",
          JSON.stringify(result.data),
        );

        showResultToast(
          "Changes saved successfully",
          "success",
        );

        window.setTimeout(() => {
          closeSection();
        }, 700);
      } catch (error) {
        console.error(
          "Profile update error:",
          error,
        );

        showResultToast(
          "Changes unsuccessful",
          "error",
        );
      } finally {
        setSavingProfile(false);
      }
    };

  // ========================================
  // SAVE NOTIFICATIONS
  // ========================================

  const handleSaveNotifications =
    async () => {
      try {
        const token =
          localStorage.getItem("token");

        if (!token) {
          showResultToast(
            "Changes unsuccessful",
            "error",
          );
          return;
        }

        const response =
          await fetch(
            "http://localhost:5000/api/settings",
            {
              method: "PUT",
              headers: {
                "Content-Type":
                  "application/json",
                Authorization:
                  `Bearer ${token}`,
              },
              body: JSON.stringify({
                emailNotifications,
                approvalNotifications,
                systemAlerts,
                language,
              }),
            },
          );

        const result =
          (await response.json()) as SettingsResponse;

        if (
          !response.ok ||
          !result.success
        ) {
          showResultToast(
            "Changes unsuccessful",
            "error",
          );
          return;
        }

        if (result.data) {
          setEmailNotifications(
            result.data.emailNotifications,
          );

          setApprovalNotifications(
            result.data.approvalNotifications,
          );

          setSystemAlerts(
            result.data.systemAlerts,
          );
        }

        showResultToast(
          "Changes saved successfully",
          "success",
        );

        window.setTimeout(() => {
          closeSection();
        }, 700);
      } catch (error) {
        console.error(
          "Notification update error:",
          error,
        );

        showResultToast(
          "Changes unsuccessful",
          "error",
        );
      }
    };

  // ========================================
  // SAVE LANGUAGE
  // ========================================

  const handleSaveLanguage =
    async () => {
      try {
        const token =
          localStorage.getItem("token");

        if (!token) {
          showResultToast(
            "Changes unsuccessful",
            "error",
          );
          return;
        }

        const response =
          await fetch(
            "http://localhost:5000/api/settings",
            {
              method: "PUT",
              headers: {
                "Content-Type":
                  "application/json",
                Authorization:
                  `Bearer ${token}`,
              },
              body: JSON.stringify({
                emailNotifications,
                approvalNotifications,
                systemAlerts,
                language,
              }),
            },
          );

        const result =
          (await response.json()) as SettingsResponse;

        if (
          !response.ok ||
          !result.success
        ) {
          showResultToast(
            "Changes unsuccessful",
            "error",
          );
          return;
        }

        showResultToast(
          "Changes saved successfully",
          "success",
        );

        window.setTimeout(() => {
          closeSection();
        }, 700);
      } catch (error) {
        console.error(
          "Language update error:",
          error,
        );

        showResultToast(
          "Changes unsuccessful",
          "error",
        );
      }
    };

  // ========================================
  // OPEN
  // ========================================

  const openSection = (
    section: SettingSection,
  ) => {
    setPrivacyDetail(null);
    setHelpDetail(null);
    setLegalDetail(null);

    setActiveSection(section);
  };

  // ========================================
  // CLOSE
  // ========================================

  const closeSection = () => {
    if (savingProfile) {
      return;
    }

    setPrivacyDetail(null);
    setHelpDetail(null);
    setLegalDetail(null);

    setActiveSection(null);
  };

  // ========================================
  // BACK
  // ========================================

  const backToSection = () => {
    setPrivacyDetail(null);
    setHelpDetail(null);
    setLegalDetail(null);
  };

  // ========================================
  // BREADCRUMB
  // ========================================

  const getBreadcrumb = () => {
    const section =
      getSectionTitle(activeSection);

    if (
      activeSection === "privacy" &&
      privacyDetail
    ) {
      return (
        <>
          <span>Settings</span>
          <span className="text-gray-400">
            &gt;
          </span>
          <span>Privacy & Security</span>
          <span className="text-gray-400">
            &gt;
          </span>
          <span className="text-gray-800">
            {getPrivacyTitle()}
          </span>
        </>
      );
    }

    if (
      activeSection === "help" &&
      helpDetail
    ) {
      return (
        <>
          <span>Settings</span>
          <span className="text-gray-400">
            &gt;
          </span>
          <span>Help & Support</span>
          <span className="text-gray-400">
            &gt;
          </span>
          <span className="text-gray-800">
            {getHelpTitle()}
          </span>
        </>
      );
    }

    if (
      activeSection === "legal" &&
      legalDetail
    ) {
      return (
        <>
          <span>Settings</span>
          <span className="text-gray-400">
            &gt;
          </span>
          <span>Legal & Policies</span>
          <span className="text-gray-400">
            &gt;
          </span>
          <span className="text-gray-800">
            {getLegalTitle()}
          </span>
        </>
      );
    }

    return (
      <>
        <span>Settings</span>
        <span className="text-gray-400">
          &gt;
        </span>
        <span className="text-gray-800">
          {section}
        </span>
      </>
    );
  };

  // ========================================
  // TITLES
  // ========================================

  const getSectionTitle = (
    section: SettingSection,
  ) => {
    switch (section) {
      case "account":
        return "Account & Profile";

      case "privacy":
        return "Privacy & Security";

      case "notifications":
        return "Notification Preferences";

      case "language":
        return "Language & Region";

      case "billing":
        return "Billing Preferences";

      case "help":
        return "Help & Support";

      case "legal":
        return "Legal & Policies";

      default:
        return "Settings";
    }
  };

  const getPrivacyTitle = () => {
    switch (privacyDetail) {
      case "password":
        return "Change Password";

      case "protection":
        return "Account Protection";

      case "activity":
        return "Login Activity";

      default:
        return "";
    }
  };

  const getHelpTitle = () => {
    switch (helpDetail) {
      case "faq":
        return "Frequently Asked Questions";

      case "support":
        return "Contact Support";

      case "documentation":
        return "Documentation";

      case "problem":
        return "Report a Problem";

      default:
        return "";
    }
  };

  const getLegalTitle = () => {
    switch (legalDetail) {
      case "terms":
        return "Terms of Use";

      case "privacy":
        return "Privacy Policy";

      case "data":
        return "Data Protection Policy";

      case "acceptable":
        return "Acceptable Use Policy";

      case "cookie":
        return "Cookie Policy";

      case "disclaimer":
        return "Disclaimer";

      default:
        return "";
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <MainLayout role="admin">

      <div className="space-y-6">

        {/* PAGE HEADER */}

        <div>
          <h1
            className="
              text-3xl
              font-bold
              text-gray-800
            "
          >
            Settings
          </h1>

          <p
            className="
              text-gray-500
              mt-1
            "
          >
            Manage your account, security,
            notifications and preferences.
          </p>
        </div>

        {/* SETTINGS CARDS */}

        <div
          className="
            grid
            grid-cols-3
            gap-6
          "
        >

          <SettingCard
            icon={<User size={26} />}
            title="Account & Profile"
            description="
              Manage your personal information
              and profile details.
            "
            onClick={() =>
              openSection("account")
            }
          />

          <SettingCard
            icon={<Lock size={26} />}
            title="Privacy & Security"
            description="
              Manage your password and
              account security.
            "
            onClick={() =>
              openSection("privacy")
            }
          />

          <SettingCard
            icon={<Bell size={26} />}
            title="Notification Preferences"
            description="
              Control how PharmaFlow
              sends notifications.
            "
            onClick={() =>
              openSection("notifications")
            }
          />

          <SettingCard
            icon={<Globe size={26} />}
            title="Language & Region"
            description="
              Manage your language and
              regional preferences.
            "
            onClick={() =>
              openSection("language")
            }
          />

          <SettingCard
            icon={<CreditCard size={26} />}
            title="Billing Preferences"
            description="
              Manage billing and
              subscription preferences.
            "
            onClick={() =>
              openSection("billing")
            }
          />

          <SettingCard
            icon={<HelpCircle size={26} />}
            title="Help & Support"
            description="
              Get help and contact
              PharmaFlow support.
            "
            onClick={() =>
              openSection("help")
            }
          />

          <SettingCard
            icon={<Shield size={26} />}
            title="Legal & Policies"
            description="
              View privacy policy, terms
              and important legal information.
            "
            onClick={() =>
              openSection("legal")
            }
          />

        </div>
      </div>

      {/* ====================================
          TOAST
      ==================================== */}

      {showToast && (
        <div
          className="
            fixed
            top-6
            right-6
            z-[100]
            bg-white
            border
            border-gray-200
            shadow-xl
            rounded-xl
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
              ${
                toastType === "success"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }
            `}
          >
            {toastType === "success"
              ? "✓"
              : "!"}
          </div>

          <div>

            <p
              className="
                font-semibold
                text-gray-800
              "
            >
              {toastType === "success"
                ? "Success"
                : "Change Unsuccessful"}
            </p>

            <p
              className="
                text-sm
                text-gray-500
                mt-1
              "
            >
              {toastMessage}
            </p>

          </div>

        </div>
      )}

      {/* ====================================
          MODAL
      ==================================== */}

      {activeSection && (
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
              max-w-5xl
              max-h-[90vh]
              rounded-2xl
              shadow-2xl
              overflow-hidden
              flex
              flex-col
            "
          >

            {/* =================================
                HEADER
            ================================= */}

            <div
              className="
                flex
                items-center
                justify-between
                px-8
                py-5
                border-b
                border-gray-200
                flex-shrink-0
                bg-white
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                "
              >
                {getBreadcrumb()}
              </div>

              <button
                type="button"
                onClick={closeSection}
                disabled={savingProfile}
                className="
                  flex-shrink-0
                  w-10
                  h-10
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  text-gray-500
                  hover:bg-gray-100
                  hover:text-gray-800
                  transition
                "
              >
                <X size={22} />
              </button>

            </div>

            {/* =================================
                CONTENT
            ================================= */}

            <div
              className="
                flex-1
                overflow-y-auto
                p-8
              "
            >

              {/* =================================
                  ACCOUNT
              ================================= */}

              {activeSection === "account" && (
                <div className="space-y-6">

                  <FormHeader
                    icon={<User size={24} />}
                    title="Personal Information"
                    description="
                      Update your personal account information.
                    "
                  />

                  {loadingProfile ? (
                    <LoadingBox />
                  ) : (
                    <>

                      <div
                        className="
                          grid
                          grid-cols-2
                          gap-6
                        "
                      >

                        <InputField
                          label="First Name"
                          value={firstName}
                          onChange={
                            setFirstName
                          }
                        />

                        <InputField
                          label="Last Name"
                          value={lastName}
                          onChange={
                            setLastName
                          }
                        />

                      </div>

                      <InputField
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={setEmail}
                      />

                      <InputField
                        label="Mobile Number"
                        value={phone}
                        onChange={setPhone}
                        placeholder="+91 XXXXX XXXXX"
                      />

                      <InputField
                        label="Address"
                        value={address}
                        onChange={setAddress}
                        placeholder="
                          Enter your address
                        "
                      />

                      <div
                        className="
                          bg-blue-50
                          border
                          border-blue-100
                          rounded-xl
                          p-5
                        "
                      >
                        <p
                          className="
                            text-sm
                            text-blue-700
                          "
                        >
                          Your personal information
                          is associated with your
                          PharmaFlow user account.
                        </p>
                      </div>

                      <SaveButton
                        loading={
                          savingProfile
                        }
                        onClick={
                          handleSaveProfile
                        }
                      />

                    </>
                  )}

                </div>
              )}

              {/* =================================
                  PRIVACY
              ================================= */}

              {activeSection === "privacy" && (
                <>
                  {!privacyDetail && (
                    <div className="space-y-4">

                      <FormHeader
                        icon={
                          <Shield size={24} />
                        }
                        title="Privacy & Security"
                        description="
                          Protect your PharmaFlow account
                          and review security controls.
                        "
                      />

                      <InnerButton
                        icon={
                          <KeyRound size={20} />
                        }
                        title="Change Password"
                        description="
                          Update your account password.
                        "
                        onClick={() =>
                          setPrivacyDetail(
                            "password",
                          )
                        }
                      />

                      <InnerButton
                        icon={
                          <Shield size={20} />
                        }
                        title="Account Protection"
                        description="
                          Review the security protections
                          applied to your account.
                        "
                        onClick={() =>
                          setPrivacyDetail(
                            "protection",
                          )
                        }
                      />

                      <InnerButton
                        icon={
                          <Activity size={20} />
                        }
                        title="Login Activity"
                        description="
                          Review account access and
                          authentication activity.
                        "
                        onClick={() =>
                          setPrivacyDetail(
                            "activity",
                          )
                        }
                      />

                    </div>
                  )}

                  {privacyDetail === "password" && (
                    <div className="space-y-6">

                      <BackButton
                        onClick={
                          backToSection
                        }
                      />

                      <FormHeader
                        icon={
                          <KeyRound size={24} />
                        }
                        title="Change Password"
                        description="
                          Update your PharmaFlow
                          account password.
                        "
                      />

                      <InputField
                        label="Current Password"
                        type="password"
                        value={
                          currentPassword
                        }
                        onChange={
                          setCurrentPassword
                        }
                      />

                      <InputField
                        label="New Password"
                        type="password"
                        value={
                          newPassword
                        }
                        onChange={
                          setNewPassword
                        }
                      />

                      <InputField
                        label="Confirm New Password"
                        type="password"
                        value={
                          confirmPassword
                        }
                        onChange={
                          setConfirmPassword
                        }
                      />

                      <div
                        className="
                          bg-blue-50
                          border
                          border-blue-100
                          rounded-xl
                          p-5
                        "
                      >
                        <p
                          className="
                            text-sm
                            text-blue-700
                          "
                        >
                          Use a strong password with
                          uppercase and lowercase
                          letters, numbers and
                          special characters.
                        </p>
                      </div>

                      <div className="flex justify-end">

                        <button
                          type="button"
                          onClick={() => {

                            if (
                              !currentPassword ||
                              !newPassword ||
                              !confirmPassword
                            ) {
                              showResultToast(
                                "Changes unsuccessful",
                                "error",
                              );
                              return;
                            }

                            if (
                              newPassword !==
                              confirmPassword
                            ) {
                              showResultToast(
                                "Changes unsuccessful",
                                "error",
                              );
                              return;
                            }

                            showResultToast(
                              "Changes saved successfully",
                              "success",
                            );

                            window.setTimeout(
                              () => {
                                closeSection();
                              },
                              700,
                            );
                          }}
                          className="
                            flex
                            items-center
                            gap-2
                            bg-blue-600
                            hover:bg-blue-700
                            text-white
                            px-6
                            py-3
                            rounded-lg
                            font-medium
                          "
                        >
                          <Save size={18} />
                          Save Changes
                        </button>

                      </div>

                    </div>
                  )}

                  {privacyDetail === "protection" && (
                    <div className="space-y-5">

                      <BackButton
                        onClick={
                          backToSection
                        }
                      />

                      <FormHeader
                        icon={
                          <Shield size={24} />
                        }
                        title="Account Protection"
                        description="
                          Security features currently
                          protecting your PharmaFlow account.
                        "
                      />

                      <SecurityStatus
                        title="JWT Authentication"
                        description="
                          Your authenticated session is
                          protected using JWT tokens.
                        "
                      />

                      <SecurityStatus
                        title="Password Encryption"
                        description="
                          Account passwords are securely
                          hashed before being stored.
                        "
                      />

                      <SecurityStatus
                        title="Role-Based Access Control"
                        description="
                          Access to PharmaFlow modules is
                          controlled according to your role.
                        "
                      />

                      <SecurityStatus
                        title="Protected API Access"
                        description="
                          Authorized backend endpoints
                          require valid authentication.
                        "
                      />

                    </div>
                  )}

                  {privacyDetail === "activity" && (
                    <div className="space-y-5">

                      <BackButton
                        onClick={
                          backToSection
                        }
                      />

                      <FormHeader
                        icon={
                          <Activity size={24} />
                        }
                        title="Login Activity"
                        description="
                          Review your recent account
                          authentication activity.
                        "
                      />

                      <ActivityRow
                        title="Current Session"
                        description="
                          Your current PharmaFlow
                          session is authenticated.
                        "
                      />

                      <ActivityRow
                        title="JWT Authentication"
                        description="
                          Your current session uses
                          token-based authentication.
                        "
                      />

                      <div
                        className="
                          bg-gray-50
                          rounded-xl
                          p-5
                        "
                      >
                        <p
                          className="
                            text-sm
                            text-gray-600
                          "
                        >
                          Detailed login history can
                          be connected to the
                          Activity Logs module.
                        </p>
                      </div>

                    </div>
                  )}
                </>
              )}

              {/* =================================
                  NOTIFICATIONS
              ================================= */}

              {activeSection ===
                "notifications" && (
                <div className="space-y-5">

                  <FormHeader
                    icon={<Bell size={24} />}
                    title="Notification Preferences"
                    description="
                      Control which notifications
                      PharmaFlow sends to you.
                    "
                  />

                  <NotificationRow
                    icon={<Mail size={20} />}
                    title="Email Notifications"
                    description="
                      Receive important PharmaFlow
                      updates through email.
                    "
                    enabled={
                      emailNotifications
                    }
                    onChange={
                      setEmailNotifications
                    }
                  />

                  {userRole ===
                    "SUPER_ADMIN" && (
                    <NotificationRow
                      icon={
                        <FileText size={20} />
                      }
                      title="Approval Notifications"
                      description="
                        Receive notifications when
                        company approvals require attention.
                      "
                      enabled={
                        approvalNotifications
                      }
                      onChange={
                        setApprovalNotifications
                      }
                    />
                  )}

                  {userRole !==
                    "SUPER_ADMIN" && (
                    <>
                      <NotificationRow
                        icon={
                          <Package size={20} />
                        }
                        title="Medicine Requests"
                        description="
                          Receive notifications for
                          medicine requests.
                        "
                        enabled={
                          medicineRequests
                        }
                        onChange={
                          setMedicineRequests
                        }
                      />

                      <NotificationRow
                        icon={
                          <ShoppingCart
                            size={20}
                          />
                        }
                        title="Purchase Order Alerts"
                        description="
                          Receive updates about purchase
                          order activity.
                        "
                        enabled={
                          purchaseOrderAlerts
                        }
                        onChange={
                          setPurchaseOrderAlerts
                        }
                      />

                      <NotificationRow
                        icon={
                          <Package size={20} />
                        }
                        title="Inventory Alerts"
                        description="
                          Receive low-stock and inventory
                          related alerts.
                        "
                        enabled={
                          inventoryAlerts
                        }
                        onChange={
                          setInventoryAlerts
                        }
                      />

                      <NotificationRow
                        icon={
                          <Clock3 size={20} />
                        }
                        title="Expiry Alerts"
                        description="
                          Receive alerts about medicines
                          approaching expiry.
                        "
                        enabled={
                          expiryAlerts
                        }
                        onChange={
                          setExpiryAlerts
                        }
                      />
                    </>
                  )}

                  <NotificationRow
                    icon={
                      <AlertTriangle size={20} />
                    }
                    title="System Alerts"
                    description="
                      Receive important system and
                      operational alerts.
                    "
                    enabled={
                      systemAlerts
                    }
                    onChange={
                      setSystemAlerts
                    }
                  />

                  <div className="flex justify-end pt-2">

                    <SaveButton
                      onClick={
                        handleSaveNotifications
                      }
                    />

                  </div>

                </div>
              )}

              {/* =================================
                  LANGUAGE
              ================================= */}

              {activeSection ===
                "language" && (
                <div className="space-y-6">

                  <FormHeader
                    icon={
                      <Globe size={24} />
                    }
                    title="Language & Region"
                    description="
                      Select your preferred language
                      and regional settings.
                    "
                  />

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
                      Preferred Language
                    </label>

                    <select
                      value={language}
                      onChange={(e) =>
                        setLanguage(
                          e.target.value,
                        )
                      }
                      className="
                        w-full
                        border
                        border-gray-300
                        rounded-lg
                        px-4
                        py-3
                        bg-white
                        outline-none
                        focus:ring-2
                        focus:ring-blue-500
                      "
                    >

                      <option>
                        English
                      </option>

                      <option>
                        Hindi
                      </option>

                      <option>
                        Bengali
                      </option>

                      <option>
                        Marathi
                      </option>

                      <option>
                        Telugu
                      </option>

                      <option>
                        Tamil
                      </option>

                      <option>
                        Gujarati
                      </option>

                      <option>
                        Urdu
                      </option>

                      <option>
                        Kannada
                      </option>

                      <option>
                        Odia
                      </option>

                    </select>

                  </div>

                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-6
                    "
                  >

                    <InfoBox
                      label="Country"
                      value="India"
                    />

                    <InfoBox
                      label="Time Zone"
                      value="IST (UTC +5:30)"
                    />

                  </div>

                  <div className="flex justify-end">

                    <SaveButton
                      onClick={
                        handleSaveLanguage
                      }
                    />

                  </div>

                </div>
              )}

              {/* =================================
                  BILLING
              ================================= */}

              {activeSection ===
                "billing" && (
                <div className="space-y-6">

                  <FormHeader
                    icon={
                      <CreditCard size={24} />
                    }
                    title="Billing Preferences"
                    description="
                      Billing functionality will be
                      available when the subscription
                      module is implemented.
                    "
                  />

                  <div
                    className="
                      bg-gray-50
                      border
                      border-gray-200
                      rounded-xl
                      p-6
                    "
                  >
                    <p
                      className="
                        text-sm
                        text-gray-600
                        leading-6
                      "
                    >
                      PharmaFlow currently does not
                      have a subscription or billing
                      system in the database schema.
                      This section is intentionally
                      kept as a placeholder.
                    </p>
                  </div>

                </div>
              )}

              {/* =================================
                  HELP
              ================================= */}

              {activeSection === "help" && (
                <>
                  {!helpDetail && (
                    <div className="space-y-4">

                      <FormHeader
                        icon={
                          <HelpCircle
                            size={24}
                          />
                        }
                        title="Help & Support"
                        description="
                          Find answers, documentation
                          and support resources.
                        "
                      />

                      <InnerButton
                        icon={
                          <CircleHelp
                            size={20}
                          />
                        }
                        title="Frequently Asked Questions"
                        description="
                          Find answers to commonly
                          asked PharmaFlow questions.
                        "
                        onClick={() =>
                          setHelpDetail(
                            "faq",
                          )
                        }
                      />

                      <InnerButton
                        icon={
                          <MessageCircle
                            size={20}
                          />
                        }
                        title="Contact Support"
                        description="
                          Get assistance with your
                          PharmaFlow account.
                        "
                        onClick={() =>
                          setHelpDetail(
                            "support",
                          )
                        }
                      />

                      <InnerButton
                        icon={
                          <FileText
                            size={20}
                          />
                        }
                        title="Documentation"
                        description="
                          Learn how the main PharmaFlow
                          modules work.
                        "
                        onClick={() =>
                          setHelpDetail(
                            "documentation",
                          )
                        }
                      />

                      <InnerButton
                        icon={
                          <Bug size={20} />
                        }
                        title="Report a Problem"
                        description="
                          Report an issue or unexpected
                          platform behavior.
                        "
                        onClick={() =>
                          setHelpDetail(
                            "problem",
                          )
                        }
                      />

                    </div>
                  )}

                  {helpDetail === "faq" && (
                    <div className="space-y-5">

                      <BackButton
                        onClick={
                          backToSection
                        }
                      />

                      <FormHeader
                        icon={
                          <CircleHelp
                            size={24}
                          />
                        }
                        title="
                          Frequently Asked Questions
                        "
                        description="
                          Common questions about
                          PharmaFlow.
                        "
                      />

                      <FAQ
                        question="
                          What is PharmaFlow?
                        "
                        answer="
                          PharmaFlow is a smart inventory
                          and predictive supply-chain
                          management system designed for
                          pharmaceutical companies,
                          wholesalers and retailers.
                        "
                      />

                      <FAQ
                        question="
                          Which user roles are supported?
                        "
                        answer="
                          PharmaFlow supports Super Admin,
                          Pharma Company, Wholesaler and
                          Retailer roles. Each role receives
                          access to the modules relevant
                          to its responsibilities.
                        "
                      />

                      <FAQ
                        question="
                          What does the Super Admin manage?
                        "
                        answer="
                          The Super Admin manages companies,
                          company approvals, platform
                          analytics, users, system activity
                          and platform-level settings.
                        "
                      />

                      <FAQ
                        question="
                          How does inventory management work?
                        "
                        answer="
                          Inventory is managed by warehouse
                          and medicine batch. Stock quantities,
                          transactions, purchases, sales,
                          returns and expiry information
                          can be tracked.
                        "
                      />

                      <FAQ
                        question="
                          What are medicine batches?
                        "
                        answer="
                          A batch represents a specific
                          manufactured quantity of a medicine
                          with its own batch number, manufacturing
                          date, expiry date, MRP and quantity.
                        "
                      />

                      <FAQ
                        question="
                          What are Purchase Orders?
                        "
                        answer="
                          Purchase Orders allow companies to
                          request medicines from another company
                          within the PharmaFlow supply chain.
                          Orders can move through pending,
                          approved, dispatched and delivered
                          stages.
                        "
                      />

                      <FAQ
                        question="
                          What are expiry alerts?
                        "
                        answer="
                          PharmaFlow identifies medicine batches
                          approaching their expiry date so that
                          users can take appropriate inventory
                          actions.
                        "
                      />

                      <FAQ
                        question="
                          What are purchase recommendations?
                        "
                        answer="
                          The recommendation service analyzes
                          inventory and demand-related information
                          to identify medicines that may need
                          replenishment. Recommendations do not
                          automatically place purchase orders.
                        "
                      />

                      <FAQ
                        question="
                          Is my account protected?
                        "
                        answer="
                          PharmaFlow uses authenticated access,
                          JWT-based sessions, password hashing
                          and role-based authorization to protect
                          application access.
                        "
                      />

                    </div>
                  )}

                  {helpDetail === "support" && (
                    <div className="space-y-5">

                      <BackButton
                        onClick={
                          backToSection
                        }
                      />

                      <FormHeader
                        icon={
                          <MessageCircle
                            size={24}
                          />
                        }
                        title="Contact Support"
                        description="
                          Get assistance with PharmaFlow.
                        "
                      />

                      <InfoBox
                        label="Support Email"
                        value="
                          support@pharmaflow.com
                        "
                      />

                      <InfoBox
                        label="Support Availability"
                        value="
                          Monday – Friday
                        "
                      />

                      <div
                        className="
                          bg-blue-50
                          border
                          border-blue-100
                          rounded-xl
                          p-5
                        "
                      >
                        <p
                          className="
                            text-sm
                            text-blue-700
                            leading-6
                          "
                        >
                          Contact support for account,
                          inventory, purchase order,
                          company approval or technical
                          issues.
                        </p>
                      </div>

                    </div>
                  )}

                  {helpDetail ===
                    "documentation" && (
                    <div className="space-y-5">

                      <BackButton
                        onClick={
                          backToSection
                        }
                      />

                      <FormHeader
                        icon={
                          <FileText size={24} />
                        }
                        title="Documentation"
                        description="
                          Overview of important
                          PharmaFlow modules.
                        "
                      />

                      <HelpRow
                        icon={
                          <Package size={20} />
                        }
                        title="
                          Inventory Management
                        "
                        description="
                          Manage warehouses, stock,
                          batches and inventory transactions.
                        "
                      />

                      <HelpRow
                        icon={
                          <ShoppingCart
                            size={20}
                          />
                        }
                        title="
                          Purchase Orders
                        "
                        description="
                          Create, approve, dispatch and
                          track medicine purchase orders.
                        "
                      />

                      <HelpRow
                        icon={
                          <Clock3 size={20} />
                        }
                        title="
                          Expiry Management
                        "
                        description="
                          Monitor medicine batches that
                          are approaching expiry.
                        "
                      />

                      <HelpRow
                        icon={
                          <Activity size={20} />
                        }
                        title="
                          Analytics & Recommendations
                        "
                        description="
                          Understand inventory trends and
                          receive data-driven recommendations.
                        "
                      />

                    </div>
                  )}

                  {helpDetail === "problem" && (
                    <div className="space-y-5">

                      <BackButton
                        onClick={
                          backToSection
                        }
                      />

                      <FormHeader
                        icon={
                          <Bug size={24} />
                        }
                        title="Report a Problem"
                        description="
                          Tell us about an issue
                          you experienced.
                        "
                      />

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
                          Problem Description
                        </label>

                        <textarea
                          rows={6}
                          placeholder="
                            Describe the problem...
                          "
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

                      <div
                        className="
                          flex
                          justify-end
                        "
                      >

                        <button
                          type="button"
                          onClick={() => {
                            showResultToast(
                              "Changes saved successfully",
                              "success",
                            );

                            window.setTimeout(
                              () => {
                                closeSection();
                              },
                              700,
                            );
                          }}
                          className="
                            bg-blue-600
                            hover:bg-blue-700
                            text-white
                            px-6
                            py-3
                            rounded-lg
                            font-medium
                          "
                        >
                          Submit Report
                        </button>

                      </div>

                    </div>
                  )}

                </>
              )}

              {/* =================================
                  LEGAL
              ================================= */}

              {activeSection === "legal" && (
                <>
                  {!legalDetail && (
                    <div className="space-y-4">

                      <FormHeader
                        icon={
                          <Shield size={24} />
                        }
                        title="Legal & Policies"
                        description="
                          Review important policies
                          related to PharmaFlow usage.
                        "
                      />

                      <InnerButton
                        icon={
                          <Scale size={20} />
                        }
                        title="Terms of Use"
                        description="
                          Rules and conditions for using
                          the PharmaFlow platform.
                        "
                        onClick={() =>
                          setLegalDetail(
                            "terms",
                          )
                        }
                      />

                      <InnerButton
                        icon={
                          <Shield size={20} />
                        }
                        title="Privacy Policy"
                        description="
                          Information about how platform
                          data and account information are handled.
                        "
                        onClick={() =>
                          setLegalDetail(
                            "privacy",
                          )
                        }
                      />

                      <InnerButton
                        icon={
                          <Database size={20} />
                        }
                        title="Data Protection Policy"
                        description="
                          Principles for protecting PharmaFlow
                          data and business information.
                        "
                        onClick={() =>
                          setLegalDetail(
                            "data",
                          )
                        }
                      />

                      <InnerButton
                        icon={
                          <FileText size={20} />
                        }
                        title="Acceptable Use Policy"
                        description="
                          Guidelines for responsible use
                          of PharmaFlow.
                        "
                        onClick={() =>
                          setLegalDetail(
                            "acceptable",
                          )
                        }
                      />

                      <InnerButton
                        icon={
                          <Cookie size={20} />
                        }
                        title="Cookie Policy"
                        description="
                          Information about cookies and
                          similar technologies.
                        "
                        onClick={() =>
                          setLegalDetail(
                            "cookie",
                          )
                        }
                      />

                      <InnerButton
                        icon={
                          <AlertTriangle
                            size={20}
                          />
                        }
                        title="Disclaimer"
                        description="
                          Important limitations and
                          responsibilities.
                        "
                        onClick={() =>
                          setLegalDetail(
                            "disclaimer",
                          )
                        }
                      />

                    </div>
                  )}

                  {legalDetail === "terms" && (
                    <LegalPage
                      title="Terms of Use"
                      icon={
                        <Scale size={24} />
                      }
                      onBack={
                        backToSection
                      }
                    >
                      <LegalHeading>
                        Platform Usage
                      </LegalHeading>

                      <LegalText>
                        PharmaFlow is intended to
                        support pharmaceutical inventory,
                        supply-chain and business
                        management activities.
                      </LegalText>

                      <LegalHeading>
                        Authorized Access
                      </LegalHeading>

                      <LegalText>
                        Users should access only the
                        information and functionality
                        permitted by their assigned role.
                        Users are responsible for keeping
                        their login credentials secure.
                      </LegalText>

                      <LegalHeading>
                        Business Data
                      </LegalHeading>

                      <LegalText>
                        Companies are responsible for
                        maintaining accurate medicine,
                        inventory, purchase, sales and
                        business information within the
                        platform.
                      </LegalText>

                      <LegalHeading>
                        Regulatory Responsibility
                      </LegalHeading>

                      <LegalText>
                        PharmaFlow provides software
                        management functionality. Each
                        organization remains responsible
                        for complying with applicable
                        pharmaceutical, business and
                        regulatory requirements.
                      </LegalText>

                    </LegalPage>
                  )}

                  {legalDetail === "privacy" && (
                    <LegalPage
                      title="Privacy Policy"
                      icon={
                        <Shield size={24} />
                      }
                      onBack={
                        backToSection
                      }
                    >
                      <LegalHeading>
                        Information We Handle
                      </LegalHeading>

                      <LegalText>
                        PharmaFlow may handle account,
                        company, inventory, medicine,
                        purchase order, sales and
                        operational information required
                        to provide the platform.
                      </LegalText>

                      <LegalHeading>
                        Account Information
                      </LegalHeading>

                      <LegalText>
                        User information such as name,
                        email, role and company association
                        is used to authenticate users and
                        provide role-specific functionality.
                      </LegalText>

                      <LegalHeading>
                        Access Control
                      </LegalHeading>

                      <LegalText>
                        Access to platform functionality
                        is controlled using authentication
                        and role-based authorization.
                      </LegalText>

                      <LegalHeading>
                        Data Security
                      </LegalHeading>

                      <LegalText>
                        PharmaFlow uses security mechanisms
                        such as password hashing,
                        authenticated API requests and
                        role-based access controls.
                      </LegalText>

                    </LegalPage>
                  )}

                  {legalDetail === "data" && (
                    <LegalPage
                      title="Data Protection Policy"
                      icon={
                        <Database size={24} />
                      }
                      onBack={
                        backToSection
                      }
                    >
                      <LegalHeading>
                        Data Protection
                      </LegalHeading>

                      <LegalText>
                        Business and operational data
                        should be accessed only by
                        authorized users and handled
                        for legitimate PharmaFlow
                        activities.
                      </LegalText>

                      <LegalHeading>
                        Role-Based Access
                      </LegalHeading>

                      <LegalText>
                        PharmaFlow separates access
                        according to Super Admin,
                        Pharma, Wholesaler and Retailer
                        responsibilities.
                      </LegalText>

                      <LegalHeading>
                        Data Accuracy
                      </LegalHeading>

                      <LegalText>
                        Organizations should ensure that
                        information entered into PharmaFlow
                        is accurate and maintained regularly.
                      </LegalText>

                    </LegalPage>
                  )}

                  {legalDetail ===
                    "acceptable" && (
                    <LegalPage
                      title="Acceptable Use Policy"
                      icon={
                        <FileText size={24} />
                      }
                      onBack={
                        backToSection
                      }
                    >
                      <LegalHeading>
                        Appropriate Usage
                      </LegalHeading>

                      <LegalText>
                        PharmaFlow should be used for
                        legitimate inventory, pharmaceutical
                        supply-chain, administrative and
                        business operations.
                      </LegalText>

                      <LegalHeading>
                        Account Misuse
                      </LegalHeading>

                      <LegalText>
                        Users should not share credentials,
                        attempt unauthorized access or
                        intentionally interfere with
                        platform operations.
                      </LegalText>

                      <LegalHeading>
                        Business Integrity
                      </LegalHeading>

                      <LegalText>
                        Users should maintain accurate
                        inventory, medicine, transaction
                        and supply-chain information.
                      </LegalText>

                    </LegalPage>
                  )}

                  {legalDetail === "cookie" && (
                    <LegalPage
                      title="Cookie Policy"
                      icon={
                        <Cookie size={24} />
                      }
                      onBack={
                        backToSection
                      }
                    >
                      <LegalHeading>
                        What Are Cookies?
                      </LegalHeading>

                      <LegalText>
                        Cookies and similar technologies
                        may be used to support authentication,
                        preferences and application
                        functionality.
                      </LegalText>

                      <LegalHeading>
                        Authentication
                      </LegalHeading>

                      <LegalText>
                        Authentication-related mechanisms
                        help maintain secure user sessions
                        while using PharmaFlow.
                      </LegalText>

                      <LegalHeading>
                        Preferences
                      </LegalHeading>

                      <LegalText>
                        Preferences such as selected
                        application settings may be stored
                        to provide a consistent experience.
                      </LegalText>

                    </LegalPage>
                  )}

                  {legalDetail ===
                    "disclaimer" && (
                    <LegalPage
                      title="Disclaimer"
                      icon={
                        <AlertTriangle
                          size={24}
                        />
                      }
                      onBack={
                        backToSection
                      }
                    >
                      <LegalHeading>
                        Software Platform
                      </LegalHeading>

                      <LegalText>
                        PharmaFlow is a software platform
                        designed to support inventory and
                        supply-chain management.
                      </LegalText>

                      <LegalHeading>
                        Business Decisions
                      </LegalHeading>

                      <LegalText>
                        Inventory, purchasing, sales and
                        supply-chain decisions remain the
                        responsibility of the organization
                        using the platform.
                      </LegalText>

                      <LegalHeading>
                        Regulatory Compliance
                      </LegalHeading>

                      <LegalText>
                        Organizations remain responsible
                        for compliance with applicable
                        pharmaceutical and business
                        regulations.
                      </LegalText>

                    </LegalPage>
                  )}

                </>
              )}

            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

// ==========================================
// SETTING CARD
// ==========================================

function SettingCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        text-left
        bg-white
        border
        border-gray-200
        rounded-xl
        p-6
        shadow-sm
        hover:shadow-md
        hover:border-blue-300
        transition
        duration-200
        group
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
          mb-4
          group-hover:bg-blue-600
          group-hover:text-white
          transition
        "
      >
        {icon}
      </div>

      <h3
        className="
          text-lg
          font-semibold
          text-gray-800
        "
      >
        {title}
      </h3>

      <p
        className="
          text-sm
          text-gray-500
          mt-2
          leading-6
        "
      >
        {description}
      </p>
    </button>
  );
}

// ==========================================
// FORM HEADER
// ==========================================

function FormHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-4
        pb-5
        border-b
        border-gray-100
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
        {icon}
      </div>

      <div>

        <h3
          className="
            text-xl
            font-semibold
            text-gray-800
          "
        >
          {title}
        </h3>

        <p
          className="
            text-sm
            text-gray-500
            mt-1
          "
        >
          {description}
        </p>

      </div>

    </div>
  );
}

// ==========================================
// BACK BUTTON
// ==========================================

function BackButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        inline-flex
        items-center
        gap-2
        text-sm
        font-medium
        text-blue-600
        hover:text-blue-800
        transition
      "
    >
      <ArrowLeft size={17} />
      Back
    </button>
  );
}

// ==========================================
// SAVE BUTTON
// ==========================================

function SaveButton({
  onClick,
  loading = false,
}: {
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="
        flex
        items-center
        gap-2
        bg-blue-600
        hover:bg-blue-700
        disabled:bg-blue-300
        text-white
        px-6
        py-3
        rounded-lg
        font-medium
        transition
      "
    >
      <Save size={18} />

      {loading
        ? "Saving..."
        : "Save Changes"}
    </button>
  );
}

// ==========================================
// INPUT
// ==========================================

function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
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
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
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
// INFO BOX
// ==========================================

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
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
      </label>

      <div
        className="
          bg-gray-100
          border
          border-gray-200
          rounded-lg
          px-4
          py-3
          text-gray-600
        "
      >
        {value}
      </div>

    </div>
  );
}

// ==========================================
// INNER BUTTON
// ==========================================

function InnerButton({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full
        text-left
        flex
        items-center
        justify-between
        gap-4
        p-5
        bg-white
        border
        border-gray-200
        rounded-xl
        hover:border-blue-300
        hover:shadow-sm
        transition
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
            flex-shrink-0
          "
        >
          {icon}
        </div>

        <div>

          <p
            className="
              font-semibold
              text-gray-800
            "
          >
            {title}
          </p>

          <p
            className="
              text-sm
              text-gray-500
              mt-1
            "
          >
            {description}
          </p>

        </div>

      </div>

      <ExternalLink
        size={18}
        className="
          text-gray-400
          flex-shrink-0
        "
      />

    </button>
  );
}

// ==========================================
// NOTIFICATION ROW
// ==========================================

function NotificationRow({
  icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-6
        p-5
        bg-white
        border
        border-gray-200
        rounded-xl
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
            w-10
            h-10
            rounded-lg
            bg-blue-50
            text-blue-600
            flex
            items-center
            justify-center
            flex-shrink-0
          "
        >
          {icon}
        </div>

        <div>

          <p
            className="
              font-medium
              text-gray-800
            "
          >
            {title}
          </p>

          <p
            className="
              text-sm
              text-gray-500
              mt-1
            "
          >
            {description}
          </p>

        </div>

      </div>

      <button
        type="button"
        onClick={() =>
          onChange(!enabled)
        }
        className={`
          relative
          w-12
          h-6
          rounded-full
          transition
          flex-shrink-0
          ${
            enabled
              ? "bg-blue-600"
              : "bg-gray-300"
          }
        `}
      >

        <span
          className={`
            absolute
            top-1
            w-4
            h-4
            bg-white
            rounded-full
            transition
            ${
              enabled
                ? "left-7"
                : "left-1"
            }
          `}
        />

      </button>

    </div>
  );
}

// ==========================================
// SECURITY STATUS
// ==========================================

function SecurityStatus({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-4
        p-5
        bg-white
        border
        border-gray-200
        rounded-xl
      "
    >

      <div
        className="
          w-10
          h-10
          rounded-lg
          bg-green-50
          text-green-600
          flex
          items-center
          justify-center
          font-bold
        "
      >
        ✓
      </div>

      <div>

        <p
          className="
            font-medium
            text-gray-800
          "
        >
          {title}
        </p>

        <p
          className="
            text-sm
            text-gray-500
            mt-1
          "
        >
          {description}
        </p>

      </div>

    </div>
  );
}

// ==========================================
// ACTIVITY
// ==========================================

function ActivityRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-4
        p-5
        bg-white
        border
        border-gray-200
        rounded-xl
      "
    >

      <div
        className="
          w-10
          h-10
          rounded-lg
          bg-blue-50
          text-blue-600
          flex
          items-center
          justify-center
        "
      >
        <Activity size={20} />
      </div>

      <div>

        <p
          className="
            font-medium
            text-gray-800
          "
        >
          {title}
        </p>

        <p
          className="
            text-sm
            text-gray-500
            mt-1
          "
        >
          {description}
        </p>

      </div>

    </div>
  );
}

// ==========================================
// FAQ
// ==========================================

function FAQ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div
      className="
        bg-white
        border
        border-gray-200
        rounded-xl
        p-5
      "
    >

      <h4
        className="
          font-semibold
          text-gray-800
        "
      >
        {question}
      </h4>

      <p
        className="
          text-sm
          text-gray-500
          mt-2
          leading-7
        "
      >
        {answer}
      </p>

    </div>
  );
}

// ==========================================
// HELP ROW
// ==========================================

function HelpRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        p-5
        bg-white
        border
        border-gray-200
        rounded-xl
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
            w-10
            h-10
            rounded-lg
            bg-blue-50
            text-blue-600
            flex
            items-center
            justify-center
          "
        >
          {icon}
        </div>

        <div>

          <p
            className="
              font-medium
              text-gray-800
            "
          >
            {title}
          </p>

          <p
            className="
              text-sm
              text-gray-500
              mt-1
            "
          >
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}

// ==========================================
// LEGAL PAGE
// ==========================================

function LegalPage({
  title,
  icon,
  onBack,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">

      <BackButton onClick={onBack} />

      <FormHeader
        icon={icon}
        title={title}
        description="
          Important information related
          to PharmaFlow.
        "
      />

      <div
        className="
          bg-gray-50
          rounded-xl
          p-6
          space-y-5
        "
      >
        {children}
      </div>

    </div>
  );
}

// ==========================================
// LEGAL HEADING
// ==========================================

function LegalHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h4
      className="
        text-base
        font-semibold
        text-gray-800
      "
    >
      {children}
    </h4>
  );
}

// ==========================================
// LEGAL TEXT
// ==========================================

function LegalText({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p
      className="
        text-sm
        text-gray-600
        leading-7
      "
    >
      {children}
    </p>
  );
}

// ==========================================
// LOADING
// ==========================================

function LoadingBox() {
  return (
    <div
      className="
        bg-gray-50
        rounded-xl
        p-6
        text-gray-500
      "
    >
      Loading profile...
    </div>
  );
}

export default Settings;