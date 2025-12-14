
'use client'
import { use } from 'react';
import { RecommendationsResponse, Recommendation } from '../types';
import RecommendationCard from './RecommendationCard';
import { useLeadStore } from '@/context/store/leadsStore';
import { Row, Col, Empty } from 'antd';
import { Lightbulb } from 'lucide-react';

export default function RecommendationList({ dataPromise }: { dataPromise: Promise<RecommendationsResponse> }) {
  const data = use(dataPromise);
  const { toggleLeadDrawer } = useLeadStore();

  const handleCardClick = (recommendation: Recommendation) => {
    // Prepare pre-filled data for the lead drawer
    const preFilledData = {
      leadName: `${recommendation.hcoName} - ${recommendation.leadSource}`,
      hcoUUID: recommendation.hcoUUID,
      summary: recommendation.summary,
      leadSource: recommendation.leadSource.toLowerCase().replace(/_/g, ' '),
      contactPerson: recommendation.contactPersons.map(cp => cp.hcoContactUUID),
      owner: [],
      dateAndTime: new Date().toISOString(),
    };

    // Open the drawer with suggestion ID and pre-filled data
    toggleLeadDrawer(recommendation.suggestionId, preFilledData);
  };

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
      
      <Row gutter={[16, 16]}>
        {data.data.map((recommendation) => {
          
   
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
    </div>
  );
}
