import { Button } from "antd";
import { Building, Plus } from "lucide-react";
import Link from "next/link";

export const HealthcareEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full mb-6">
        <Building className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No healthcares found</h3>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
        Try adjusting your search or filters, or create a new healthcare to get started
      </p>
      <Link href="/healthcares/new">
        <Button type="primary" icon={<Plus className="h-4 w-4" />}>
          Create New Healthcare
        </Button>
      </Link>
    </div>
  );
}