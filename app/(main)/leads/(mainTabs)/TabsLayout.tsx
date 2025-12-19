"use client";
import { Card, Tabs } from "antd";
import { TabsProps } from "antd/lib";
import { Search, Wand2 } from "lucide-react";
import React from "react";

export default function TabsLayout({
  leadListing,
  recommendations,
}: {
  leadListing: React.ReactNode;
  recommendations: React.ReactNode;
}) {
  const TabItems: TabsProps["items"] = [
    {
      key: "leads",
      label: (
        <span className="flex items-center gap-1.5">
          <Search className="w-4 h-4" />
          <span>Leads</span>
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
      children: recommendations,
    },
  ];

  return (
    <Card className="w-full min-h-[calc(100vh-130px)] " variant="borderless" size="small">
      <Tabs defaultActiveKey="leads" items={TabItems} />
    </Card>
  );
}
