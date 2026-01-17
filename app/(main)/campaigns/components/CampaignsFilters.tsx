'use client';

import React, { memo, useEffect, useMemo, useState } from 'react';
import { Row, Col, Button, Drawer, Table, Badge, Space, Input, Checkbox, Divider, Modal } from 'antd';
import CustomSelect from '@/components/CustomSelect/CustomSelect';
import { useRegions } from '@/services/dropdowns/dropdowns.hooks';
import { useContactPersons, useMassEmailHCOs, useMassEmailICBs } from '@/app/(main)/campaigns/services/campaigns.hooks';
import { Search, Filter, Users, ShieldAlert, X, ChevronRight, CheckCircle2, Building2, MapPin, RotateCcw, RefreshCw } from 'lucide-react';
import { ColumnItems, CampaignFilters as IMassEmailFilters } from '../types';



// --- Sub-components for Column View ---



const ListColumn = ({
    title,
    items,
    selectedItems,
    onSelect,
    disabled = false,
    onSelectAll,
    onDeselectAll,

}: {
    title: string,
    items: ColumnItems[],
    selectedItems: string[],
    onSelect: (val: string[]) => void,
    disabled?: boolean,
    onSelectAll: () => void,
    onDeselectAll: () => void,

}) => {
    const [search, setSearch] = useState('');
    const filteredItems = items.filter(i => i.label.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className={`flex flex-col h-[400px] lg:h-[calc(100vh-200px)] border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-hidden ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        {title}
                        <span className="ml-1 text-slate-400 font-normal">({items.length})</span>
                    </span>
                    <Checkbox
                        indeterminate={selectedItems.length > 0 && selectedItems.length < items.length}
                        checked={selectedItems.length === items.length && items.length > 0}
                        onChange={(e) => {
                            if (e.target.checked) onSelectAll();
                            else onDeselectAll();
                        }}
                        className="text-[10px]"
                    >
                        All
                    </Checkbox>
                </div>
                <Input
                    size="small"
                    placeholder={`Search ${title}...`}
                    prefix={<Search size={12} />}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
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
};

// --- Main Drawer Component ---

interface RecipientSelectionDrawerProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (selectedContacts: any[], filters: IMassEmailFilters) => void;
    initialSelectedContacts?: any[];
}

const RecipientSelectionDrawer: React.FC<RecipientSelectionDrawerProps> = ({
    visible,
    onClose,
    onConfirm,
    initialSelectedContacts = []
}) => {
    const [regions, setRegions] = useState<string[]>([]);
    const [icbs, setIcbs] = useState<string[]>([]);
    const [healthcares, setHealthcares] = useState<string[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(
        initialSelectedContacts.map(c => c.hcoContactUUID || c.key)
    );
    const [selectedContactMap, setSelectedContactMap] = useState<Map<string, any>>(
        new Map(initialSelectedContacts.map(c => [c.hcoContactUUID || c.key, { ...c, key: c.hcoContactUUID || c.key }]))
    );
    const [searchText, setSearchText] = useState('');
    const [showSelectedOnly, setShowSelectedOnly] = useState(false);

    const [appliedFilters, setAppliedFilters] = useState<IMassEmailFilters | undefined>(undefined);

    // Pass appliedFilters to hook. Only fetch when appliedFilters is set (enabled: !!appliedFilters). 
    // If the hook is triggered, it will use the params from appliedFilters.
    const { data: contactsData, isLoading: isLoadingContacts, isFetching } = useContactPersons(appliedFilters, !!appliedFilters);

    // Use specific mass email hooks for cascading dropdowns
    // Pass 'regions' to fetch ICBs relevant to those regions
    const { data: icbsData, isLoading: isLoadingICBs } = useMassEmailICBs(regions, visible);

    // Derive effective ICB IDs for HCO fetching:
    // 1. If ICBs are selected, use them.
    // 2. If no ICBs are selected but Regions are, use all ICBs from those Regions.
    // 3. Otherwise, use empty list.
    const effectiveIcbIds = useMemo(() => {
        if (icbs.length > 0) return icbs;
        if (regions.length > 0 && icbsData) return icbsData.map(i => i.icbUUID);
        return [];
    }, [icbs, regions, icbsData]);

    // Pass 'regions' and 'icbs' to fetch HCOs relevant to those selections
    const { data: healthCareData, isLoading: isLoadingHealthCare } = useMassEmailHCOs({
        icbIds: effectiveIcbIds
    }, visible);

    const { data: regionsData, isLoading: isLoadingRegions } = useRegions()

    // Cache for labels of items seen so far to preserve selected labels when filtered out
    const [allSeenIcbs, setAllSeenIcbs] = useState<Map<string, string>>(new Map());
    const [allSeenHCOs, setAllSeenHCOs] = useState<Map<string, string>>(new Map());

    useEffect(() => {
        if (icbsData) {
            setAllSeenIcbs(prev => {
                const next = new Map(prev);
                icbsData.forEach(icb => next.set(icb.icbUUID, icb.icbName));
                return next;
            });
        }
    }, [icbsData]);

    useEffect(() => {
        if (healthCareData) {
            setAllSeenHCOs(prev => {
                const next = new Map(prev);
                healthCareData.forEach(hco => next.set(hco.hcoUUID, hco.hcoName));
                return next;
            });
        }
    }, [healthCareData]);



    // Map API data to ListColumn format
    const regionOptions = useMemo(() =>
        (regionsData || []).map(r => ({ label: r.regionName, value: r.regionUUID })),
        [regionsData]);


    // Filtering Logic (Server-side + Client-side Fallback)
    const filteredIcbOptions = useMemo(() => {
        const result = new Map<string, string>();

        // 1. Add currently fetched ICBs that match the region filter
        (icbsData || []).forEach(icb => {
            if (regions.length === 0 || regions.includes(icb.regionUUID)) {
                result.set(icb.icbUUID, icb.icbName);
            }
        });

        // 2. Ensure already selected ICBs are included even if they don't match the filter
        icbs.forEach(id => {
            if (allSeenIcbs.has(id)) {
                result.set(id, allSeenIcbs.get(id)!);
            }
        });

        return Array.from(result.entries()).map(([value, label]) => ({ label, value }));
    }, [icbsData, regions, icbs, allSeenIcbs]);

    const filteredHealthcareOptions = useMemo(() => {
        const result = new Map<string, string>();

        // 1. Add currently fetched HCOs that match the ICB filter
        (healthCareData || []).forEach(hco => {
            if (icbs.length === 0 || icbs.includes(hco.icbUUID)) {
                result.set(hco.hcoUUID, hco.hcoName);
            }
        });

        // 2. Ensure already selected HCOs are included even if they don't match the filter
        healthcares.forEach(id => {
            if (allSeenHCOs.has(id)) {
                result.set(id, allSeenHCOs.get(id)!);
            }
        });

        return Array.from(result.entries()).map(([value, label]) => ({ label, value }));
    }, [healthCareData, icbs, healthcares, allSeenHCOs]);


    const allFilteredContacts = useMemo(() => {
        // Use API data if available, otherwise empty
        let contacts = contactsData || [];

        if (searchText) {
            contacts = contacts.filter(c =>
                c.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
                c.email.toLowerCase().includes(searchText.toLowerCase()) ||
                c.role.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        return contacts;
    }, [contactsData, searchText]);

    const displayContacts = useMemo(() => {
        const selectedList = Array.from(selectedContactMap.values());

        let baseList;
        if (showSelectedOnly) {
            baseList = selectedList;
        } else {
            // Merge current filtered results with already selected contacts to persist them in view
            const filteredIds = new Set(allFilteredContacts.map(c => c.hcoContactUUID));
            const extraSelected = selectedList.filter(c => !filteredIds.has(c.hcoContactUUID));
            baseList = [...allFilteredContacts, ...extraSelected];
        }

        if (!searchText) return baseList;

        const query = searchText.toLowerCase();
        return baseList.filter(c =>
            c.fullName.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query) ||
            c.role.toLowerCase().includes(query)
        );
    }, [showSelectedOnly, allFilteredContacts, selectedContactMap, searchText]);

    // Update Map when allFilteredContacts changes to capture objects for keys already in selectedRowKeys
    useEffect(() => {
        if (allFilteredContacts.length > 0) {
            setSelectedContactMap(prev => {
                const next = new Map(prev);
                let changed = false;
                allFilteredContacts.forEach(c => {
                    const id = c.hcoContactUUID;
                    if (selectedRowKeys.includes(id) && !next.has(id)) {
                        next.set(id, { ...c, key: id });
                        changed = true;
                    }
                });
                return changed ? next : prev;
            });
        }
    }, [allFilteredContacts, selectedRowKeys]);

    // Sync selection with structural filters
    // If a filter is removed, remove any contacts that no longer belong to the filtered set
    // NOTE: With API loading, this logic might need adjustment. For now, we keep selectedRowKeys based on what's loaded 
    // OR we should perhaps NOT clear selection just because filters change, as user might want to accumulate.
    // However, the original logic was "Sync selection with structural filters". 
    // Let's Comment this out for now as we are doing manual load.

    const onTableSelectionChange = (keys: React.Key[]) => {
        setSelectedRowKeys(keys);

        setSelectedContactMap(prev => {
            const next = new Map(prev);

            // 1. Identify which ones were removed (if we are in 'showSelectedOnly' mode, 
            // or just generally compare against current map)
            const newKeysSet = new Set(keys);

            // If it's NOT in new keys, remove from map
            Array.from(next.keys()).forEach(id => {
                if (!newKeysSet.has(id)) {
                    next.delete(id);
                }
            });

            // 2. Add new ones from current visible/loaded list
            // We can only add if we have the full object. 
            // 'displayContacts' contains full objects.
            displayContacts.forEach(c => {
                if (newKeysSet.has(c.hcoContactUUID)) {
                    next.set(c.hcoContactUUID, { ...c, key: c.hcoContactUUID });
                }
            });

            return next;
        });
    };

    const handleClearFilters = () => {
        setRegions([]);
        setIcbs([]);
        setHealthcares([]);
        setSearchText('');
        setAppliedFilters(undefined); // Clear displayed contacts
    };

    const handleLoadContacts = () => {
        setAppliedFilters({
            regionsUUID: regions,
            ICBsUUID: icbs,
            HCOsUUID: healthcares,
        });
    };

    const handleConfirm = () => {
        onConfirm(Array.from(selectedContactMap.values()), {
            regionsUUID: regions,
            ICBsUUID: icbs,
            HCOsUUID: healthcares,
        });
        onClose();
    };

    const columns = [
        {
            title: 'Recipient Details',
            key: 'details',
            render: (_: any, record: any) => (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-slate-100 leading-tight">
                            {record.fullName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                            {record.role}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                        <span className="truncate max-w-[180px]" title={record.email}>{record.email}</span>
                    </div>
                </div>
            )
        }
    ];

    return (
        <Drawer
            title={
                <div className="flex items-center gap-2">
                    <Users size={20} className="text-blue-500" />
                    <span>Select Potential Recipients</span>
                </div>
            }
            open={visible}
            onClose={onClose}
            size={1500}
            styles={{ body: { padding: '16px 24px' } }}
            footer={
                <div className="flex justify-end gap-2 px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" onClick={handleConfirm} size="middle">Confirm Selection</Button>
                </div>
            }
        >
            <Row gutter={[24, 24]}>
                {/* 1. Filters Sidebar (Left) */}
                <Col xs={24} lg={18} className="lg:border-r border-slate-100 dark:border-slate-800 lg:pr-6">
                    <div className="space-y-4 h-full">

                        <Row gutter={[12, 12]}>
                            <Col xs={24} sm={6}>
                                <ListColumn
                                    title="Region"
                                    items={regionOptions}
                                    selectedItems={regions}
                                    onSelect={(val) => { setRegions(val); }}
                                    onSelectAll={() => setRegions(regionOptions.map((r: any) => r.value))}
                                    onDeselectAll={() => { setRegions([]); }}
                                    disabled={isLoadingRegions}
                                />
                            </Col>
                            <Col xs={24} sm={9}>
                                <ListColumn
                                    title={regions.length === 0 ? "ICB (Showing All)" : "ICB"}
                                    items={filteredIcbOptions}
                                    selectedItems={icbs}
                                    onSelect={(selectedICBs) => {
                                        setIcbs(selectedICBs);
                                        // Reverse lookup: Select associated Regions
                                        const associatedRegions = (icbsData || [])
                                            .filter(icb => selectedICBs.includes(icb.icbUUID))
                                            .map(icb => icb.regionUUID);

                                        setRegions(prev => Array.from(new Set([...prev, ...associatedRegions])));
                                    }}
                                    onSelectAll={() => {
                                        const allIcbIds = filteredIcbOptions.map((o: any) => o.value);
                                        setIcbs(allIcbIds);
                                        // Reverse lookup for all
                                        const associatedRegions = (icbsData || [])
                                            .filter(icb => allIcbIds.includes(icb.icbUUID))
                                            .map(icb => icb.regionUUID);
                                        setRegions(prev => Array.from(new Set([...prev, ...associatedRegions])));
                                    }}
                                    onDeselectAll={() => { setIcbs([]); }}
                                    disabled={isLoadingICBs}
                                />
                            </Col>

                            <Col xs={24} sm={9}>
                                <ListColumn
                                    title={icbs.length === 0 ? "Healthcare (Showing All)" : "Healthcare"}
                                    items={filteredHealthcareOptions}
                                    selectedItems={healthcares}
                                    onSelect={(selectedHCOs) => {
                                        setHealthcares(selectedHCOs);

                                        // Reverse lookup 1: Select associated ICBs
                                        const associatedICBs = (healthCareData || [])
                                            .filter(hco => selectedHCOs.includes(hco.hcoUUID))
                                            .map(hco => hco.icbUUID);

                                        // Update ICBs first
                                        setIcbs(prev => {
                                            const newICBs = Array.from(new Set([...prev, ...associatedICBs]));

                                            // Reverse lookup 2: Select associated Regions based on NEW set of ICBs
                                            // We need to look up regions for these ICBs. We can use icbsData for this lookup 
                                            // assuming icbsData contains the relevant ICBs (which it should if loaded).
                                            const associatedRegions = (icbsData || [])
                                                .filter(icb => newICBs.includes(icb.icbUUID))
                                                .map(icb => icb.regionUUID);

                                            setRegions(prevRegions => Array.from(new Set([...prevRegions, ...associatedRegions])));

                                            return newICBs;
                                        });
                                    }}
                                    onSelectAll={() => {
                                        const allHcoIds = filteredHealthcareOptions.map((o: any) => o.value);
                                        setHealthcares(allHcoIds);

                                        // Reverse lookup 1: Select associated ICBs
                                        const associatedICBs = (healthCareData || [])
                                            .filter(hco => allHcoIds.includes(hco.hcoUUID))
                                            .map(hco => hco.icbUUID);

                                        setIcbs(prev => {
                                            const newICBs = Array.from(new Set([...prev, ...associatedICBs]));

                                            // Reverse lookup 2: Regions
                                            const associatedRegions = (icbsData || [])
                                                .filter(icb => newICBs.includes(icb.icbUUID))
                                                .map(icb => icb.regionUUID);

                                            setRegions(prevRegions => Array.from(new Set([...prevRegions, ...associatedRegions])));
                                            return newICBs;
                                        });

                                    }}
                                    onDeselectAll={() => setHealthcares([])}
                                    disabled={isLoadingHealthCare}

                                />
                            </Col>
                        </Row>
                        <div className="flex justify-end pt-2 gap-2">
                            <Button
                                type="text"
                                size="middle"
                                icon={<RotateCcw size={14} />}
                                onClick={handleClearFilters}
                                className="text-slate-500 hover:text-blue-500"
                            >
                                Reset Filters
                            </Button>
                            <Button
                                type="primary"
                                size="middle"
                                icon={<RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />}
                                onClick={handleLoadContacts}
                                disabled={isFetching}
                            >
                                Load Contacts
                            </Button>
                        </div>
                    </div>
                </Col>

                <Col xs={24} lg={6} className="flex flex-col h-full">
                    <div className="flex flex-col h-[400px] lg:h-[calc(100vh-200px)] border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-hidden">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                    Contact Person
                                    <span className="ml-1 text-slate-400 font-normal">({allFilteredContacts.length})</span>
                                </span>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        className="text-[10px]"
                                        checked={displayContacts.length > 0 && displayContacts.every(c => selectedRowKeys.includes(c.hcoContactUUID))}
                                        indeterminate={displayContacts.some(c => selectedRowKeys.includes(c.hcoContactUUID)) && !displayContacts.every(c => selectedRowKeys.includes(c.hcoContactUUID))}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                const newKeys = Array.from(new Set([...selectedRowKeys, ...displayContacts.map(c => c.hcoContactUUID)]));
                                                onTableSelectionChange(newKeys);
                                            } else {
                                                const visibleKeys = new Set(displayContacts.map(c => c.hcoContactUUID));
                                                const newKeys = selectedRowKeys.filter(k => !visibleKeys.has(k));
                                                onTableSelectionChange(newKeys);
                                            }
                                        }}
                                    >
                                        All
                                    </Checkbox>
                                    <Divider type="vertical" className="m-0 h-3" />
                                    <Checkbox
                                        className="text-[10px]"
                                        checked={showSelectedOnly}
                                        onChange={(e) => setShowSelectedOnly(e.target.checked)}
                                    >
                                        Selected
                                    </Checkbox>
                                </div>
                            </div>
                            <div className="flex gap-2 mb-2">
                                <span className="text-[10px] text-slate-500 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                    {showSelectedOnly ? "Showing Selected" : "Filter Results"} ({displayContacts.length})
                                </span>
                            </div>
                            <Input
                                placeholder="Search contacts..."
                                prefix={<Search size={12} className="text-slate-400" />}
                                size="small"
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                className="bg-white"
                            />
                        </div>

                        <div className="flex-1 h-full  bg-white dark:bg-slate-900 overflow-hidden relative">
                            {/* Hint Overlay when no data loaded */}
                            {!appliedFilters && allFilteredContacts.length === 0 && (
                                <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                                    <Filter size={32} className="text-slate-300 mb-2" />
                                    <p className="text-sm text-slate-500 font-medium">Select filters and click "Load Contacts"</p>
                                </div>
                            )}

                            <Table
                                rowSelection={{
                                    type: 'checkbox',
                                    selectedRowKeys,
                                    onChange: onTableSelectionChange,
                                }}
                                columns={columns}
                                dataSource={displayContacts.map(c => ({ ...c, key: c.hcoContactUUID }))}
                                pagination={false}
                                scroll={{ y: 'calc(100vh - 365px)' }}
                                size="small"
                                showHeader={false}
                                className="contacts-table border-none"
                                loading={isLoadingContacts || isFetching}
                            />
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <span className="text-[10px] text-slate-500">{selectedRowKeys.length} selected</span>
                        </div>
                    </div>
                </Col>
            </Row>
        </Drawer>
    );
};

export default memo(RecipientSelectionDrawer);
