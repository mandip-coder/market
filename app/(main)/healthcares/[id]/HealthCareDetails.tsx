'use client';

import React from 'react';

import ContactModal, { HCOContactPerson } from '@/components/AddNewContactModal/AddNewContactModal';
import { Deal, Stage, STAGE_LABELS, stages } from '@/lib/types';
import {
  Button,
  Col,
  Popconfirm,
  Row,
  Tabs
} from 'antd';
import {
  Activity,
  BarChart2,
  Building,
  CheckCircle,
  Edit,
  Globe,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  User,
  Users
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Healthcare } from '../lib/types';
import { KpiCard } from '../../dashboard/components/KpiCard';
import { DealCard } from '../../deals/components/DealCard';

// TypeScript Interfaces



// Mock Deal Data
interface DealStatus {
  status: stages;
  color: string;
  description: string;
}
interface HealthcarePromise {
 data: Healthcare;
}

const MOCK_DEAL_STATUS: DealStatus[] = [
  { status: Stage.DISCUSSION, color: "#1677FF", description: "Detailed product benefits and clinical data review" },
  { status: Stage.NEGOTIATION, color: "#FAAD14", description: "Commercial terms and agreement discussions" },
  { status: Stage.CLOSED_WON, color: "#52C41A", description: "Deal successfully closed" },
  { status: Stage.CLOSED_LOST, color: "#FF4D4F", description: "Deal not successful" },
];

const ContactCard = React.memo(({
  contact,
  onClick,
  onDelete
}: {
  contact: HCOContactPerson;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getConsentColor = () => {
    if (contact.status === "active") return 'bg-gradient-to-r from-emerald-500 to-teal-500';
    return 'bg-gradient-to-r from-gray-400 to-gray-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md p-4"
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-white font-medium text-lg ${getConsentColor()} shadow-md`}>
          {getInitials(contact.fullName)}
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{contact.fullName}</h3>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 truncate">{contact.role}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${contact.status==="active" ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-s400'}`}>
              {contact.status==="active" ? 'Active' : 'Inactive'}
            </span>
           
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button
          type="text"
          size="small"
          onClick={onClick}
          icon={<Edit size={16} className="!text-blue-500" />}
        />
        <Popconfirm
          title="Delete Contact"
          description="Are you sure you want to delete this contact?"
          onConfirm={(e) => {
            onDelete(e as any);
          }}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ className: '!bg-red-600' }}
        >
          <Button
            type="text"
            size="small"
            icon={<Trash2 size={16} className="!text-red-500" />}
          />
        </Popconfirm>
      </div>
    </motion.div>
  );
});

ContactCard.displayName = 'ContactCard';

// TrackerTab Component for Deals
const TrackerTab = () => {
  const [activeStatusTab, setActiveStatusTab] = useState<stages>(Stage.DISCUSSION);

  return (
    <div className="space-y-6">
      {/* Deal Status Pills */}
      <div className="flex flex-wrap gap-2">
        {MOCK_DEAL_STATUS.map(({status, color}) => (
          <Button
            key={status}
            onClick={() => setActiveStatusTab(status)}
            type={activeStatusTab === status ? "primary" : "default"}
            style={{
              backgroundColor: activeStatusTab === status ? color : '',
              borderColor: activeStatusTab !== status ? color : ''
            }}
            className="flex items-center gap-2"
          >
            {STAGE_LABELS[status]}
            <span className="text-xs bg-opacity-30 px-2 py-0.5 rounded-full bg-white text-black dark:bg-black dark:text-white">
              0
            </span>
          </Button>
        ))}
      </div>

      {/* Deal Cards for Selected Status */}
      <div className="dark:bg-blue-800/10 p-5 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">{STAGE_LABELS[activeStatusTab]} Deals</h3>
        </div>

        <Row gutter={[16, 16]}>
          {[].map((deal: Deal) => (
            <Col xs={24} md={24} lg={12} xxl={8} key={deal.dealUUID}>
              <DealCard deal={deal} page={1} />
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default function HealthCareDetails({healthcareDetailsPromise}: {healthcareDetailsPromise: HealthcarePromise}) {
  const router = useRouter();
  const [healthcare, sethealthcare] = useState<Healthcare | null>(healthcareDetailsPromise.data);
  const [searchQuery, setSearchQuery] = useState('');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<HCOContactPerson | null>(null);

  // Filter contacts based on search query
  const filteredContacts = useMemo(() =>
    healthcare?.contacts.filter(contact =>
      contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [],
    [healthcare?.contacts, searchQuery]
  );

  // Handle delete contact
  const handleDeleteContact = (contactId: string) => {
    if (!healthcare) return;
    try {
      const updatedContacts = healthcare.contacts.filter(contact => contact.hcoContactUUID !== contactId);
      sethealthcare({
        ...healthcare,
        contacts: updatedContacts,
      });
      toast.success('Contact deleted successfully');
    } catch (error) {
      toast.error('Failed to delete contact');
    }
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
  // Calculate statistics
  const activeContactsCount = useMemo(
    () => healthcare?.contacts.filter(c => c.status === "active").length || 0,
    [healthcare?.contacts]
  );

  // Memoize tab items to prevent recreation on every render
  const tabItems = useMemo(() => [
    {
      key: 'overview',
      label: (
        <span className="flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5" />
          <span className="font-medium">Overview</span>
        </span>
      ),
      children: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard
              title="Total Contacts"
              value={healthcare?.contacts.length || 0}
              icon={<Users size={20} />}
              color="#6c6cff"
              trend={{
                isPositive: false,
                value: 5
              }}
            />
            <KpiCard
              title="Active Contacts"
              value={activeContactsCount}
              icon={<User size={20} />}
              color="#1c731c"
              trend={{
                isPositive: true,
                value: 6
              }}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Healthcare Details</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <Building className="text-gray-400 dark:text-gray-500 mt-1 mr-3" size={18} />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{healthcare?.hcoName || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="text-gray-400 dark:text-gray-500 mt-1 mr-3" size={18} />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                  <p className="font-medium text-gray-900 dark:text-white">{healthcare?.address || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="text-gray-400 dark:text-gray-500 mt-1 mr-3" size={18} />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-white">{healthcare?.phone1 || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Globe className="text-gray-400 dark:text-gray-500 mt-1 mr-3" size={18} />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Website</p>
                  <p className="font-medium text-gray-900 dark:text-white">{healthcare?.website || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'contacts',
      label: (
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span className="font-medium">Contacts</span>
        </span>
      ),
      children: (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {(healthcare?.contacts.length || 0) > 0 ? (
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-800"
                />
                <Search size={16} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
              </div>
            ) : <div></div>}

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {filteredContacts.map((contact) => (
                  <ContactCard
                    key={contact.hcoContactUUID}
                    contact={contact}
                    onClick={() => handleViewContact(contact)}
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
                <Users size={24} className="text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No contacts found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">Try adjusting your search or add a new contact to get started</p>
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
      )
    },
    {
      key: 'deals',
      label: (
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="font-medium">Deal</span>
        </span>
      ),
      children: <TrackerTab />
    },


  ], [healthcare, searchQuery, filteredContacts, activeContactsCount,]);



  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md px-4 pb-4">
        <Tabs items={tabItems} />
      </div>

      <ContactModal
        open={isContactModalOpen}
        onClose={handleCloseContactModal}
        showExtraFields
        onSave={(contact: any) => {
          if (!healthcare) return;
          if (editingContact) {
            const updatedContacts = healthcare.contacts.map((c) => {
              if (c.hcoContactUUID === editingContact.hcoContactUUID) {
                return contact;
              }
              return c;
            });
            sethealthcare({ ...healthcare, contacts: updatedContacts });
          } else {
            const newContact = { ...contact, id: Date.now().toString() };
            sethealthcare({
              ...healthcare,
              contacts: [...healthcare.contacts, newContact],
            });
          }
          handleCloseContactModal();
        }}
        initialContact={editingContact}
        requireHelthcareId={false}
      />
    </>
  );
}