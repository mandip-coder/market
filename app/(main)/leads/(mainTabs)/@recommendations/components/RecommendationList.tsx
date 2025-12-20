
'use client'
import { useLeadStore } from '@/context/store/leadsStore';
import { useApi } from '@/hooks/useAPI';
import { Col, Empty, Row } from 'antd';
import { Lightbulb } from 'lucide-react';
import { useState, useMemo } from 'react';
import { LeadFormData } from '../../../components/LeadDrawer';
import { Recommendation, RecommendationsResponse } from '../types';
import RecommendationCard from './RecommendationCard';
import RecommendationFilters, { FilterValues } from './RecommendationFilters';

export default function RecommendationList({ data }: { data: RecommendationsResponse }) {
  const { toggleLeadDrawer } = useLeadStore();
  const API = useApi();

  // Filter state
  const [filters, setFilters] = useState<FilterValues>({
    hcoNames: [],
    leadSources: [],
    products: [],
    contactPersons: [],
    minDealCount: 0,
    minRating: 0,
  });

  const handleCardClick = async (recommendation: Recommendation) => {
    const preFilledData: LeadFormData = {
      leadName: `${recommendation.hcoName} - ${recommendation.leadSourceName}`,
      hcoUUID: recommendation.hcoUUID,
      summary: recommendation.summary,
      leadSource: recommendation.leadSource,
      contactPersons: [],
      assignTo: [],
      leadDate: new Date().toISOString(),
      leadUUID: ""
    };

    // Open the drawer with suggestion ID and pre-filled data
    toggleLeadDrawer(recommendation.suggestionId, preFilledData);
  };

  // Filter logic
  const filteredData = useMemo(() => {
    if (!data || !data.data) return [];

    return data.data.filter((recommendation) => {
      // Filter by HCO names
      if (filters.hcoNames.length > 0) {
        if (!filters.hcoNames.includes(recommendation.hcoName)) {
          return false;
        }
      }

      // Filter by lead source
      if (filters.leadSources.length > 0) {
        if (!filters.leadSources.includes(recommendation.leadSourceName)) {
          return false;
        }
      }

      // Filter by products
      if (filters.products.length > 0) {
        const hasProduct = recommendation.products.some((product) =>
          filters.products.includes(product.productName)
        );
        if (!hasProduct) {
          return false;
        }
      }

      // Filter by contact persons
      if (filters.contactPersons.length > 0) {
        const hasContact = recommendation.contactPersons.some((contact) =>
          filters.contactPersons.includes(contact.fullName)
        );
        if (!hasContact) {
          return false;
        }
      }

      // Filter by minimum deal count
      if (filters.minDealCount > 0) {
        const maxDealCount = Math.max(
          ...recommendation.products.map((p) => p.dealCount)
        );
        if (maxDealCount < filters.minDealCount) {
          return false;
        }
      }

      // Filter by minimum rating
      if (filters.minRating > 0) {
        const maxRating = Math.max(
          ...recommendation.contactPersons.map((c) => c.rating || 0)
        );
        if (maxRating < filters.minRating) {
          return false;
        }
      }

      return true;
    });
  }, [data, filters]);

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Empty
          image={<Lightbulb size={64} className="text-gray-400 mx-auto mb-4" />}
          description={
            <div className="text-center">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No Recommendations Available</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Check back later for AI-powered lead suggestions</p>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Filters */}
      <RecommendationFilters
        data={data.data}
        filters={filters}
        onFilterChange={setFilters}
        resultCount={filteredData.length}
      />

      {/* Results */}
      {filteredData.length === 0 ? (
        <div className="flex items-center justify-center h-[40vh]">
          <Empty
            image={<Lightbulb size={64} className="text-gray-400 mx-auto mb-4" />}
            description={
              <div className="text-center">
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No Matching Recommendations</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters to see more results</p>
              </div>
            }
          />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredData.map((recommendation) => {
            return (
              <Col key={recommendation.suggestionId} xs={24} sm={24} md={12} lg={8} xl={8}>
                <RecommendationCard
                  recommendation={recommendation}
                  onClick={handleCardClick}
                />
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
