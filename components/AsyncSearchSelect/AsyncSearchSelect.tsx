import React, { useEffect, useMemo, useRef, useState } from "react";
import { Select, Spin } from "antd";
import type { SelectProps } from "antd";
import debounce from "lodash/debounce";
import { LoadingOutlined } from "@ant-design/icons";
import { Check } from "lucide-react";

// --- Types -------------------------------------------------
interface ApiItem {
  id: string;
  name: string;
}

type Option = { label: string; value: string };

interface AsyncSearchSelectProps extends Omit<SelectProps<string, any>, "onSearch"> {
  /** URL endpoint that returns `{ items: ApiItem[] }`. If omitted, the example will stub results. */
  fetchUrl?: string;
  /** debounce delay in ms */
  debounceMs?: number;
}

// --- Component -------------------------------------------
const AsyncSearchSelect: React.FC<AsyncSearchSelectProps> = ({
  fetchUrl,
  debounceMs = 350,
  placeholder = "Search...",
  onSelect,
  ...rest
}) => {
  const [options, setOptions] = useState<Option[]>(rest.options || []);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Fetcher (adapt to your API shape)
  const fetchOptions = async (q: string, signal?: AbortSignal): Promise<Option[]> => {
    if (!q) return [];
    if (!fetchUrl) {
      await new Promise((r) => setTimeout(r, 600));
      return Array.from({ length: 6 }).map((_, i) => ({
        label: `${q} result ${i + 1}`,
        value: `${q}-${i}`,
      }));
    }

    const url = `${fetchUrl}?q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error("Network response was not ok");

    // adapt this to match your API response
    const payload: { items: ApiItem[] } = await res.json();
    return payload.items.map((it) => ({ label: it.name, value: it.id }));
  };

  // Debounced handler — memoized so it won't recreate on every render
  const handleSearch = useMemo(() => {
    const fn = async (value: string) => {
      // cancel previous in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }

      if (!value) {
        setOptions([]);
        setLoading(false);
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        setLoading(true);
        const opts = await fetchOptions(value, controller.signal);
        setOptions(opts);
      } catch (err: any) {
        if (err?.name === "AbortError") {
          // silent on abort
        } else {
          // you might want to surface errors to the user in production
          // console.error("search failed", err);
        }
      } finally {
        // small guard: only clear loading if the current controller is the same
        if (abortRef.current === controller) setLoading(false);
      }
    };

    return debounce(fn, debounceMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUrl, debounceMs]);

  // cleanup on unmount: cancel debounce and abort any request
  useEffect(() => {
    return () => {
      handleSearch.cancel();
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [handleSearch]);

  // optional: expose a lightweight notFoundContent that shows a custom loader when searching
  const notFoundContent = loading ? (
    <div style={{ display: "flex", gap: 8, alignItems: "center", padding: 12 }}>
      <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
      <span>Searching…</span>
    </div>
  ) : (
    "No results"
  );

  return (
    <Select
      showSearch={
        {
          optionFilterProp: 'label',
          autoClearSearchValue: true,
          filterOption: false
        }
      }
      options={options}
      placeholder={placeholder}
      notFoundContent={notFoundContent}
      onSelect={onSelect}
      className="w-full"
      menuItemSelectedIcon={({ isSelected }) => {
        if (!isSelected) return null;
        return <Check className="h-4 w-4 text-white" />
      }}
      {...rest}
    />
  );
};

export default AsyncSearchSelect;