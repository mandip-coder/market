import React from 'react';
import { Button, Typography } from 'antd';
import { Users } from 'lucide-react';
import Label from '@/components/Label/Label';

const { Text } = Typography;

interface SelectedRecipientsPreviewProps {
    count: number;
    onClear: () => void;
    onOpenFilters: () => void;
}

const SelectedRecipientsPreview: React.FC<SelectedRecipientsPreviewProps> = ({ count, onClear, onOpenFilters }) => {
    return (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <Label required text="Recipients" />
                    <Text type="secondary" className="text-xs">Select target contacts for this campaign</Text>
                </div>
                <Button
                    type="primary"
                    ghost
                    icon={<Users size={16} />}
                    onClick={onOpenFilters}
                >
                    Add/Filter Recipients
                </Button>
            </div>

            <div className="min-h-[80px] p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                {count === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-4 text-slate-400">
                        <Users size={32} strokeWidth={1.5} className="mb-2 opacity-50" />
                        <span className="text-sm italic">No recipients selected yet. Use the button above to filter and add.</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-between h-full py-2 px-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400">
                                <Users size={24} />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                    {count} Recipients Selected
                                </div>
                                <div className="text-xs text-slate-500">
                                    Ready to receive this email campaign
                                </div>
                            </div>
                        </div>
                        <Button
                            type="link"
                            danger
                            size="small"
                            onClick={onClear}
                            className="text-xs"
                        >
                            Clear Selection
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SelectedRecipientsPreview;
