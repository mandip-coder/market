"use client";
import { useDealStore } from "@/context/store/dealsStore";
import {
  ArrowUpRight,
  Handshake,
  LucideIcon,
  Package,
  Users2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useState, lazy, Suspense } from "react";
import AddNewContactModal, {
  HCOContactPerson,
} from "@/components/AddNewContactModal/AddNewContactModal";
import DealDrawer from "../../deals/components/Add-Deal";

// Define types for our action items
interface ActionItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradientColors: string;
  onClick?: () => void;
  href?: string;
  className?: string;
}

// Memoized action item component with proper typing
const ActionItem = memo(
  ({
    icon: Icon,
    title,
    description,
    gradientColors,
    onClick,
    href,
    className = "",
  }: ActionItemProps) => {
    const itemContent = (
      <div
        className={`p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-300 group ${className}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradientColors} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">
              {title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {description}
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
        </div>
      </div>
    );

    if (href) {
      return (
        <Link href={href} className="block">
          {itemContent}
        </Link>
      );
    }

    return (
      <div
        onClick={onClick}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      >
        {itemContent}
      </div>
    );
  }
);

ActionItem.displayName = "ActionItem";

// Define type for action items
interface ActionType {
  icon: LucideIcon;
  title: string;
  description: string;
  gradientColors: string;
  onClick?: () => void;
  href?: string;
}

const QuickActions = memo(() => {
  const { setDealDrawer, openDealDrawer } = useDealStore();
  const [openContactModal, setOpenContactModal] = useState(false);

  // Memoize handlers to prevent unnecessary re-renders
  const handleDrawerClose = useCallback(() => {
    setDealDrawer(false);
    setOpenContactModal(false);
  }, []);

  const handleSaveContact = useCallback((values: HCOContactPerson) => {
    setOpenContactModal(false);
  }, []);

  const handleOpenDrawer = useCallback(() => setDealDrawer(true), []);
  const handleOpenContactModal = useCallback(
    () => setOpenContactModal(true),
    []
  );

  // Define action items with proper icons and colors
  const actionItems: ActionType[] = [
    {
      icon: Handshake,
      title: "Log Deal",
      description: "Record a new interaction",
      gradientColors: "from-purple-500 to-blue-500",
      onClick: handleOpenDrawer,
    },
    {
      icon: Users2,
      title: "Add Contact",
      description: "Create a new contact",
      gradientColors: "from-green-500 to-emerald-600",
      onClick: handleOpenContactModal,
    },
    {
      icon: Package,
      title: "Browse Products",
      description: "View product catalogue",
      gradientColors: "from-blue-500 to-cyan-500",
      href: "/products",
    },
  ];

  return (
    <>
      <div className="border-0 shadow-lg bg-white dark:bg-black rounded-xl p-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-500" />
          Quick Actions
        </h2>
        <div className="flex flex-col gap-2">
          {actionItems.map((item, index) => (
            <ActionItem
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.description}
              gradientColors={item.gradientColors}
              onClick={item.onClick}
              href={item.href}
            />
          ))}
        </div>
      </div>
      <DealDrawer />
      <AddNewContactModal
        open={openContactModal}
        onClose={handleDrawerClose}
        onSave={handleSaveContact}
        requireHelthcareId
      />
    </>
  );
});

QuickActions.displayName = "QuickActions";

export default QuickActions;
