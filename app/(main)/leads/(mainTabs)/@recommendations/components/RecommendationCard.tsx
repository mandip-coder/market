import { Recommendation } from '../types';
import { Building2, Lightbulb, Package, Users, Info, Star } from 'lucide-react';
import { Card, Tag, Button, Popover } from 'antd';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onClick: (recommendation: Recommendation) => void;
}

const getLeadSourceLabel = (source: string): { label: string; color: string } => {
  const sourceMap: Record<string, { label: string; color: string }> = {
    'AI_MODEL_V1': { label: 'AI Recommendation', color: 'purple' },
    'MARKET_TREND_ENGINE': { label: 'Market Trend', color: 'blue' },
    'MANUAL': { label: 'Manual', color: 'green' },
  };
  return sourceMap[source] || { label: source, color: 'default' };
};

export default function RecommendationCard({ recommendation, onClick }: RecommendationCardProps) {
  const sourceInfo = getLeadSourceLabel(recommendation.leadSource);
  const primaryProduct = recommendation.products[0];
  const additionalProducts = recommendation.products.slice(1);
  const primaryContact = recommendation.contactPersons[0];
  const additionalContacts = recommendation.contactPersons.slice(1);

  const productsContent = (
    <div className="space-y-1 max-w-xs">
      {additionalProducts.map((product) => (
        <div key={product.productUUID} className="text-xs">
          {product.productName} ({product.dealCount})
        </div>
      ))}
    </div>
  );

  const contactsContent = (
    <div className="space-y-1 max-w-xs">
      {additionalContacts.map((contact) => (
        <div key={contact.hcoContactUUID} className="text-xs">
          <div className="font-medium">{contact.fullName}</div>
          <div className="text-gray-400">{contact.role}</div>
          <div className="flex items-center gap-1 mt-0.5">
            <Star size={10} className="fill-yellow-400 text-yellow-400" />
            <span className="text-gray-600 dark:text-gray-400">{contact?.rating?.toFixed(1)}/5</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card
      hoverable
      className="border-l-4 border-l-blue-500 dark:border-l-blue-400 !h-full"
    >
      <div className="space-y-3">
        {/* Header Section - Compact */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={18} />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white m-0 truncate">
                {recommendation.hcoName}
              </h3>
            </div>
            <Tag color={sourceInfo.color} className="text-xs">
              {sourceInfo.label}
            </Tag>
          </div>
          <Button 
            type="primary" 
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onClick(recommendation);
            }}
            className="flex-shrink-0"
          >
            Apply
          </Button>
        </div>

        {/* Summary Section - Compact */}
        <div className="flex items-start gap-2">
          <Lightbulb className="text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={14} />
          <p className="text-xs text-gray-700 dark:text-gray-300 m-0 line-clamp-2">
            {recommendation.summary}
          </p>
        </div>

        {/* Single Product with Deal Count */}
        {primaryProduct && (
          <div className="flex items-center gap-2">
            <Package className="text-green-600 dark:text-green-400 flex-shrink-0" size={14} />
            <span className="text-sm text-gray-900 dark:text-white font-medium">
              {primaryProduct.productName} ({primaryProduct.dealCount})
            </span>
            {additionalProducts.length > 0 && (
              <Popover
                content={productsContent}
                title="Additional Products"
                trigger="hover"
                placement="top"
              >
                <Tag className="text-xs cursor-pointer bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300">
                  <Info size={10} className="inline mr-1" />
                  +{additionalProducts.length}
                </Tag>
              </Popover>
            )}
          </div>
        )}

        {/* Primary Contact Person */}
        {primaryContact && (
          <div className="flex items-center gap-2">
            <Users className="text-purple-600 dark:text-purple-400 flex-shrink-0" size={14} />
            <div className="text-xs text-gray-700 dark:text-gray-300 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-medium">{primaryContact.fullName}</span>
                <Tag color="gold" className="text-xs m-0 px-1.5 py-0">Primary</Tag>
              </div>
              <div className="text-gray-500 dark:text-gray-500">{primaryContact.role}</div>
             { primaryContact.rating && <div className="flex items-center gap-1 mt-0.5">
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-900 dark:text-white">{primaryContact.rating.toFixed(1)}/5</span>
              </div>}
            </div>
            {additionalContacts.length > 0 && (
              <Popover
                content={contactsContent}
                title="Additional Contacts"
                trigger="hover"
                placement="top"
              >
                <Tag className="text-xs cursor-pointer bg-purple-50 dark:bg-purple-900 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 flex-shrink-0">
                  <Info size={10} className="inline mr-1" />
                  +{additionalContacts.length}
                </Tag>
              </Popover>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}