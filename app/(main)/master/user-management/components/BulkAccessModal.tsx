import { useLoading } from "@/hooks/useLoading";
import { Button, Card, Col, Form, Row, Select, Tag, Tooltip } from "antd";
import React, { useEffect } from "react";
import { CompanyAccess } from "./UserDataTable";
import { toast } from "react-toastify";
import ModalWrapper from "@/components/Modal/Modal";
import {MinusCircleOutlined, PlusOutlined, ShopOutlined} from "@ant-design/icons";
import { rowGutter } from "@/shared/constants/themeConfig";
export const BulkAccessModal: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onConfirm: (access: CompanyAccess[]) => void;
  selectedUsersCount: number;
  currentAccess: CompanyAccess[];
  companiesData: { id: string; name: string }[];
  rolesData: string[];
  productsData: string[];
}> = React.memo(({
  visible,
  onCancel,
  onConfirm,
  selectedUsersCount,
  currentAccess,
  companiesData,
  rolesData,
  productsData
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useLoading();

    useEffect(() => {
      if (visible) {
        // Initialize with current access or empty array
        const initialValues = currentAccess.length > 0
          ? currentAccess
          : [{ companyId: '', roles: [], products: [] }];

        form.setFieldsValue({ companyAccess: initialValues });
      }
    }, [visible, currentAccess, form]);

    const getAvailableCompanies = (currentCompanyAccess: CompanyAccess[], currentIndex?: number) => {
      const selectedCompanyIds = currentCompanyAccess
        .map((item, index) => index !== currentIndex ? item.company.companyUUID : null)
        .filter(Boolean);

      return companiesData.filter(company => !selectedCompanyIds.includes(company.id));
    };

    const handleOk = async () => {
      try {
        setLoading(true);
        const values = await form.validateFields();
        const invalidEntries = values.companyAccess.filter(
          (entry: CompanyAccess) => !entry.company.companyUUID || !entry.roles || entry.roles.length === 0);

        if (invalidEntries.length > 0) {
          toast.error('Please select a company, at least one role, and at least one product for each entry');
          return;
        }

        onConfirm(values.companyAccess);
        form.resetFields();
      } catch (error) {
        console.error('Validation failed:', error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <ModalWrapper
        title={`Assign Company Access to ${selectedUsersCount} User${selectedUsersCount > 1 ? 's' : ''}`}
        open={visible}
        onCancel={onCancel}
        onOk={handleOk}
        confirmLoading={loading}
        width={800}
        className="company-access-modal"
      >
        <Form form={form} layout="vertical">
          <Form.List name="companyAccess">
            {(fields, { add, remove }) => (
              <div className="!space-y-3">
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    size="small"
                    className="border border-gray-200 dark:border-gray-700 pb-4"
                    title={
                      <div className="flex items-center">
                        <ShopOutlined className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-sm font-medium">
                          {form.getFieldValue(['companyAccess', name, 'companyId'])
                            ? companiesData.find((company) => company.id === form.getFieldValue(['companyAccess', name, 'companyId']))?.name
                            : 'Select Company'}
                        </span>
                      </div>
                    }
                    extra={
                      fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                        />
                      )
                    }
                  >
                    <Row gutter={rowGutter}>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'companyId']}
                          label="Company"
                          rules={[{ required: true, message: 'Please select a company' }]}
                        >
                          <Select
                            placeholder="Select company"
                            options={getAvailableCompanies(form.getFieldValue('companyAccess') || [], name).map(company => ({
                              label: company.name,
                              value: company.id
                            }))}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            onChange={() => {
                              // Reset roles and products when company changes
                              form.setFieldsValue({
                                [`companyAccess[${name}].roles`]: [],
                                [`companyAccess[${name}].products`]: []
                              });
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'roles']}
                          label="Roles"
                          rules={[{ required: true, message: 'Please select at least one role' }]}
                        >
                          <Select
                            mode="multiple"
                            allowClear
                            maxTagCount="responsive"
                            maxTagPlaceholder={(omitted) => {
                              return <Tooltip title={omitted.map((item) => item.label).join(', ')}>{`+${omitted.length} more`}</Tooltip>;
                            }}
                            placeholder="Select roles"
                            disabled={!form.getFieldValue(['companyAccess', name, 'companyId'])}
                            options={rolesData.map(role => ({
                              label: role,
                              value: role
                            }))}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'products']}
                          label="Products"
                          rules={[{ required: true, message: 'Please select at least one product' }]}
                        >
                          <Select
                            mode="multiple"
                            allowClear
                            maxTagCount="responsive"
                            maxTagPlaceholder={(omitted) => {
                              return <Tooltip title={omitted.map((item) => item.label).join(', ')}>{`+${omitted.length} more`}</Tooltip>;
                            }}
                            placeholder="Select products"
                            disabled={!form.getFieldValue(['companyAccess', name, 'companyId'])}
                            options={productsData.map(product => ({
                              label: product,
                              value: product
                            }))}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}

                <div className="flex justify-end">
                  <Button
                    type="primary"
                    onClick={() => add({ companyId: '', roles: [], products: [] })}
                    className="border-blue-300 text-blue-600 hover:border-blue-500 hover:text-blue-700"
                    disabled={fields.length >= companiesData.length}
                    icon={<PlusOutlined />}
                  >
                    Add Company
                  </Button>
                </div>
              </div>
            )}
          </Form.List>

          <div className="mt-4 text-sm text-gray-500">
            <p>Current access of selected users:</p>
            {currentAccess.length > 0 ? (
              currentAccess.map((companyAccess, i) => (
                <div key={i} className="mb-2">
                  <Tag color="blue">
                    {companiesData.find(c => c.id === companyAccess.company.companyUUID)?.name || 'Unknown Company'}
                  </Tag>
                  <div className="ml-2 mt-1">
                    <span className="text-xs">Roles: </span>
                    {companyAccess.roles.map((role, j) => (
                      <Tag key={j} color="green" className="mb-1">{role.roleName}</Tag>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <span className="text-gray-400">No access assigned</span>
            )}
          </div>
        </Form>
      </ModalWrapper>
    );
  });
