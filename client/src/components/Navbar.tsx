import {
  Bell,
  User,
  LogOut,
  ArrowLeft,
  Check,
  Clock,
  Search,
  RefreshCw,
  X,
  Package,
  WalletCards,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Info,
  ClipboardList,
  Boxes,
} from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

/* =========================================================
   TYPES
   ========================================================= */

type NavbarProps = {
  role: string;
};

type Notification = {
  id: string;
  recipientCompanyId: string;
  senderCompanyId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

type NotificationCategory =
  | "ALL"
  | "ORDERS"
  | "PAYMENTS"
  | "INVENTORY"
  | "SYSTEM";

/* =========================================================
   SORT NOTIFICATIONS
   Unread → top
   Read → bottom
   Newest first within each group
   ========================================================= */

const sortNotifications = (notificationList: Notification[]) => {
  return [...notificationList].sort((a, b) => {
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

/* =========================================================
   NOTIFICATION CATEGORY
   ========================================================= */

const getNotificationCategory = (type: string): NotificationCategory => {
  const normalizedType = type.toUpperCase();

  if (normalizedType.includes("PAYMENT")) {
    return "PAYMENTS";
  }

  if (
    normalizedType.includes("ORDER") ||
    normalizedType.includes("PURCHASE") ||
    normalizedType.includes("DISPATCH") ||
    normalizedType.includes("DELIVERY")
  ) {
    return "ORDERS";
  }

  if (
    normalizedType.includes("STOCK") ||
    normalizedType.includes("INVENTORY") ||
    normalizedType.includes("EXPIRY") ||
    normalizedType.includes("BATCH")
  ) {
    return "INVENTORY";
  }

  return "SYSTEM";
};

/* =========================================================
   NOTIFICATION STYLE
   ========================================================= */

const getNotificationStyle = (type: string, isRead: boolean) => {
  const normalizedType = type.toUpperCase();

  if (normalizedType.includes("PAYMENT")) {
    return isRead ? "bg-gray-100 text-gray-500" : "bg-amber-100 text-amber-600";
  }

  if (
    normalizedType.includes("EXPIRY") ||
    normalizedType.includes("WARNING") ||
    normalizedType.includes("URGENT")
  ) {
    return isRead ? "bg-gray-100 text-gray-500" : "bg-red-100 text-red-600";
  }

  if (
    normalizedType.includes("SUCCESS") ||
    normalizedType.includes("CONFIRMED")
  ) {
    return isRead ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-600";
  }

  if (
    normalizedType.includes("ORDER") ||
    normalizedType.includes("PURCHASE") ||
    normalizedType.includes("DISPATCH")
  ) {
    return isRead ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-600";
  }

  return isRead ? "bg-gray-100 text-gray-500" : "bg-purple-100 text-purple-600";
};

/* =========================================================
   PRIORITY
   ========================================================= */

const getPriorityLabel = (type: string) => {
  const normalizedType = type.toUpperCase();

  if (normalizedType.includes("URGENT")) {
    return {
      label: "Urgent",
      style: "bg-red-100 text-red-600",
    };
  }

  if (
    normalizedType.includes("WARNING") ||
    normalizedType.includes("PAYMENT") ||
    normalizedType.includes("EXPIRY")
  ) {
    return {
      label: "Important",
      style: "bg-amber-100 text-amber-600",
    };
  }

  if (
    normalizedType.includes("SUCCESS") ||
    normalizedType.includes("CONFIRMED")
  ) {
    return {
      label: "Success",
      style: "bg-green-100 text-green-600",
    };
  }

  return {
    label: "Info",
    style: "bg-blue-100 text-blue-600",
  };
};

/* =========================================================
   RELATIVE TIME
   ========================================================= */

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);

  const now = new Date();

  const difference = now.getTime() - date.getTime();

  const seconds = Math.floor(difference / 1000);

  const minutes = Math.floor(seconds / 60);

  const hours = Math.floor(minutes / 60);

  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  }

  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   EXACT TIME
   ========================================================= */

const formatExactTime = (dateString: string) => {
  const date = new Date(dateString);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =========================================================
   NOTIFICATION ICON COMPONENT
   IMPORTANT:
   This is OUTSIDE Navbar.
   ========================================================= */

type NotificationIconProps = {
  notification: Notification;
  large?: boolean;
};

const renderNotificationIcon = (type: string, size: number) => {
  const normalizedType = type.toUpperCase();

  if (normalizedType.includes("PAYMENT")) {
    return <WalletCards size={size} />;
  }

  if (
    normalizedType.includes("DISPATCH") ||
    normalizedType.includes("DELIVERY")
  ) {
    return <Truck size={size} />;
  }

  if (
    normalizedType.includes("STOCK") ||
    normalizedType.includes("INVENTORY")
  ) {
    return <Boxes size={size} />;
  }

  if (normalizedType.includes("EXPIRY")) {
    return <AlertTriangle size={size} />;
  }

  if (
    normalizedType.includes("SUCCESS") ||
    normalizedType.includes("CONFIRMED")
  ) {
    return <CheckCircle2 size={size} />;
  }

  if (normalizedType.includes("ORDER") || normalizedType.includes("PURCHASE")) {
    return <Package size={size} />;
  }

  if (normalizedType.includes("WARNING") || normalizedType.includes("URGENT")) {
    return <AlertTriangle size={size} />;
  }

  if (normalizedType.includes("INFO")) {
    return <Info size={size} />;
  }

  return <Bell size={size} />;
};

function NotificationIcon({
  notification,
  large = false,
}: NotificationIconProps) {
  const iconSize = large ? 22 : 18;

  return (
    <div
      className={`
        ${large ? "w-12 h-12" : "w-10 h-10"}
        rounded-full
        flex
        items-center
        justify-center
        flex-shrink-0
        ${getNotificationStyle(notification.type, notification.isRead)}
      `}
    >
      {renderNotificationIcon(notification.type, iconSize)}
    </div>
  );
}
/* =========================================================
   NAVBAR
   ========================================================= */

function Navbar({ role }: NavbarProps) {
  const navigate = useNavigate();

  /* =======================================================
     STATES
     ======================================================= */

  const [showNotifications, setShowNotifications] = useState(false);

  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState<NotificationCategory>("ALL");

  /* =======================================================
     REFS
     ======================================================= */

  const notificationRef = useRef<HTMLDivElement | null>(null);

  const adminRef = useRef<HTMLDivElement | null>(null);

  /* =======================================================
     ROLE NAMES
     ======================================================= */

  const roleNames: Record<string, string> = {
    admin: "Super Admin Command Center",
    pharma: "Pharma Company",
    wholesaler: "Wholesaler",
    retailer: "Retailer",
  };

  const roleDisplayNames: Record<string, string> = {
    admin: "Super Admin",
    pharma: "Pharma Company",
    wholesaler: "Wholesaler",
    retailer: "Retailer",
  };

  const currentRole = role.toLowerCase();

  const displayRole = roleDisplayNames[currentRole] || "User";

  const accountDescription: Record<string, string> = {
    admin: "Administrator",
    pharma: "Pharma Company Account",
    wholesaler: "Wholesaler Account",
    retailer: "Retailer Account",
  };
  /* =======================================================
     FETCH UNREAD COUNT
     ======================================================= */

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await fetch(
        "http://localhost:5000/api/notifications/unread-count",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch unread count");
      }

      const result = await response.json();

      if (result.success) {
        setUnreadCount(result.data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch unread notification count:", error);
    }
  }, []);

  /* =======================================================
     FETCH NOTIFICATIONS
     ======================================================= */

  const fetchNotifications = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoadingNotifications(true);
      }

      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await fetch("http://localhost:5000/api/notifications", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const result = await response.json();

      if (result.success) {
        setNotifications(sortNotifications(result.data));
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      if (showLoader) {
        setLoadingNotifications(false);
      }
    }
  }, []);

  /* =======================================================
     INITIAL UNREAD COUNT
     ======================================================= */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchUnreadCount();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [fetchUnreadCount]);

  /* =======================================================
     LOAD NOTIFICATIONS WHEN BELL OPENS
     ======================================================= */

  useEffect(() => {
    if (!showNotifications) {
      return;
    }

    const timer = window.setTimeout(() => {
      void fetchNotifications();
      void fetchUnreadCount();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [showNotifications, fetchNotifications, fetchUnreadCount]);

  /* =======================================================
     CLOSE DROPDOWNS ON OUTSIDE CLICK
     ======================================================= */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setShowNotifications(false);

        setSelectedNotification(null);
      }

      if (adminRef.current && !adminRef.current.contains(target)) {
        setShowAdminMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* =======================================================
     MARK NOTIFICATION AS READ
     ======================================================= */

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      const result = await response.json();

      if (!result.success) {
        return;
      }

      /* Update local notification */

      setNotifications((previous) =>
        sortNotifications(
          previous.map((notification) =>
            notification.id === notificationId
              ? {
                  ...notification,
                  isRead: true,
                }
              : notification,
          ),
        ),
      );

      /* Update unread badge */

      setUnreadCount((previous) => (previous > 0 ? previous - 1 : 0));

      /* Update currently selected notification */

      setSelectedNotification((previous) =>
        previous && previous.id === notificationId
          ? {
              ...previous,
              isRead: true,
            }
          : previous,
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  /* =======================================================
     OPEN NOTIFICATION
     ======================================================= */

  const openNotification = async (notification: Notification) => {
    /* Show detail immediately */

    setSelectedNotification(notification);

    /* Mark as read */

    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  /* =======================================================
     MARK ALL AS READ
     ======================================================= */

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(
      (notification) => !notification.isRead,
    );

    for (const notification of unreadNotifications) {
      await markAsRead(notification.id);
    }
  };

  /* =======================================================
     REFRESH
     ======================================================= */

  const refreshNotifications = async () => {
    try {
      setRefreshing(true);

      await Promise.all([fetchNotifications(false), fetchUnreadCount()]);
    } catch (error) {
      console.error("Failed to refresh notifications:", error);
    } finally {
      setRefreshing(false);
    }
  };

  /* =======================================================
     FILTER NOTIFICATIONS
     ======================================================= */

  const filteredNotifications = notifications.filter((notification) => {
    const categoryMatches =
      selectedCategory === "ALL" ||
      getNotificationCategory(notification.type) === selectedCategory;

    const searchText = searchQuery.trim().toLowerCase();

    const searchMatches =
      searchText === "" ||
      notification.title.toLowerCase().includes(searchText) ||
      notification.message.toLowerCase().includes(searchText) ||
      notification.type.toLowerCase().includes(searchText);

    return categoryMatches && searchMatches;
  });

  /* =======================================================
     CATEGORY COUNT
     ======================================================= */

  const categoryCount = (category: NotificationCategory) => {
    if (category === "ALL") {
      return notifications.length;
    }

    return notifications.filter(
      (notification) => getNotificationCategory(notification.type) === category,
    ).length;
  };

  /* =======================================================
     SEE ALL
     ======================================================= */

  const handleSeeAllNotifications = () => {
    setShowAllNotifications(true);

    setShowNotifications(false);

    setSelectedNotification(null);

    setSearchQuery("");

    setSelectedCategory("ALL");

    void fetchNotifications(false);
  };

  /* =======================================================
     CLOSE ALL
     ======================================================= */

  const closeAllNotifications = () => {
    setShowAllNotifications(false);

    setSelectedNotification(null);

    setSearchQuery("");

    setSelectedCategory("ALL");
  };

  /* =======================================================
     LOGOUT
     ======================================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setShowAdminMenu(false);

    navigate("/");
  };

  /* =======================================================
     NOTIFICATION CARD
     ======================================================= */

  const renderNotificationCard = (notification: Notification) => {
    const priority = getPriorityLabel(notification.type);

    return (
      <button
        key={notification.id}
        type="button"
        onClick={() => void openNotification(notification)}
        className={`
          w-full
          text-left
          p-4
          rounded-xl
          border
          transition-all
          duration-200
          ${
            notification.isRead
              ? "bg-white border-gray-200 hover:bg-gray-50"
              : "bg-blue-50 border-blue-100 hover:bg-blue-100 shadow-sm"
          }
        `}
      >
        <div className="flex items-start gap-3">
          <NotificationIcon notification={notification} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {!notification.isRead && (
                  <span
                    className="
                      w-2
                      h-2
                      rounded-full
                      bg-blue-600
                      flex-shrink-0
                    "
                  />
                )}

                <h3
                  className={`
                    text-sm
                    truncate
                    ${
                      notification.isRead
                        ? "font-medium text-gray-600"
                        : "font-semibold text-gray-800"
                    }
                  `}
                >
                  {notification.title}
                </h3>
              </div>

              <span
                className={`
                  flex-shrink-0
                  text-[10px]
                  px-2
                  py-1
                  rounded-full
                  ${priority.style}
                `}
              >
                {priority.label}
              </span>
            </div>

            <p
              className="
                text-xs
                text-gray-500
                mt-1
                line-clamp-2
              "
            >
              {notification.message}
            </p>

            <div
              className="
                flex
                items-center
                gap-2
                mt-2
              "
            >
              <Clock size={12} className="text-gray-400" />

              <span className="text-[11px] text-gray-400">
                {formatRelativeTime(notification.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </button>
    );
  };

  /* =======================================================
     RETURN
     ======================================================= */

  return (
    <>
      {/* ==================================================
          NAVBAR
          ================================================== */}

      <header
        className="
          sticky
          top-0
          z-40
          h-16
          bg-white
          border-b
          border-gray-200
          flex
          items-center
          justify-between
          px-4
          md:px-8
        "
      >
        {/* LOGO */}

        <div>
          <h1
            className="
              text-xl
              md:text-2xl
              font-bold
              text-blue-600
            "
          >
            🏥 PharmaFlow
          </h1>
        </div>

        <div
          className="
            flex
            items-center
            gap-2
            md:gap-6
          "
        >
          {/* ROLE */}

          <h2
            className="
              hidden
              md:block
              text-lg
              font-semibold
              text-gray-700
            "
          >
            {roleNames[role] || role}
          </h2>

          {/* ==================================================
              NOTIFICATION BELL
              ================================================== */}

          <div ref={notificationRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);

                setShowAdminMenu(false);

                setSelectedNotification(null);
              }}
              className="
                relative
                p-2
                rounded-lg
                hover:bg-gray-100
                transition
              "
              aria-label="Notifications"
            >
              <Bell size={22} />

              {unreadCount > 0 && (
                <span
                  className="
                    absolute
                    -top-1
                    -right-1
                    bg-red-500
                    text-white
                    text-[10px]
                    font-semibold
                    rounded-full
                    min-w-[18px]
                    h-[18px]
                    flex
                    items-center
                    justify-center
                    px-1
                    ring-2
                    ring-white
                  "
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* =================================================
                QUICK NOTIFICATION PANEL
                ================================================= */}

            {showNotifications && (
              <div
                className="
                  absolute
                  right-0
                  top-12
                  w-[calc(100vw-2rem)]
                  max-w-[420px]
                  bg-white
                  border
                  border-gray-200
                  rounded-2xl
                  shadow-2xl
                  z-50
                  overflow-hidden
                "
              >
                {/* DETAIL */}

                {selectedNotification ? (
                  <div>
                    {/* DETAIL HEADER */}

                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        px-4
                        py-3
                        border-b
                      "
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedNotification(null)}
                        className="
                          p-2
                          rounded-lg
                          hover:bg-gray-100
                        "
                      >
                        <ArrowLeft size={18} />
                      </button>

                      <h3 className="font-semibold text-gray-800">
                        Notification Details
                      </h3>
                    </div>

                    {/* DETAIL CONTENT */}

                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <NotificationIcon
                          notification={selectedNotification}
                          large
                        />

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {selectedNotification.title}
                          </h3>

                          <div className="flex items-center gap-2 mt-2">
                            <Clock size={14} className="text-gray-400" />

                            <span className="text-xs text-gray-400">
                              {formatExactTime(selectedNotification.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CATEGORY */}

                      <div className="flex flex-wrap gap-2 mt-5">
                        <span
                          className="
                            text-xs
                            bg-gray-100
                            text-gray-600
                            px-3
                            py-1.5
                            rounded-full
                          "
                        >
                          {getNotificationCategory(selectedNotification.type)}
                        </span>

                        <span
                          className={`
                            text-xs
                            px-3
                            py-1.5
                            rounded-full
                            ${getPriorityLabel(selectedNotification.type).style}
                          `}
                        >
                          {getPriorityLabel(selectedNotification.type).label}
                        </span>
                      </div>

                      {/* MESSAGE */}

                      <div
                        className="
                          mt-5
                          p-5
                          bg-gray-50
                          border
                          border-gray-100
                          rounded-xl
                        "
                      >
                        <p className="text-sm text-gray-700 leading-7">
                          {selectedNotification.message}
                        </p>
                      </div>

                      {/* READ */}

                      <div
                        className="
                          mt-5
                          flex
                          items-center
                          gap-3
                          p-3
                          bg-green-50
                          border
                          border-green-100
                          rounded-xl
                        "
                      >
                        <div
                          className="
                            w-8
                            h-8
                            rounded-full
                            bg-green-100
                            text-green-600
                            flex
                            items-center
                            justify-center
                          "
                        >
                          <Check size={16} />
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-green-700">
                            Notification read
                          </p>

                          <p className="text-[11px] text-green-600">
                            This notification has been acknowledged.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* =================================================
                     QUICK LIST
                     ================================================= */

                  <>
                    {/* HEADER */}

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        px-4
                        py-3
                        border-b
                      "
                    >
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          Notifications
                        </h3>

                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {unreadCount} unread
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => void refreshNotifications()}
                        disabled={refreshing}
                        className="
                          p-2
                          rounded-lg
                          hover:bg-gray-100
                          text-gray-500
                          disabled:opacity-50
                        "
                        title="Refresh notifications"
                      >
                        <RefreshCw
                          size={16}
                          className={refreshing ? "animate-spin" : ""}
                        />
                      </button>
                    </div>

                    {/* LIST */}

                    <div
                      className="
                        max-h-[390px]
                        overflow-y-auto
                        p-2
                      "
                    >
                      {loadingNotifications ? (
                        <div className="py-12 text-center text-sm text-gray-500">
                          Loading notifications...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="py-12 text-center">
                          <Bell size={30} className="mx-auto text-gray-300" />

                          <p className="text-sm text-gray-500 mt-3">
                            No notifications
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            You're all caught up.
                          </p>
                        </div>
                      ) : (
                        notifications.slice(0, 5).map(renderNotificationCard)
                      )}
                    </div>

                    {/* FOOTER */}

                    {notifications.length > 0 && (
                      <div
                        className="
                          border-t
                          p-3
                          space-y-2
                        "
                      >
                        <button
                          type="button"
                          onClick={handleSeeAllNotifications}
                          className="
                            w-full
                            flex
                            items-center
                            justify-center
                            gap-2
                            text-sm
                            font-medium
                            text-blue-600
                            hover:text-blue-700
                            hover:underline
                          "
                        >
                          <ClipboardList size={15} />
                          See all notifications
                        </button>

                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={() => void markAllAsRead()}
                            className="
                              w-full
                              text-center
                              text-xs
                              text-gray-500
                              hover:text-gray-700
                            "
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ==================================================
              USER MENU
              ================================================== */}

          <div ref={adminRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setShowAdminMenu(!showAdminMenu);
                setShowNotifications(false);
                setSelectedNotification(null);
              }}
              className="
      flex
      items-center
      gap-2
      px-3
      py-2
      rounded-lg
      hover:bg-gray-100
      transition
    "
            >
              <User size={20} />

              <span className="font-medium">{displayRole}</span>

              <span
                className={`text-xs transition-transform ${
                  showAdminMenu ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {showAdminMenu && (
              <div
                className="
        absolute
        right-0
        top-12
        w-52
        bg-white
        border
        border-gray-200
        rounded-xl
        shadow-lg
        z-50
        overflow-hidden
      "
              >
                {/* Dynamic user role */}
                <div className="px-4 py-3 border-b">
                  <p className="font-semibold text-gray-800">{displayRole}</p>

                  <p className="text-xs text-gray-500 mt-1">
                    {accountDescription[currentRole] || "User Account"}
                  </p>
                </div>

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="
          w-full
          flex
          items-center
          gap-3
          px-4
          py-3
          text-left
          text-red-600
          hover:bg-red-50
          transition
        "
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ======================================================
          ALL NOTIFICATIONS MODAL
          ====================================================== */}

      {showAllNotifications && (
        <div
          className="
            fixed
            inset-0
            bg-black/40
            backdrop-blur-[2px]
            z-[100]
            flex
            items-center
            justify-center
            p-4
            md:p-6
          "
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeAllNotifications();
            }
          }}
        >
          <div
            className="
              w-full
              max-w-4xl
              max-h-[90vh]
              bg-white
              rounded-2xl
              shadow-2xl
              overflow-hidden
              flex
              flex-col
            "
          >
            {/* MODAL HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                px-5
                md:px-6
                py-4
                border-b
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    w-10
                    h-10
                    rounded-full
                    bg-blue-100
                    text-blue-600
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Bell size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    All Notifications
                  </h2>

                  <p className="text-xs text-gray-500 mt-1">
                    {unreadCount} unread notification
                    {unreadCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => void markAllAsRead()}
                    className="
                      hidden
                      sm:block
                      text-sm
                      text-blue-600
                      hover:underline
                    "
                  >
                    Mark all as read
                  </button>
                )}

                <button
                  type="button"
                  onClick={closeAllNotifications}
                  className="
                    p-2
                    rounded-lg
                    hover:bg-gray-100
                    text-gray-500
                  "
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* SEARCH */}

            {!selectedNotification && (
              <div
                className="
                  px-5
                  md:px-6
                  pt-4
                "
              >
                <div className="relative">
                  <Search
                    size={17}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                    "
                  />

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search notifications..."
                    className="
                      w-full
                      pl-10
                      pr-4
                      py-2.5
                      border
                      border-gray-200
                      rounded-xl
                      text-sm
                      outline-none
                      focus:ring-2
                      focus:ring-blue-100
                      focus:border-blue-400
                    "
                  />
                </div>
              </div>
            )}

            {/* CATEGORY FILTERS */}

            {!selectedNotification && (
              <div
                className="
                  px-5
                  md:px-6
                  py-4
                  border-b
                  overflow-x-auto
                "
              >
                <div className="flex gap-2 min-w-max">
                  {[
                    {
                      key: "ALL" as const,
                      label: "All",
                    },
                    {
                      key: "ORDERS" as const,
                      label: "Orders",
                    },
                    {
                      key: "PAYMENTS" as const,
                      label: "Payments",
                    },
                    {
                      key: "INVENTORY" as const,
                      label: "Inventory",
                    },
                    {
                      key: "SYSTEM" as const,
                      label: "System",
                    },
                  ].map((category) => {
                    const active = selectedCategory === category.key;

                    return (
                      <button
                        key={category.key}
                        type="button"
                        onClick={() => setSelectedCategory(category.key)}
                        className={`
                          flex
                          items-center
                          gap-2
                          px-3
                          py-2
                          rounded-lg
                          text-xs
                          font-medium
                          transition
                          ${
                            active
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }
                        `}
                      >
                        {category.key === "ALL" && <Bell size={14} />}

                        {category.key === "ORDERS" && <Package size={14} />}

                        {category.key === "PAYMENTS" && (
                          <WalletCards size={14} />
                        )}

                        {category.key === "INVENTORY" && <Boxes size={14} />}

                        {category.key === "SYSTEM" && <Info size={14} />}

                        {category.label}

                        <span
                          className={active ? "text-blue-100" : "text-gray-400"}
                        >
                          ({categoryCount(category.key)})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ==================================================
                MODAL CONTENT
                ================================================== */}

            <div
              className="
                flex-1
                overflow-y-auto
                p-4
                md:p-6
              "
            >
              {selectedNotification ? (
                /* =================================================
                   FULL DETAIL VIEW
                   ================================================= */

                <div>
                  <button
                    type="button"
                    onClick={() => setSelectedNotification(null)}
                    className="
                      flex
                      items-center
                      gap-2
                      text-sm
                      text-gray-600
                      hover:text-gray-900
                      mb-5
                    "
                  >
                    <ArrowLeft size={17} />
                    Back to notifications
                  </button>

                  <div
                    className="
                      max-w-2xl
                      mx-auto
                      border
                      border-gray-200
                      rounded-2xl
                      p-5
                      md:p-7
                    "
                  >
                    <div className="flex items-start gap-4">
                      <NotificationIcon
                        notification={selectedNotification}
                        large
                      />

                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {selectedNotification.title}
                        </h3>

                        <div
                          className="
                            flex
                            flex-wrap
                            items-center
                            gap-2
                            mt-2
                          "
                        >
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock size={13} />

                            {formatExactTime(selectedNotification.createdAt)}
                          </span>

                          <span className="text-gray-300">•</span>

                          <span className="text-xs text-gray-400">
                            {formatRelativeTime(selectedNotification.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* TAGS */}

                    <div
                      className="
                        flex
                        flex-wrap
                        gap-2
                        mt-6
                      "
                    >
                      <span
                        className="
                          text-xs
                          bg-gray-100
                          text-gray-600
                          px-3
                          py-1.5
                          rounded-full
                        "
                      >
                        {getNotificationCategory(selectedNotification.type)}
                      </span>

                      <span
                        className={`
                          text-xs
                          px-3
                          py-1.5
                          rounded-full
                          ${getPriorityLabel(selectedNotification.type).style}
                        `}
                      >
                        {getPriorityLabel(selectedNotification.type).label}
                      </span>
                    </div>

                    {/* MESSAGE */}

                    <div
                      className="
                        mt-6
                        p-5
                        md:p-6
                        bg-gray-50
                        border
                        border-gray-100
                        rounded-xl
                      "
                    >
                      <p className="text-sm text-gray-700 leading-7">
                        {selectedNotification.message}
                      </p>
                    </div>

                    {/* READ STATUS */}

                    <div
                      className="
                        mt-6
                        flex
                        items-center
                        gap-3
                        p-4
                        bg-green-50
                        border
                        border-green-100
                        rounded-xl
                      "
                    >
                      <div
                        className="
                          w-9
                          h-9
                          rounded-full
                          bg-green-100
                          text-green-600
                          flex
                          items-center
                          justify-center
                        "
                      >
                        <Check size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-green-700">
                          Notification read
                        </p>

                        <p className="text-xs text-green-600 mt-0.5">
                          This notification has been acknowledged.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* =================================================
                   FULL NOTIFICATION LIST
                   ================================================= */

                <div>
                  {loadingNotifications ? (
                    <div className="py-16 text-center">
                      <RefreshCw
                        size={25}
                        className="
                          mx-auto
                          text-blue-500
                          animate-spin
                        "
                      />

                      <p className="text-sm text-gray-500 mt-3">
                        Loading notifications...
                      </p>
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="py-16 text-center">
                      <div
                        className="
                          w-14
                          h-14
                          rounded-full
                          bg-gray-100
                          text-gray-400
                          flex
                          items-center
                          justify-center
                          mx-auto
                        "
                      >
                        {searchQuery ? (
                          <Search size={24} />
                        ) : (
                          <Bell size={24} />
                        )}
                      </div>

                      <p className="text-sm font-medium text-gray-600 mt-4">
                        {searchQuery
                          ? "No matching notifications"
                          : "No notifications"}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {searchQuery
                          ? "Try a different search term."
                          : "You're all caught up."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* UNREAD */}

                      {filteredNotifications.some(
                        (notification) => !notification.isRead,
                      ) && (
                        <div
                          className="
                            flex
                            items-center
                            gap-2
                            mb-2
                          "
                        >
                          <span
                            className="
                              text-xs
                              font-semibold
                              text-gray-500
                              uppercase
                              tracking-wide
                            "
                          >
                            Unread
                          </span>

                          <div className="flex-1 h-px bg-gray-200" />
                        </div>
                      )}

                      {filteredNotifications
                        .filter((notification) => !notification.isRead)
                        .map(renderNotificationCard)}

                      {/* READ */}

                      {filteredNotifications.some(
                        (notification) => notification.isRead,
                      ) && (
                        <div
                          className="
                            flex
                            items-center
                            gap-2
                            pt-4
                            mb-2
                          "
                        >
                          <span
                            className="
                              text-xs
                              font-semibold
                              text-gray-500
                              uppercase
                              tracking-wide
                            "
                          >
                            Read
                          </span>

                          <div className="flex-1 h-px bg-gray-200" />
                        </div>
                      )}

                      {filteredNotifications
                        .filter((notification) => notification.isRead)
                        .map(renderNotificationCard)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
