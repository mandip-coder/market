// Unauthorized page

"use client";

import { useRouter } from "next/navigation";
import { Result, Button } from "antd";
import { useAuthorization } from "@/hooks/useAuthorization";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { currentCompany, pageAccess } = useAuthorization();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Result
        status="403"
        title="403 - Unauthorized"
        subTitle={
          <div className="space-y-2">
            <p>Sorry, you don't have permission to access this page.</p>
            {/* {currentCompany && (
              <p className="text-sm text-gray-500">
                Current company: <strong>{currentCompany.displayName}</strong>
              </p>
            )} */}
            {/* {pageAccess && pageAccess.length > 0 && (
              <p className="text-sm text-gray-500">
                Your access: {pageAccess.join(", ")}
              </p>
            )} */}
          </div>
        }
        extra={
          <div className="space-x-2">
            <Button type="primary" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        }
      />
    </div>
  );
}
