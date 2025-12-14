import { useRef, useState, useEffect } from "react";

interface WrapperSize {
  width: number;
  height: number;
}

export const useTableScroll = (pagination?: any) => {
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState<number | string | undefined>(undefined);
  const [wrapperSize, setWrapperSize] = useState<WrapperSize>({ width: 0, height: 0 });
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(document.fullscreenElement !== null);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!tableWrapperRef.current) return;

    const updateSize = () => {
      const el = tableWrapperRef.current;
      if (!el) return;
      setWrapperSize({
        width: el.offsetWidth,
        height: el.offsetHeight,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  // --- Helpers ---
  const getPaginationHeight = () => {
    const basicTable = tableWrapperRef.current?.getElementsByClassName("pro-table-customize")[0];
    if (!basicTable) return 0;
    const paginationEl = basicTable.querySelector(".ant-pagination") as HTMLElement;
    if (!paginationEl) return 0;
    return paginationEl.offsetHeight + 16;
  };

  const getFooterHeight = () => {
    const basicTable = tableWrapperRef.current?.getElementsByClassName("pro-table-customize")[0];
    if (!basicTable) return 0;
    const footerEl = basicTable.querySelector(".ant-table-footer") as HTMLElement;
    if (!footerEl) return 0;
    return footerEl.offsetHeight;
  };

  
  useEffect(() => {
    if (fullscreen) {
      setScrollY(window.innerHeight - 160);
    }
    else if (tableWrapperRef.current && wrapperSize.height) {
      const basicTable = tableWrapperRef.current.querySelectorAll(".pro-table-customize");
      if (!basicTable) return;
      const tableWrapperRect = tableWrapperRef.current.getBoundingClientRect();
      if (tableWrapperRect.top > window.innerHeight) return; // skip if offscreen
      basicTable.forEach((table) => {
        const tableBody = table.querySelector("div.ant-table-body");
        if (!tableBody) return;
        const offsetBottom = 16;
        const realOffsetBottom = offsetBottom + getPaginationHeight() + getFooterHeight();

        const tableBodyRect = tableBody.getBoundingClientRect();
        const bodyHeight = window.innerHeight - tableBodyRect.top - realOffsetBottom;

        tableBody.setAttribute(
          "style",
          `overflow-y: auto;min-height: ${bodyHeight}px;max-height: ${bodyHeight}px;`
        );
        setScrollY(bodyHeight);
      })

    }
  }, [wrapperSize.height, pagination, fullscreen]);

  return {
    tableWrapperRef,
    scrollY,
    wrapperSize,
  };
};
