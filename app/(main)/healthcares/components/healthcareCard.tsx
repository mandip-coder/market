import { Button } from 'antd';
import clsx from 'clsx';
import { motion } from "framer-motion";
import { Building2, Globe, Handshake, Layers, Mail, MapPin, Phone, Users } from "lucide-react";
import { cardVariants } from '../../deals/components/DealCard';
import { Healthcare } from '../services/types';


interface HealthcareCardProps {
  healthcare: Healthcare;
  onViewDetails: (healthcare: Healthcare) => void;
  index: number;
  page: number;
  showApplyButton?: boolean;
  onApply?: (hcoUUID: string) => void;
}

export const HealthcareCard = ({ 
  healthcare, 
  onViewDetails, 
  index, 
  page,
  showApplyButton = false,
  onApply
}: HealthcareCardProps) => {
  const type = healthcare.hcoType || "Unknown";

  return (
    <motion.div
      // @ts-ignore
      variants={cardVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="h-full relative group"
      key={`${healthcare.hcoUUID}-${page}`}
    >
      <div
        className={clsx(
          "h-full overflow-hidden rounded-xl transition-all duration-300 cursor-pointer",
          "border border-slate-200 dark:border-slate-800",
          "bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800",
          "p-4 hover:shadow-md",
          "flex flex-col mb-2"
        )}
        onClick={() => onViewDetails(healthcare)}
        aria-label={`View healthcare ${healthcare.hcoName}`}
      >


        {/* TITLE - HEADER */}
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate mb-2 flex-shrink-0">
          {healthcare.hcoName || "Untitled Healthcare"}
        </h3>

        {/* DETAILS */}
        <div className="flex-grow space-y-2 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="truncate">{type}</span>
          </div>
          {healthcare.address && (
            <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
              <span className="truncate">{healthcare.address}</span>
            </div>
          )}

          {healthcare.email && (
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Mail className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <span className="truncate">{healthcare.email}</span>
            </div>
          )}

          {healthcare.phone1 && (
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="truncate">{healthcare.phone1}</span>
            </div>
          )}

          {healthcare.website && (
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Globe className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span className="truncate">{healthcare.website}</span>
            </div>
          )}

          {healthcare.hcoServices && healthcare.hcoServices.length > 0 && (
            <div className="flex items-start gap-2 text-xs">
              <Layers className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
              <div className="flex flex-wrap gap-1 flex-1">
                {healthcare.hcoServices.slice(0, 3).map((service, idx) => (
                  <span
                    key={service.hcoServiceUUID || idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700"
                  >
                    {service.hcoServiceName}
                  </span>
                ))}
                {healthcare.hcoServices.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    +{healthcare.hcoServices.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* APPLY BUTTON - Only shown when from recommendations */}
        {showApplyButton && onApply && (
          <div className="mt-3">
            <Button
              type="primary"
              size="small"
              block
              onClick={(e) => {
                e.stopPropagation();
                onApply(healthcare.hcoUUID);
              }}
            >
              Process to Lead
            </Button>
          </div>
        )}

        {/* METADATA - FOOTER */}
        <div className="flex  items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span className="truncate">
              {healthcare.totalContactsCount>0? healthcare.totalContactsCount : "No"} Contact
              {healthcare.totalContactsCount>1? "s" : ""}
            </span>
          </div>

          <div className='flex items-center gap-2'>

          <div className="flex items-center gap-1">
            <Handshake className="h-3.5 w-3.5" />
            <span className="truncate">
              {healthcare.totalLeadCount>0? healthcare.totalLeadCount : "No"} Lead
              {healthcare.totalLeadCount>1? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Handshake className="h-3.5 w-3.5" />
            <span className="truncate">
              {healthcare.totalDealCount>0? healthcare.totalDealCount : "No"} Deal
              {healthcare.totalDealCount>1? "s" : ""}
            </span>
          </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
};