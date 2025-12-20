'use client'

import FullPageSkeleton from '@/components/Skeletons/FullpageSkeleton'
import { useQuery } from '@tanstack/react-query'
import mockData from '../mockData.json'
import { RecommendationsResponse } from '../types'
import RecommendationList from './RecommendationList'

// Simulate API call function
const fetchRecommendations = async (): Promise<RecommendationsResponse> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return mockData as any
}

export default function RecommendationsClient() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['recommendations'],
    queryFn: fetchRecommendations,
    staleTime: 60 * 60000, // 1 hour - data stays fresh for 1 hour
    gcTime: 60 * 60000, // 1 hour - cache time (formerly cacheTime)
  })

  if (isLoading) {
    return <FullPageSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-lg font-medium text-red-600">Error loading recommendations</p>
          <p className="text-sm text-gray-500">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return <RecommendationList data={data} />
}
