import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { Download, MoreVertical, Trash2 } from 'lucide-react';
import React, { useMemo } from 'react';

interface ExtraThingsProps {
  selectedProducts: React.Key[];
  onBulkAction: (action: string) => void;
}

export function ExtraThings({ selectedProducts, onBulkAction }: ExtraThingsProps) {
  const bulkActionItems: MenuProps['items'] = useMemo(() => [
    {
      key: 'export',
      label: 'Export Selected',
      icon: <Download size={14} />,
      onClick: () => onBulkAction('export'),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Delete Selected',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: () => onBulkAction('delete'),
    },
  ], [onBulkAction]);

  if (selectedProducts.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">
        {selectedProducts.length} selected
      </span>
      <Dropdown
        menu={{ items: bulkActionItems }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Button
          size="small"
          icon={<MoreVertical size={16} />}
        >
          Bulk Actions
        </Button>
      </Dropdown>
    </div>
  );
}
