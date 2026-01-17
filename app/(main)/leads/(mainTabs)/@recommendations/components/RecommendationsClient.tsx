'use client'

import AppErrorUI from '@/components/AppErrorUI/AppErrorUI';
import { Button, Col, Empty, Row, Spin } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { useInfiniteRecommendations } from '../../../services/recommendations.hooks';
import { Recommendation } from '../types';
import RecommendationCard from './RecommendationCard';
import RecommendationFilters from './RecommendationFilters';

function RecommendationsClient() {
  const [countryUUID, setCountryUUID] = useState<string | undefined>();
  const [regionalOfficeCode, setRegionalOfficeCode] = useState<string | undefined>();
  const [icbCode, setICBCode] = useState<string | undefined>();
  

  const filters = useMemo(
    () => ({
      countryUUID,
      regionalOfficeCode,
      icbCode,
    }),
    [countryUUID, regionalOfficeCode, icbCode]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteRecommendations(filters);



  const handleClear = useCallback(() => {
    setCountryUUID(undefined);
    setRegionalOfficeCode(undefined);
    setICBCode(undefined);
  }, []);
  

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Flatten all pages into a single array
  const recommendations = useMemo(() => {
    return data?.pages.flatMap((page) => page.data.list) || [];
  }, [data]);


  return (
    <div className="p-6">
      <RecommendationFilters
        countryUUID={countryUUID}
        regionalOfficeCode={regionalOfficeCode}
        icbCode={icbCode}
        onCountryChange={setCountryUUID}
        onRegionalOfficeChange={setRegionalOfficeCode}
        onICBChange={setICBCode}
        onClear={handleClear}
        onRefresh={handleRefresh}
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
        </div>
      ) : error ? (
        <AppErrorUI
          // @ts-ignore
          code={error.statusCode}
          message={error.message}
        />
      ) : recommendations.length === 0 ? (
        <Empty
          description="No recommendations found"
          className="py-20"
        />
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {recommendations.length} of {data?.pages[0].data.totalCount} recommendations
          </div>

          <Row gutter={[16, 16]}>
            {recommendations.map((recommendation: Recommendation) => (
              <Col
                key={recommendation.recommendedUUID}
                xs={24}
                sm={12}
                lg={8}
              >
                <RecommendationCard
                  recommendation={recommendation}
                />
              </Col>
            ))}
          </Row>

          {hasNextPage && (
            <div className="flex justify-center mt-6">
              <Button
                type="default"
                onClick={() => fetchNextPage()}
                loading={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RecommendationsClient;