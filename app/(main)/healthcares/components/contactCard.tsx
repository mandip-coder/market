import { HCOContactPerson } from "@/components/AddNewContactModal/AddNewContactModal";
import { GlobalDate } from "@/Utils/helpers";
import { LinkedinFilled, MailFilled, PhoneFilled } from "@ant-design/icons";
import { Button, Popconfirm, Popover, Tag, Tooltip } from "antd";
import {
  Calendar,
  Clock,
  Edit,
  Star,
  Trash2,
  User
} from "lucide-react";
import { motion } from "motion/react";
import React from "react";

export const ContactCard = React.memo(
  ({
    contact,
    onEdit,
    onDelete,
  }: {
    contact: HCOContactPerson;
    onEdit: () => void;
    onDelete: (e: React.MouseEvent) => void;
  }) => {
    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    const getStatusColor = () => {
      if (contact.status === "active")
        return "bg-gradient-to-br from-emerald-500 to-teal-600";
      return "bg-gradient-to-br from-gray-400 to-gray-600";
    };
    const formatDate = (dateString?: string) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    const renderStars = (rating?: number) => {
      if (!rating) return null;
      return (
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={12}
              className={`${
                i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>
      );
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col h-full"
      >
        {/* Header Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base ${getStatusColor()} shadow-lg ring-2 ring-white dark:ring-gray-800`}
              >
                {getInitials(contact.fullName)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                    {contact.fullName}
                  </h3>
                  {contact.rating && renderStars(contact.rating)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate font-medium">
                  {contact.role}
                </p>
                {contact.responsibility && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                    {contact.responsibility}
                  </p>
                )}
              </div>
            </div>

            <span
              className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
                contact.status === "active"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
              }`}
            >
              {contact.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="p-4 space-y-3 flex-1 min-h-0">
          {/* Email and Phone */}
          <div className="space-y-2">
            {contact.email && (
              <Tooltip title="Email Address">
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <MailFilled
                    size={14}
                    className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0"
                  />
                  <span className="truncate">{contact.email}</span>
                </a>
              </Tooltip>
            )}

            {contact.phone && (
              <Tooltip title="Phone Number">
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <PhoneFilled
                    size={14}
                    className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0"
                  />
                  <span className="truncate">{contact.phone}</span>
                </a>
              </Tooltip>
            )}

            {contact.linkedinUrl && (
              <Tooltip title="LinkedIn Profile">
                <a
                  href={contact.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <LinkedinFilled
                    size={14}
                    className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0"
                  />
                  <span className="truncate">LinkedIn Profile</span>
                </a>
              </Tooltip>
            )}
          </div>

          {/* Working Hours */}
          {(contact.workingHoursStart || contact.workingHoursEnd) && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
              <Clock size={14} className="text-gray-400 flex-shrink-0" />
              <span>
                {GlobalDate(contact.workingHoursStart as string) || "N/A"} -{" "}
                {GlobalDate(contact.workingHoursEnd as string) || "N/A"}
              </span>
            </div>
          )}

          {/* Personality Traits */}
          {contact.personalityTrait && contact.personalityTrait.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {contact.personalityTrait.slice(0, 2).map((trait, index) => (
                <Tag key={index} variant="outlined">
                  {trait.personalityTraitName}
                </Tag>
              ))}
              {contact.personalityTrait.length > 2 && (
                <Popover
                  content={
                    <div className="!max-w-[300px] flex flex-wrap gap-1.5">
                      {contact.personalityTrait
                        .slice(2)
                        .map(({ personalityTraitName, personalityTraitUUID }) => (
                          <Tag key={personalityTraitUUID} variant="outlined">{personalityTraitName}</Tag>
                        ))}
                    </div>
                  }
                >
                  <Tag
                    variant="filled"
                    color={"success"}
                    className="text-xs px-2 py-0.5 m-0"
                  >
                    +{contact.personalityTrait.length - 2}
                  </Tag>
                </Popover>
              )}
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-600">
          <div className="flex items-center justify-between">
            {/* Creation Info */}
            <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400 min-w-0 flex-1">
              {contact.createdBy && (
                <Tooltip title={`Created by ${contact.createdBy}`}>
                  <div className="flex items-center gap-1.5 truncate">
                    <User size={12} className="flex-shrink-0" />
                    <span className="truncate">{contact.createdBy}</span>
                  </div>
                </Tooltip>
              )}
              {contact.createdAt && (
                <Tooltip title={`Created on ${formatDate(contact.createdAt)}`}>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="flex-shrink-0" />
                    <span>{formatDate(contact.createdAt)}</span>
                  </div>
                </Tooltip>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1 ml-2 flex-shrink-0">
              <Tooltip title="Edit Contact">
                <Button
                  type="text"
                  size="small"
                  onClick={onEdit}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  icon={
                    <Edit
                      size={16}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  }
                />
              </Tooltip>
              <Popconfirm
                title="Delete Contact"
                description="Are you sure you want to delete this contact?"
                onConfirm={(e) => {
                  onDelete(e as any);
                }}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Delete Contact">
                  <Button
                    type="text"
                    size="small"
                    className="hover:bg-red-50 dark:hover:bg-red-900/20"
                    icon={
                      <Trash2
                        size={16}
                        className="text-red-600 dark:text-red-400"
                      />
                    }
                  />
                </Tooltip>
              </Popconfirm>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

ContactCard.displayName = "ContactCard";
