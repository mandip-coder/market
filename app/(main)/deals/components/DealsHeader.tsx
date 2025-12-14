"use client";
import PageHeading from "@/components/PageHeading/PageHeading";
import { Button } from "antd";
import { Plus } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import { useDealStore } from "../../../../context/store/dealsStore";
import DealDrawer from "./Add-Deal";

function DealsHeader() {
  const { viewMode, setViewMode, setDealDrawer } = useDealStore();

  const toggleViewMode = useCallback(() => {
    if (viewMode === "grid") {
      setViewMode("table");
    } else {
      setViewMode("grid");
    }
  }, [viewMode]);

  const extraContent = useMemo(
    () => (
      <div className="flex gap-3 flex-shrink-0">
        <Button onClick={toggleViewMode}>
          {viewMode === "grid" ? "Table View" : "Grid View"}
        </Button>
        <Button
          type="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setDealDrawer(true)}
        >
          New Deal
        </Button>
      </div>
    ),
    [viewMode]
  );
  return (
    <>
      <PageHeading
        title="Deals"
        descriptionLine="Track and manage all clients interactions"
        extra={extraContent}
      />
      <DealDrawer />
    </>
  );
}
export default memo(DealsHeader);
