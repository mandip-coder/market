import Input from "@/components/Input/Input";
import { Checkbox } from "antd";
import { Search } from "lucide-react";
import { useState } from "react";


export function ListColumn({
    title,
    items,
    selectedItems,
    onSelect,
    disabled = false,
    onSelectAll,
    onDeselectAll
}: {
    title: string,
    items: any[],
    selectedItems: string[],
    onSelect: (val: string[]) => void,
    disabled?: boolean,
    onSelectAll: () => void,
    onDeselectAll: () => void
}) {

    const [search, setSearch] = useState('');
    const filteredItems = items.filter(i => i.label.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className={`flex flex-col h-[400px] lg:h-[calc(100vh-280px)] border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-hidden ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">{title}</span>
                    <Checkbox
                        indeterminate={selectedItems.length > 0 && selectedItems.length < items.length}
                        checked={selectedItems.length === items.length && items.length > 0}
                        onChange={(e) => {
                            if (e.target.checked) onSelectAll();
                            else onDeselectAll();
                        }}
                        className="text-[10px]"
                    >
                        Select All
                    </Checkbox>
                </div>
                <Input
                    size="small"
                    placeholder={`Search ${title}...`}
                    prefix={<Search size={12} />}
                    value={search}
                    onChange={(e:any) => setSearch(e.target.value)}
                    className="bg-white"
                />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                <Checkbox.Group
                    className="flex flex-col gap-2 w-full"
                    value={selectedItems}
                    onChange={(vals) => onSelect(vals as string[])}
                >
                    {filteredItems.map(item => (
                        <div key={item.value} className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 p-1 rounded transition-colors">
                            <Checkbox value={item.value} />
                            {/* <Checkbox value={title == "ICB" ? item.hcoTypeUUID : item.value} /> */}
                            <span className="text-sm text-slate-700 dark:text-slate-300 truncate" title={item.label}>{item.label}</span>
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="text-center py-10 text-xs text-slate-400 italic">No {title} found</div>
                    )}
                </Checkbox.Group>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="text-[10px] text-slate-500">{selectedItems.length} selected</span>
            </div>
        </div>
    );
}