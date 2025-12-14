import SuspenseWithBoundary from '@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry'
import RecommendationList from './components/RecommendationList'
import FullPageSkeleton from '@/components/Skeletons/FullpageSkeleton'
import { RecommendationsResponse } from './types'
import mockData from './mockData.json'
export default async function Recommendations() {
  // Simulate API call with mock data
  const dataPromise = new Promise<RecommendationsResponse>((resolve) => {
    setTimeout(() => resolve(mockData as any), 1000)
  })
  
  return (
    <SuspenseWithBoundary loading={<FullPageSkeleton />}>
      <RecommendationList dataPromise={dataPromise} />
    </SuspenseWithBoundary>
  )
}
