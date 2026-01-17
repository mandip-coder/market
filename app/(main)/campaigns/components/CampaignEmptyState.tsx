import React from 'react';
import { Typography, Button } from 'antd';
import { Send, Paperclip } from 'lucide-react';

const { Title, Text } = Typography;

interface CampaignEmptyStateProps {
    onCreateNew: () => void;
}

const CampaignEmptyState: React.FC<CampaignEmptyStateProps> = ({ onCreateNew }) => {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-[2rem] shadow-2xl shadow-blue-500/20 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                    <Send size={56} className="text-white drop-shadow-lg" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl ring-4 ring-slate-50 dark:ring-slate-900 animate-bounce delay-700">
                    <Paperclip size={20} className="text-blue-500" />
                </div>
            </div>

            <div className="max-w-md mx-auto space-y-3 mb-10">
                <Title level={3} className="text-slate-800 dark:text-slate-100 font-extrabold tracking-tight mb-0">
                    No Campaigns Yet
                </Title>
                <Text className="text-slate-500 dark:text-slate-400 text-base leading-relaxed block">
                    You haven't launched any email campaigns. Reach out to your contacts with professional, tracked marketing communications.
                </Text>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    type="primary"
                    size="large"
                    onClick={onCreateNew}
                    className="h-14 px-10 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/25 border-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 active:scale-95 transition-all"
                >
                    Start First Campaign
                </Button>
            </div>
        </div>
    );
};

export default CampaignEmptyState;
