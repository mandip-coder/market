import React from 'react';
import { Paperclip, FileText, X } from 'lucide-react';
import { CampaignDocument } from '../types';

interface AttachmentsListProps {
    attachments: CampaignDocument[];
    onRemove: (index: number) => void;
}

const AttachmentsList: React.FC<AttachmentsListProps> = ({ attachments, onRemove }) => {
    if (attachments.length === 0) {
        return (
            <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <Paperclip size={32} className="mx-auto text-slate-300 mb-2 opacity-50" />
                <p className="text-xs text-slate-400 italic">No attachments added yet</p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg group shadow-sm"
                    >
                        <FileText size={14} className="text-blue-500" />
                        <span className="text-xs text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                            {file.filename}
                        </span>
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AttachmentsList;
