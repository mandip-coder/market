"use client";

import { useState } from 'react';
import { Card, Button, Tabs, Empty, Spin, Badge } from 'antd';
import { Building2, Hospital, Stethoscope } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { healthcaresService } from '@/app/(main)/healthcares/services/healthcares.service';
import { HealthcareCard } from '@/app/(main)/healthcares/components/healthcareCard';
import { useLeadModal } from '@/context/store/optimizedSelectors';
import { toast } from 'react-toastify';

interface RecommendationsTabProps {
  productId: string;
}

type HCOType = 'NHS' | 'ICB' | 'PCN';

export const RecommendationsTab = ({ productId }: RecommendationsTabProps) => {
  const [selectedType, setSelectedType] = useState<HCOType>('ICB');
  const { toggleLeadDrawer, setRecommendationUUID } = useLeadModal();

  // Fetch recommended healthcares by type
  // TODO: Replace with actual product-specific recommendations API
  const { data: healthcares = [], isLoading } = useQuery({
    queryKey: ['product-recommendations', productId, selectedType],
    queryFn: async () => {
      // For now, use mock data from coverage
      // In production, this should call a product-specific recommendations endpoint
      const { MOCK_HEALTHCARES_WITH_DEALS } = await import('./mockCoverageData');
      
      // Filter by selected type and return healthcare objects with populated data
      return MOCK_HEALTHCARES_WITH_DEALS
        .filter(hco => hco.hcoType === selectedType)
        .map(hco => ({
          hcoUUID: hco.hcoUUID,
          hcoName: hco.hcoName,
          hcoType: hco.hcoType,
          healthcareCode: hco.icbCode || hco.hcoUUID.substring(0, 8),
          address: hco.address || `${hco.city || 'London'}, United Kingdom`,
          city: hco.city || 'London',
          country: hco.country || 'United Kingdom',
          state: hco.city || '',
          icbCode: hco.icbCode || '',
          contacts: [],
          phone1: '+44 20 7946 0958',
          phone2: '+44 20 7946 0959',
          website: `www.${hco.hcoName.toLowerCase().replace(/\s+/g, '')}.nhs.uk`,
          status: 'active',
          totalContactsCount: Math.floor(Math.random() * 10) + 1,
          totalActiveContactsCount: Math.floor(Math.random() * 5) + 1,
          totalLeadCount: Math.floor(Math.random() * 5),
          totalDealCount: hco.deals.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'System',
          updatedBy: 'System',
        }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleApplyRecommendation = (hcoUUID: string,) => {
    const recommendationUUID = `rec-${hcoUUID}-${Date.now()}`;
    setRecommendationUUID(recommendationUUID);
    toggleLeadDrawer({ 
      hcoUUID: hcoUUID,
    });
    toast.success("Healthcare selected! Please complete the lead form to create a lead.");
  };

  const tabItems = [
    {
      key: 'ICB',
      label: (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span>ICB</span>
          <Badge 
            count={selectedType === 'ICB' ? healthcares.length : 0} 
            showZero={false}
            style={{ backgroundColor: '#8b5cf6' }}
          />
        </div>
      ),
    },
    {
      key: 'NHS',
      label: (
        <div className="flex items-center gap-2">
          <Hospital className="h-4 w-4" />
          <span>NHS</span>
          <Badge 
            count={selectedType === 'NHS' ? healthcares.length : 0} 
            showZero={false}
            style={{ backgroundColor: '#3b82f6' }}
          />
        </div>
      ),
    },
    {
      key: 'PCN',
      label: (
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4" />
          <span>PCN</span>
          <Badge 
            count={selectedType === 'PCN' ? healthcares.length : 0} 
            showZero={false}
            style={{ backgroundColor: '#10b981' }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">

      {/* HCO Type Tabs */}
      <Card className="!border-gray-200 dark:!border-gray-700" size='small'>
        <Tabs
          activeKey={selectedType}
          onChange={(key) => setSelectedType(key as HCOType)}
          items={tabItems}
          size="large"
        />

        {/* Healthcare List */}
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : healthcares.length === 0 ? (
            <Empty
              description={`No ${selectedType} recommendations found for this product`}
              className="py-20"
            />
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {healthcares.length} recommended {selectedType} organizations
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {healthcares.map((healthcare:any, index) => (
                  <HealthcareCard
                    key={healthcare.hcoUUID}
                    healthcare={healthcare}
                    onViewDetails={() => {}}
                    index={index}
                    page={0}
                    showApplyButton
                    onApply={handleApplyRecommendation}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};



