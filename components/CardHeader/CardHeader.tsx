import { LucideProps } from "lucide-react";
import { cloneElement } from "react";

export const CardHeader = ({
  icon,
  title = "Title",
  id,
  extra,
  onClick,
  className
}: {
  icon?: React.ReactElement<LucideProps>;
  title: React.ReactNode;
  id?: string;
  className?: string;
  extra?: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    
    <div className={`${onClick && "cursor-pointer"} flex items-center justify-between gap-1.5 ${className}`} id={id} onClick={onClick}>
      <div className="flex items-center justify-between gap-1.5">
        {icon &&
          cloneElement(icon, {
            size: 16,
            className: "text-secondary"
          })}
        <span className="text-primary font-semibold">{title}</span>
      </div>
      {
        extra && extra
      }
    </div>
  );
};
