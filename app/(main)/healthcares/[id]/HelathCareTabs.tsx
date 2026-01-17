"use client";

import React from "react";

import ContactModal, {
  HCOContactPerson,
} from "@/components/AddNewContactModal/AddNewContactModal";
import {
  Badge,
  Button,
  Col,
  Empty,
  Input,
  Popconfirm,
  Row,
  Skeleton,
  Tabs,
} from "antd";
import {
  BarChart2,
  Building,
  Edit,
  Globe,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from '@/components/AppToaster/AppToaster';
import { KpiCard } from "../../dashboard/components/KpiCard";
import { DealCard } from "../../deals/components/DealCard";
import { Deal } from "../../deals/services/deals.types";
import { useDropdownDealStages } from "@/services/dropdowns/dropdowns.hooks";
import { Healthcare } from "../services/types";
import { useContactsPersons, useDeleteContactPerson } from "@/services/contactPersons/contactPersons.hooks";
import { useFetchHCODeals } from "../services/healthcares.hooks";
import FullPageSkeleton from "@/components/Skeletons/FullpageSkeleton";
import { ContactCard } from "../components/contactCard";
import AppErrorUI from "@/components/AppErrorUI/AppErrorUI";
import { ApiError } from "@/lib/apiClient/ApiError";
import { getStageColor } from "@/Utils/helpers";

// Helper function to get stage color by name


// TrackerTab Component for Deals
export const TrackerTab = ({
  deals,
  emptyMessage = "No Deals Found",
}: {
  deals: Deal[];
  emptyMessage?: string;
}) => {
  const { data: dealStages = [], isLoading: stagesLoading } =
    useDropdownDealStages();
  const [activeStatusTab, setActiveStatusTab] = useState<string>("");

  useEffect(() => {
    if (dealStages.length > 0 && !activeStatusTab) {
      setActiveStatusTab(dealStages[0].dealStageUUID);
    }
  }, [dealStages, activeStatusTab]);

  if (stagesLoading) {
    return <FullPageSkeleton />;
  }

  if (deals.length === 0) {
    return (
      <div className="dark:bg-blue-800/10 p-5 rounded-lg flex items-center justify-center min-h-[300px]">
        <Empty description={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deal Status Pills */}
      <div className="flex flex-wrap gap-2">
        {dealStages.map((stage) => {
          const color = getStageColor(stage.dealStageName);
          return (
            <Button
              key={stage.dealStageUUID}
              onClick={() => setActiveStatusTab(stage.dealStageUUID)}
              type={
                activeStatusTab === stage.dealStageUUID ? "primary" : "default"
              }
              style={{
                backgroundColor:
                  activeStatusTab === stage.dealStageUUID ? color : "",
                borderColor:
                  activeStatusTab !== stage.dealStageUUID ? color : "",
              }}
              className="flex items-center gap-2"
            >
              {stage.dealStageName}
              <Badge
                showZero
                color={
                  activeStatusTab !== stage.dealStageUUID ? "purple" : color
                }
                count={
                  deals.filter((deal) => deal.dealStage === stage.dealStageUUID)
                    .length
                }
              />
            </Button>
          );
        })}
      </div>

      {/* Deal Cards for Selected Status */}
      <div className="dark:bg-blue-800/10 p-5 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {dealStages.find((s) => s.dealStageUUID === activeStatusTab)
              ?.dealStageName || ""}{" "}
            Deals
          </h3>
        </div>

        <Row gutter={[16, 16]}>
          {deals.filter((deal) => deal.dealStage === activeStatusTab).length >
            0 ? (
            deals
              .filter((deal) => deal.dealStage === activeStatusTab)
              .map((deal: Deal) => (
                <Col xs={24} md={24} lg={12} xxl={8} key={deal.dealUUID}>
                  <DealCard deal={deal} />
                </Col>
              ))
          ) : (
            <Col span={24}>
              <Empty />
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
};

export default function HealthCareTabs({
  healthcare,
}: {
  healthcare: Healthcare;
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<HCOContactPerson | null>(
    null
  );

  // Fetch contacts only when contacts tab is active
  const { data: contactsPersons = [], isLoading: contactsLoading } =
    useContactsPersons(healthcare.hcoUUID, activeTab === "contacts");

  const { data: deals = [], isLoading: dealsLoading } = useFetchHCODeals(
    healthcare.hcoUUID,
    activeTab === "deals"
  );

  // Delete contact mutation
  const deleteContactMutation = useDeleteContactPerson(healthcare.hcoUUID);

  // Filter contacts based on search query
  const filteredContacts = useMemo(
    () =>
      contactsPersons?.filter(
        (contact) =>
          contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
      ) || [],
    [contactsPersons, searchQuery]
  );

  // Handle delete contact
  const handleDeleteContact = (contactId: string) => {
    if (!healthcare) return;

    deleteContactMutation.mutate(contactId, {
      onSuccess: () => {
        toast.success("Contact deleted successfully");
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to delete contact");
      },
    });
  };

  // Handle view contact
  const handleViewContact = (contact: HCOContactPerson) => {
    setEditingContact(contact);
    setIsContactModalOpen(true);
  };
  const handleCloseContactModal = () => {
    setIsContactModalOpen(false);
    setEditingContact(null);
  };

  // Memoize tab items to prevent recreation on every render
  const tabItems = useMemo(
    () => [
      {
        key: "overview",
        label: (
          <span className="flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="font-medium">Overview</span>
          </span>
        ),
        children: (
          <div className="space-y-6">
            {/* Enhanced KPI Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard
                title="Total Contacts"
                value={healthcare?.totalContactsCount || 0}
                icon={<Users size={20} />}
                color="#6366f1"
              />
              <KpiCard
                title="Active Contacts"
                value={healthcare?.totalActiveContactsCount || 0}
                icon={<User size={20} />}
                color="#10b981"
              />
              <KpiCard
                title="Total Deals"
                value={healthcare?.totalDealCount || 0}
                icon={<TrendingUp size={20} />}
                color="#f59e0b"
              />
              <KpiCard
                title="Healthcare Type"
                value={healthcare?.hcoType || "N/A"}
                icon={<Building size={20} />}
                color="#8b5cf6"
              />
            </div>

            {/* Information Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information Card */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Building className="text-white" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Basic Information
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <Building
                      className="text-gray-400 dark:text-gray-500 mt-1 mr-3 flex-shrink-0"
                      size={18}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Healthcare Name
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {healthcare?.hcoName || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <BarChart2
                      className="text-gray-400 dark:text-gray-500 mt-1 mr-3 flex-shrink-0"
                      size={18}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Healthcare Code
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {healthcare?.healthcareCode || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <BarChart2
                      className="text-gray-400 dark:text-gray-500 mt-1 mr-3 flex-shrink-0"
                      size={18}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ICB Code
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {healthcare?.icbCode || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mt-1 mr-3 flex-shrink-0">
                      <div
                        className={`w-3 h-3 rounded-full ${healthcare?.status === "active"
                          ? "bg-green-500"
                          : "bg-gray-400"
                          }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Status
                      </p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${healthcare?.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                          }`}
                      >
                        {healthcare?.status
                          ? healthcare.status.charAt(0).toUpperCase() +
                          healthcare.status.slice(1)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Phone className="text-white" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Contact Information
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <Phone
                      className="text-gray-400 dark:text-gray-500 mt-1 mr-3 flex-shrink-0"
                      size={18}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Primary Phone
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {healthcare?.phone1 || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone
                      className="text-gray-400 dark:text-gray-500 mt-1 mr-3 flex-shrink-0"
                      size={18}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Secondary Phone
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {healthcare?.phone2 || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Globe
                      className="text-gray-400 dark:text-gray-500 mt-1 mr-3 flex-shrink-0"
                      size={18}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Website
                      </p>
                      {healthcare?.website ? (
                        <a
                          href={
                            healthcare.website.startsWith("http")
                              ? healthcare.website
                              : `https://${healthcare.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 dark:text-blue-400 hover:underline truncate block"
                        >
                          {healthcare.website}
                        </a>
                      ) : (
                        <p className="font-medium text-gray-900 dark:text-white">
                          N/A
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information Card */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <MapPin className="text-white" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Location Information
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin
                      className="text-gray-400 dark:text-gray-500 mt-1 mr-3 flex-shrink-0"
                      size={18}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Address
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {healthcare?.address || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Building
                      className="text-gray-400 dark:text-gray-500 mt-1 mr-3 flex-shrink-0"
                      size={18}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        City
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {healthcare?.city || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin
                      className="text-gray-400 dark:text-gray-500 mt-1 mr-3 flex-shrink-0"
                      size={18}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        State
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {healthcare?.state || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Globe
                      className="text-gray-400 dark:text-gray-500 mt-1 mr-3 flex-shrink-0"
                      size={18}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Country
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {healthcare?.country || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Information Card */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <BarChart2 className="text-white" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    System Information
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <User
                      className="text-gray-400 dark:text-gray-500 mt-1 mr-3 flex-shrink-0"
                      size={18}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Created By
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {healthcare?.createdBy || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <BarChart2
                      className="text-gray-400 dark:text-gray-500 mt-1 mr-3 flex-shrink-0"
                      size={18}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Created At
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {healthcare?.createdAt
                          ? new Date(healthcare.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <User
                      className="text-gray-400 dark:text-gray-500 mt-1 mr-3 flex-shrink-0"
                      size={18}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Updated By
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {healthcare?.updatedBy || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <BarChart2
                      className="text-gray-400 dark:text-gray-500 mt-1 mr-3 flex-shrink-0"
                      size={18}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Updated At
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {healthcare?.updatedAt
                          ? new Date(healthcare.updatedAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "contacts",
        label: (
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span className="font-medium">Contacts</span>
            {healthcare.totalContactsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                {healthcare.totalContactsCount}
              </span>
            )}
          </span>
        ),
        children: contactsLoading ? (
          <FullPageSkeleton />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {(contactsPersons.length || 0) > 0 ? (
                <div className="relative w-full">
                  <Input
                    placeholder="Search contacts..."
                    prefix={<Search size={16} className="text-gray-400" />}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(e.target.value)
                    }
                    value={searchQuery}
                    className="w-full max-w-md"
                    allowClear
                    onClear={() => setSearchQuery("")}
                  />
                </div>
              ) : (
                <div></div>
              )}

              <div className="flex space-x-3 w-full sm:w-auto">
                <Button
                  icon={<Plus size={16} />}
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl"
                  onClick={() => setIsContactModalOpen(true)}
                >
                  Add Contact
                </Button>
              </div>
            </div>

            {filteredContacts.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {filteredContacts.map((contact) => (
                    <ContactCard
                      key={contact.hcoContactUUID}
                      contact={contact}
                      onEdit={() => handleViewContact(contact)}
                      onDelete={(e) => {
                        e.stopPropagation();
                        handleDeleteContact(contact.hcoContactUUID);
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
                  <Users
                    size={24}
                    className="text-gray-500 dark:text-gray-400"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  No contacts found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                  Try adjusting your search or add a new contact to get started
                </p>
                <Button
                  icon={<Plus size={16} />}
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl"
                  onClick={() => setIsContactModalOpen(true)}
                >
                  Add Contact
                </Button>
              </div>
            )}
          </div>
        ),
      },
      {
        key: "deals",
        label: (
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="font-medium">Deals</span>
            {healthcare.totalDealCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                {healthcare.totalDealCount}
              </span>
            )}
          </span>
        ),
        children: dealsLoading ? (
          <FullPageSkeleton />
        ) : (
          <TrackerTab deals={deals} emptyMessage="No Deals has been created for this Healthcare." />
        ),
      },
    ],
    [healthcare, searchQuery, filteredContacts, deals, contactsPersons]
  );

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md px-4 pb-4">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          destroyOnHidden
        />
      </div>

      <ContactModal
        open={isContactModalOpen}
        onClose={handleCloseContactModal}
        showExtraFields
        onSave={() => {
          handleCloseContactModal();
        }}
        hcoName={healthcare?.hcoName}
        hcoUUID={healthcare?.hcoUUID}
        initialContact={editingContact}
        requireHelthcareId={true}
      />
    </>
  );
}
