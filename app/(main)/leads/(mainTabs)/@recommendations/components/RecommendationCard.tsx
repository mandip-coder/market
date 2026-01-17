"use client";

import { HealthcareCard } from "@/app/(main)/healthcares/components/healthcareCard";
import { usefetchHCOsByICBCode } from "@/app/(main)/healthcares/services/healthcares.hooks";
import ModalWrapper from "@/components/Modal/Modal";
import { useLeadModal } from "@/context/store/optimizedSelectors";
import { Button, Card, Input, Spin, Tag } from "antd";
import { Building2, MapPin, Package, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from '@/components/AppToaster/AppToaster';
import { Recommendation } from "../types";
import { ProductSkeleton } from "@/components/Skeletons/ProductCardSkelton";
import AppScrollbar from "@/components/AppScrollBar";

interface RecommendationCardProps {
  recommendation: Recommendation;
}

// Generate a consistent color based on product name
const getProductColor = (productName: string): string => {
  const colors = [
    "blue",
    "green",
    "purple",
    "orange",
    "cyan",
    "magenta",
    "gold",
    "lime",
  ];

  // Simple hash function to get consistent color
  let hash = 0;
  for (let i = 0; i < productName.length; i++) {
    hash = productName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const {
    recommendedUUID,
    icbCode,
    icbName,
    regionalOfficeName,
    productName,
    hcoCount,
  } = recommendation;

  // All hooks MUST be at the top level - never conditional
  const [hcoModalOpen, setHcoModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: hcoList = [], isLoading } = usefetchHCOsByICBCode(
    icbCode,
    hcoModalOpen
  );
  const { toggleLeadDrawer, setRecommendationUUID } = useLeadModal();

  // Client-side filtering based on search query
  const filteredHcoList = hcoList.filter((hco) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      hco.hcoName?.toLowerCase().includes(query) ||
      hco.address?.toLowerCase().includes(query) ||
      hco.phone1?.toLowerCase().includes(query) ||
      hco.website?.toLowerCase().includes(query)
    );
  });

  const handleApplyHCO = (hcoUUID: string) => {
    setRecommendationUUID(recommendedUUID);
    toggleLeadDrawer({ hcoUUID });
    setHcoModalOpen(false);
    setSearchQuery(""); // Reset search when closing
    toast.success(
      "HCO selected! Please complete the lead form to apply this recommendation."
    );
  };

  const handleModalClose = () => {
    setHcoModalOpen(false);
    setSearchQuery(""); // Reset search when closing
    setIsScrolled(false); // Reset scroll state
  };

  // Attach scroll listener to AppScrollbar's scroll element
  useEffect(() => {
    if (!hcoModalOpen) return;

    // Wait for the scroll element to be available
    const timer = setTimeout(() => {
      const scrollElement = scrollRef.current?.querySelector('.simplebar-content-wrapper');
      if (scrollElement) {
        const handleScroll = () => {
          setIsScrolled(scrollElement.scrollTop > 0);
        };
        
        scrollElement.addEventListener('scroll', handleScroll);
        return () => scrollElement.removeEventListener('scroll', handleScroll);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [hcoModalOpen]);

  return (
    <>
      <Card className="h-full transition-all hover:shadow-md">
        <div className="flex flex-col h-full">
          {/* ICB Info */}
          <div className="mb-3">
            <div className="flex items-start gap-2 mb-1">
              <Building2
                size={18}
                className="text-blue-500 mt-0.5 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate">
                  {icbName}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Code: {icbCode}
                </p>
              </div>
            </div>
          </div>

          {/* Region */}
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-green-500 flex-shrink-0" />
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {regionalOfficeName}
            </span>
          </div>

          {/* Product Tag */}
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} className="text-purple-500 flex-shrink-0" />
            <Tag color={getProductColor(productName)} className="m-0">
              {productName}
            </Tag>
          </div>

          {/* HCO Count - Clickable */}
          <div className="mb-4">
            <Button
              type="primary"
              size="small"
              onClick={() => setHcoModalOpen(true)}
            >
              {hcoCount} Healthcare{hcoCount !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      </Card>

      <ModalWrapper
        title={
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold">HCOs for {icbName}</span>
          </div>
        }
        open={hcoModalOpen}
        onCancel={handleModalClose}
        footer={null}
        width="90vw"
        closeIcon={<X className="h-4 w-4" />}
      >
        {/* Sticky Search Header */}
        <div
          className={`sticky top-0 z-10 p-2  transition-shadow duration-200 rounded-md ${
            isScrolled ? "shadow-[0_8px_8px_0_rgba(0,0,0,0.1)]" : ""
          }`}
        >
          <Input
            placeholder="Search by name, address, phone, or website..."
            prefix={<Search className="h-4 w-4 text-gray-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            className="max-w-[30%]"
          />
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Filtered {filteredHcoList.length} of {hcoList.length} Healthcare Organizations
          </div>
        </div>

        {/* Scrollable Content */}
        <div ref={scrollRef}>
          <AppScrollbar className="max-h-[60vh]">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            ) : filteredHcoList.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? `No HCOs found matching "${searchQuery}"`
                  : "No HCOs found for this recommendation"}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {filteredHcoList.map((hco, index) => (
                  <HealthcareCard
                    key={hco.hcoUUID}
                    healthcare={hco}
                    onViewDetails={() => {}}
                    index={index}
                    page={0}
                    showApplyButton
                    onApply={handleApplyHCO}
                  />
                ))}
              </div>
            )}
          </AppScrollbar>
        </div>
      </ModalWrapper>
    </>
  );
}

export default RecommendationCard;
