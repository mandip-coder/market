import React, { memo, useMemo } from 'react';
import { Row, Col } from 'antd';
import CustomSelect from '@/components/CustomSelect/CustomSelect';
import Label from '@/components/Label/Label';
import { useUsers } from '@/services/dropdowns/dropdowns.hooks';

const CcBccSection: React.FC<{ setFieldValue: (field: string, value: any) => void }> = ({ setFieldValue }) => {

    const { data: users, isLoading: isLoadingUsers } = useUsers();

    const userOptions = useMemo(() => {
        return (users || []).map((user: any) => ({
            label: user.fullName,
            value: user.userUUID,
        }));
    }, [users]);

    const handleCcChange = (value: string[]) => {
        setFieldValue('cc', value);
    };

    const handleBccChange = (value: string[]) => {
        setFieldValue('bcc', value);
    };

    return (
        <div className="space-y-4">
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Label text="CC (Carbon Copy)" />
                    <CustomSelect
                        name="cc"
                        mode="multiple"
                        placeholder="Add CC emails..."
                        options={userOptions}
                        allowClear
                        maxResponsive
                        loading={isLoadingUsers}
                        onChange={handleCcChange}
                    />
                </Col>
                <Col xs={24} md={12}>
                    <Label text="BCC (Blind Carbon Copy)" />
                    <CustomSelect
                        name="bcc"
                        mode="multiple"
                        placeholder="Add BCC emails..."
                        options={userOptions}
                        allowClear
                        maxResponsive
                        loading={isLoadingUsers}
                        onChange={handleBccChange}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default memo(CcBccSection);
