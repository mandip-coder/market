import React from 'react';
import { Users, Calendar, Package, TrendingUp } from 'lucide-react';
import { Campaign } from '../types';
import { GlobalDate } from '@/Utils/helpers';

interface CampaignCardProps {
  campaign: Campaign;
  onViewReport: (campaign: Campaign) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onViewReport }) => {
  const recipientCount = campaign.contactPersons?.length || 0;
  const productCount = campaign.products?.length || 0;

  return (
    <div
      onClick={() => onViewReport(campaign)}
      className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-5">
        {/* Header Section */}
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-1.5 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {campaign.title || 'Untitled Campaign'}
          </h3>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
            {campaign.subject || 'No subject line'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 mb-0.5">
              <Users size={11} />
              <span className="text-[10px] font-medium uppercase tracking-wide">Recipients</span>
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {recipientCount}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 mb-0.5">
              <Package size={11} />
              <span className="text-[10px] font-medium uppercase tracking-wide">Products</span>
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {productCount}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 mb-0.5">
              <Calendar size={11} />
              <span className="text-[10px] font-medium uppercase tracking-wide">Created</span>
            </div>
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-tight">
              {GlobalDate(campaign.createdOn)}
            </span>
          </div>
        </div>

        {/* Products Section */}
        {productCount > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1 h-1 rounded-full bg-blue-500" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Featured Products
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {campaign.products.slice(0, 2).map((p: any, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                >
                  {p.productName || p.name || p}
                </span>
              ))}
              {productCount > 2 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                  +{productCount - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Hover Action Indicator */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-6 h-6 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
            <TrendingUp size={12} className="text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out" />
    </div>
  );
};
export default CampaignCard;