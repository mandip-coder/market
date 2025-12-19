import { Card } from "antd";
import { ArrowUpRight } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  trend?: {
    isPositive: boolean;
    value: number;
  };
  size?: "small" | "default";
}

export const KpiCard = ({
  title,
  value,
  icon,
  color = "#1890ff",
  trend,
  size,
}: KPICardProps) => {
  const fontsize = size === "small" ? "text-md" : "text-2xl";

  return (
    <Card
      variant="borderless"
      styles={{
        body: {
          padding: "20px",
          height: "100%",
        },
      }}
      className="h-full"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-gray-500 text-sm font-medium mb-1">{title}</div>
          <div className={`${fontsize} font-bold`} style={{ color }}>
            {value}
          </div>
          {trend && (
            <div
              className={`flex items-center mt-2 text-xs ${
                trend.isPositive ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight size={15} />
              ) : (
                <ArrowUpRight size={15} className="rotate-90" />
              )}
              <span className="ml-1">{Math.abs(trend.value)}%</span>
              <span className="ml-1 text-gray-400">from last month</span>
            </div>
          )}
        </div>
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${color}10`, color }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};
