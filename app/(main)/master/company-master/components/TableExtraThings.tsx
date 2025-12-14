import { Badge, Button, Dropdown, MenuProps, Space, Tag } from "antd";
import React from "react";
import {DeleteOutlined, DownOutlined, FileExcelOutlined, LockOutlined} from "@ant-design/icons";
import { AnimatePresence,motion } from "motion/react";
export const ExtraThings = React.memo(({
  selectedUsers,
  onBulkAction,
}: {
  selectedUsers: React.Key[];
  onBulkAction: (action: string) => void;
}) => {
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    onBulkAction(key);
  };

  const bulkMenuItems: MenuProps['items'] = [
 
    {
      key: "export",
      label: "Export",
      icon: <FileExcelOutlined />
    },
   
    {
      key: "delete",
      label: "Delete",
      icon: <DeleteOutlined />,
      danger: true
    }
  ];

  return (
    <Space size="large">
      <AnimatePresence mode="wait">
        {selectedUsers?.length > 0 && (
          <motion.div
            key="selection-panel"
            layout
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex gap-2 items-center"
          >
            <motion.div layout>
              <Tag variant="filled" color="default" className="!flex !items-center gap-1">
                <Badge
                  style={{
                    background: "transparent",
                    boxShadow: "none",
                    color: "inherit",
                    padding: "0px",
                    margin: "0px",
                  }}
                  size="small"
                  count={selectedUsers.length}
                /> {""}Selected
              </Tag>
            </motion.div>

            {selectedUsers.length > 0 && (
              <Dropdown
                menu={{
                  items: bulkMenuItems,
                  onClick: handleMenuClick,
                }}
                placement="bottomLeft"
                trigger={["click"]}
              >
                <Button>
                  <Space>
                    Bulk Options
                    <DownOutlined />
                  </Space>
                </Button>
              </Dropdown>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Space>
  );
});
