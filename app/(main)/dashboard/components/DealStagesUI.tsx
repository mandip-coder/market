import { APIPATH } from '@/shared/constants/url';
import { SERVERAPI } from '@/Utils/apiFunctions';
import { Badge } from 'antd';
import Link from 'next/link';

type DealStage = {
  stageName: string;
  stageCount: number;
}

export default async function DealStagesUI() {
    const response = await SERVERAPI(APIPATH.DASHBOARD.STAGECOUNTS)
    const stats = response.data as DealStage[]
  return (
    <>
      {stats.map(({stageName, stageCount}, index) => (
        <Link href={`/deals?stage=${stageName.toLowerCase()}`} key={stageName} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{index + 1}</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{stageName}</span>
          </div>
          <Badge count={stageCount} color="orange" />
        </Link>
      ))}
    </>
  )
}
