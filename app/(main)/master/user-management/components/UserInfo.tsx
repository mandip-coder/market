import { Avatar, Typography, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import React from "react";

export const UserInfo = React.memo((({initial, fullName, userName, avatar, empCode, profileImage }: { initial?: string; fullName?: string; userName?: string; avatar?: string, empCode?: string, profileImage: string|null }) => {
  return (
    <div className="!flex !items-start gap-3 p-2">
      {/* Avatar Section */}
      <Avatar
        size={38}
        src={profileImage}
        icon={<UserOutlined />}
        className="shrink-0"
      />

      {/* Name + Username */}
      <Space orientation="vertical" size={0}>
        <Typography.Text strong>
         {initial}.{fullName || 'John Doe'} {`(${empCode || "EMP0115"})`}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          {userName && "@"}{userName || "-"}
        </Typography.Text>
      </Space>
    </div>
  );
}));


