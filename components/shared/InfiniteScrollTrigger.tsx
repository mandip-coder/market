import { Skeleton } from "antd";
import { useEffect, useRef } from "react";

interface InfiniteScrollTriggerProps {
  onIntersect: () => void;
  isLoading: boolean;
  hasMore: boolean;
  disabled?: boolean;
  threshold?: number;
}

const InfiniteScrollTrigger: React.FC<InfiniteScrollTriggerProps> = ({
  onIntersect,
  isLoading,
  hasMore,
  disabled = false,
  threshold = 0.5,
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoading && !disabled) {
          onIntersect();
        }
      },
      {
        threshold,
        rootMargin: "100px", // Trigger before reaching the very bottom
      }
    );

    const currentRef = triggerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, disabled, onIntersect, threshold]);

  if (!hasMore) return null;

  return (
    <div ref={triggerRef}>
      {isLoading && (
        <div className="py-8">
          <Skeleton active avatar paragraph={{ rows: 4 }} />
          <div className="mt-8">
            <Skeleton active avatar paragraph={{ rows: 4 }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default InfiniteScrollTrigger;
