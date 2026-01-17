"use client";
import { Card, Tabs } from "antd";
import { TabsProps } from "antd/lib";
import { Search, Wand2 } from "lucide-react";
import React, { useState } from "react";

export default function TabsLayout({
  leadListing,
  recommendations,
}: {
  leadListing: React.ReactNode;
  recommendations: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<string>("leads");
  const [hasVisitedRecommendations, setHasVisitedRecommendations] = useState(false);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === "recommendations" && !hasVisitedRecommendations) {
      setHasVisitedRecommendations(true);
    }
  };

  const TabItems: TabsProps["items"] = [
    {
      key: "leads",
      label: (
        <span className="flex items-center gap-1.5">
          <Search className="w-4 h-4" />
          <span>Prospect</span>
        </span>
      ),
      children: leadListing,
    },
    {
      key: "recommendations",
      label: (
        <span className="flex items-center gap-1.5">
          <Wand2 className="w-4 h-4" />
          <span>Recommendations</span>
        </span>
      ),
      // Only render recommendations when the tab has been visited
      children: hasVisitedRecommendations ? recommendations : null,
    },
  ];

  return (
    <Card className="w-full min-h-[calc(100vh-130px)] " variant="borderless" size="small">
      <Tabs activeKey={activeTab} onChange={handleTabChange} items={TabItems} />
    </Card>
  );
}
