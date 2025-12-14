import clsx from 'clsx';
import { motion } from "framer-motion";
import { ChevronRight, Globe, MapPin, Phone, Users, Handshake } from "lucide-react";
import { Healthcare } from '../lib/types';
import { TYPE_STYLES } from '../lib/constants';
import { cardVariants } from '../../deals/components/DealCard';
import { getRatingClassColor } from '../lib/utils';
import { Tag } from 'antd';


interface HealthcareCardProps {
  healthcare: Healthcare;
  onViewDetails: (healthcare: Healthcare) => void;
  index: number;
  page: number;
}

export const HealthcareCard = ({ 
  healthcare, 
  onViewDetails, 
  index, 
  page 
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
          "p-4 hover:shadow-md"
        )}
        onClick={() => onViewDetails(healthcare)}
        aria-label={`View healthcare ${healthcare.hcoName}`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-2">
          <Tag color="blue">{type}</Tag>
          
          <div className="flex items-center gap-2">
            {healthcare.ragRating && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getRatingClassColor(healthcare.ragRating)}`}>
                {healthcare.ragRating}
              </span>
            )}
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </div>
        </div>

        {/* TITLE */}
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate mb-2">
          {healthcare.hcoName || "Untitled Healthcare"}
        </h3>

        {/* DETAILS */}
        <div className="flex-grow space-y-2">
          {healthcare.address && (
            <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
              <span className="truncate">{healthcare.address}</span>
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
        </div>

        {/* METADATA */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span className="truncate">
              {(Math.random() * 100).toFixed(0)} Contacts
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Handshake className="h-3.5 w-3.5" />
            <span className="truncate">
              {(Math.random() * 100).toFixed(0)} Deals
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};