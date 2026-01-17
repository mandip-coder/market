import AppScrollbar from "@/components/AppScrollBar";
import Label from "@/components/Label/Label";
import ModalWrapper from "@/components/Modal/Modal";
import { useUsersStore } from "@/context/store/usersStore";
import { useLoading } from "@/hooks/useLoading";
import { useCompanies } from "@/services/dropdowns/dropdowns.hooks";
import { Company } from "@/services/dropdowns/dropdowns.types";
import {
  CloseCircleOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Popover,
  Row,
  Select,
  Skeleton,
  Tag,
  Tooltip,
} from "antd";
import { Trash2 } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { toast } from '@/components/AppToaster/AppToaster';
import { CompanyAccess, User } from "../services/user.types";
import {
  useAddAccess,
  useRemoveAccess,
  useUpdateAccess,
} from "../services/user.hooks";

// Define proper types for the component
interface CompanyForm {
  company: {
    companyUUID: string;
    displayName: string;
  };
  roles: string[];
}

interface CompanyForms {
  [key: string]: CompanyForm;
}

// Define types for company data with roles only

// Memoized Edit Modal component
const EditModal = memo(
  ({
    form,
    companyList,
    currentCompany,
    loading,
    onSave,
    onCancel,
  }: {
    form: any;
    companyList: Company[];
    currentCompany: CompanyAccess;
    loading: boolean;
    onSave: () => void;
    onCancel: () => void;
  }) => {
    // Get the specific company from the list
    const company = useMemo(
      () =>
        companyList.find((c) => c.companyUUID === currentCompany.companyUUID),
      [companyList, currentCompany.companyUUID]
    );

    // Create role options from the company's specific roles
    const roleOptions = useMemo(
      () =>
        company?.roles.map((role) => ({
          label: role.roleName,
          value: role.roleUUID,
        })) || [],
      [company]
    );

    return (
      <Form form={form} layout="vertical" className="w-[400px]">
        <Row gutter={[8, 0]}>
          <Col span={24}>
            <Form.Item
              name="companyId"
              label="Company"
              rules={[{ required: true, message: "Please select a company" }]}
            >
              <Select
                placeholder="Select company"
                value={currentCompany.companyUUID}
                options={companyList.map((company) => ({
                  label: company.displayName,
                  value: company.companyUUID,
                }))}
                disabled={true}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="roles"
              label="Roles"
              rules={[
                { required: true, message: "Please select at least one role" },
              ]}
            >
              <Select
                mode="multiple"
                allowClear
                maxTagCount="responsive"
                maxTagPlaceholder={(omitted) => (
                  <Tooltip
                    title={omitted.map((item) => item.label).join(", ")}
                  >{`+${omitted.length} more`}</Tooltip>
                )}
                placeholder="Select roles"
                options={roleOptions}
              />
            </Form.Item>
          </Col>
          {/* Removed products Form.Item */}
        </Row>

        <div className="flex justify-end gap-2 mt-3 sticky bottom-0">
          <Button size="small" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={onSave}
            loading={loading}
          >
            Save
          </Button>
        </div>
      </Form>
    );
  }
);

EditModal.displayName = "EditModal";

// Memoized Add New Modal component
const AddNewModal = memo(
  ({
    companyList,
    selectedCompanies,
    companyForms,
    loading,
    onCompanySelectionChange,
    onCompanyFormUpdate,
    onRemoveCompany,
    onSave,
    onCancel,
    existingCompanyUUIDs,
  }: {
    companyList: Company[];
    selectedCompanies: string[];
    companyForms: CompanyForms;
    loading: boolean;
    onCompanySelectionChange: (companyIds: string[]) => void;
    onCompanyFormUpdate: (companyId: string, field: string, value: any) => void;
    onRemoveCompany: (companyId: string) => void;
    onSave: () => void;
    onCancel: () => void;
    existingCompanyUUIDs: string[];
  }) => {
    const companyOptions = useMemo(
      () =>
        companyList
          .filter(
            (company) => !existingCompanyUUIDs.includes(company.companyUUID)
          )
          .map((company) => ({
            label: company.displayName,
            value: company.companyUUID,
          })),
      [companyList, existingCompanyUUIDs]
    );

    return (
      <div>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select Companies</label>
          <Select
            mode="multiple"
            placeholder="Select companies to add access for"
            className="w-full"
            onChange={onCompanySelectionChange}
            options={companyOptions}
            maxCount={5}
            allowClear
            value={selectedCompanies}
            maxTagCount="responsive"
            maxTagPlaceholder={(omitted) => {
              const labels = omitted.map((item) => {
                const option = companyOptions.find(
                  (opt) => opt.value === item.value
                );
                return option?.label || item.value;
              });
              return (
                <Tooltip
                  title={labels.join(", ")}
                >{`+${omitted.length} more`}</Tooltip>
              );
            }}
            showSearch={{
              optionFilterProp: "label",
            }}
          />
          <div className="text-xs text-gray-500 mt-1">
            {selectedCompanies.length} companies selected
          </div>
        </div>

        {selectedCompanies.length > 0 && (
          <>
            <Divider>Configure Access for Selected Companies</Divider>
            <AppScrollbar className="max-h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-4">
                {selectedCompanies.map((companyId) => {
                  const company = companyList.find(
                    (c) => c.companyUUID === companyId
                  );

                  // Create role options from the company's specific roles
                  const roleOptions =
                    company?.roles.map((role) => ({
                      label: role.roleName,
                      value: role.roleUUID,
                    })) || [];

                  // Removed productOptions

                  return (
                    <div key={companyId} className="w-full">
                      <Card
                        size="small"
                        title={company?.displayName || "Unknown Company"}
                        extra={
                          <Tooltip title="Remove from list">
                            <Button
                              size="small"
                              type="text"
                              danger
                              onClick={() => onRemoveCompany(companyId)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </Tooltip>
                        }
                      >
                        <div className="flex flex-col gap-4">
                          <div className="w-full">
                            <Label text="Roles" required />
                            <Select
                              mode="multiple"
                              allowClear
                              maxTagCount="responsive"
                              maxTagPlaceholder={(omitted) => (
                                <Tooltip
                                  title={omitted.map((i) => i.label).join(", ")}
                                >
                                  {`+${omitted.length} more`}
                                </Tooltip>
                              )}
                              placeholder="Select roles"
                              className="w-full"
                              value={companyForms[companyId]?.roles || []}
                              onChange={(value) =>
                                onCompanyFormUpdate(companyId, "roles", value)
                              }
                              options={roleOptions}
                            />
                          </div>
                          {/* Removed products Select component */}
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </AppScrollbar>
          </>
        )}

        <div className="flex justify-end gap-2 mt-3">
          <Button size="small" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={onSave}
            loading={loading}
            disabled={selectedCompanies.length === 0}
          >
            {selectedCompanies.length > 1
              ? ` Save All(${selectedCompanies.length})`
              : "Save"}
          </Button>
        </div>
      </div>
    );
  }
);

AddNewModal.displayName = "AddNewModal";

// Memoized User Title component
const UserTitle = memo(({ user }: { user: User }) => (
  <div className="flex items-center gap-3">
    <Avatar size="small" icon={<UserOutlined />} />
    <div>
      <div className="font-semibold">{user.loginUsername}</div>
      <div className="text-xs text-gray-500">{user.email}</div>
    </div>
  </div>
));

UserTitle.displayName = "UserTitle";

// Main component
export const EditableAccessCell = memo(
  ({ access, user,companyList }: { access: CompanyAccess[]; user: User,companyList:Company[] }) => {
    const userUUID = user.userUUID;

    const [form] = Form.useForm();
    const [visible, setVisible] = useState(false);
    const [editingCompanyId, setEditingCompanyId] = useState<string | null>(
      null
    );
    const [addNewVisible, setAddNewVisible] = useState(false);
    const [removeModalVisible, setRemoveModalVisible] = useState(false);
    const [companyToRemove, setCompanyToRemove] = useState<string | null>(null);
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
    const [companyForms, setCompanyForms] = useState<CompanyForms>({});
    const { mutateAsync: updateAccessAsync, isPending: updateLoading } =
      useUpdateAccess();
    const { mutateAsync: addAccessAsync, isPending: addLoading } = useAddAccess();
    const { mutateAsync: removeAccessAsync, isPending: removeLoading } =
      useRemoveAccess();



    const handleEditCompany = useCallback(
      (companyId: string) => {
        setEditingCompanyId(companyId);
        setVisible(true);

        const companyAccess = access.find(
          (item) => item.companyUUID === companyId
        );
        if (companyAccess) {
          const formValues = {
            companyId: companyAccess.companyUUID,
            roles: companyAccess.roles.map((r) => r.roleUUID),
          };
          form.setFieldsValue(formValues);
        }
      },
      [access, form]
    );

    const handleAddNewCompany = useCallback(() => {
      setAddNewVisible(true);
      setSelectedCompanies([]);
      setCompanyForms({});
    }, []);

    const handleRemoveCompany = useCallback((companyId: string) => {
      setCompanyToRemove(companyId);
      setRemoveModalVisible(true);
    }, []);

    const confirmRemoveCompany = useCallback(async () => {
      if (!companyToRemove) return;
      await removeAccessAsync(
        { userUUID, companyUUID: companyToRemove },
        {
          onSuccess: () => {
            const updatedAccess = access.filter(
              (item) => item.companyUUID !== companyToRemove
            );
            setRemoveModalVisible(false);
            setCompanyToRemove(null);
          },
        }
      );
    }, [companyToRemove, access,    , userUUID, removeAccessAsync]);

    const handleSave = useCallback(async () => {
      const values = await form.validateFields();

      if (!values.companyId || !values.roles || values.roles.length === 0) {
        toast.error("Please select at least one role");
        return;
      }

      const company = companyList?.find(
        (c) => c.companyUUID === values.companyId
      );

      const { roles } = values;

      await updateAccessAsync({
        userUUID,
        companyUUID: values.companyId,
        roles,
      });

      const updatedCompanyAccess = {
        companyUUID: values.companyId,
        displayName: company?.displayName || "",
        roles,
      };

      const updatedAccess = access.map((item) =>
        item.companyUUID === editingCompanyId ? updatedCompanyAccess : item
      );

      setVisible(false);
      setEditingCompanyId(null);
      // Toast handled in hook
    }, [
      form,
      companyList,
      access,
      editingCompanyId,
      userUUID,
      updateAccessAsync,
    ]);

    const handleCompanySelectionChange = useCallback(
      (companyIds: string[]) => {
        const newCompanyForms: CompanyForms = { ...companyForms };

        companyIds.forEach((companyId) => {
          if (!newCompanyForms[companyId]) {
            const company = companyList?.find(
              (c) => c.companyUUID === companyId
            );
            newCompanyForms[companyId] = {
              company: {
                companyUUID: companyId,
                displayName: company?.displayName || "",
              },
              roles: [],
            };
          }
        });

        Object.keys(newCompanyForms).forEach((companyId) => {
          if (!companyIds.includes(companyId)) {
            delete newCompanyForms[companyId];
          }
        });

        setSelectedCompanies(companyIds);
        setCompanyForms(newCompanyForms);
      },
      [companyForms, companyList]
    );

    const updateCompanyForm = useCallback(
      (companyId: string, field: string, value: any) => {
        setCompanyForms((prev) => {
          const newForms = { ...prev };
          if (!newForms[companyId]) {
            const company = companyList?.find(
              (c) => c.companyUUID === companyId
            );
            newForms[companyId] = {
              company: {
                companyUUID: companyId,
                displayName: company?.displayName || "",
              },
              roles: [],
            };
          }

          if (field === "company") {
            newForms[companyId] = {
              ...newForms[companyId],
              company: { ...newForms[companyId].company, ...value },
            };
          } else {
            newForms[companyId] = { ...newForms[companyId], [field]: value };
          }
          return newForms;
        });
      },
      [companyList]
    );

    const handleAddNewSave = useCallback(async () => {
      

      // Validate all companies have roles selected
      for (const companyId of selectedCompanies) {
        if (!companyForms[companyId]) {
          toast.error(`Form data is missing for a selected company.`);
          return;
        }
        const formData = companyForms[companyId];
        const company = companyList?.find((c) => c.companyUUID === companyId);

        if (!formData.roles || formData.roles.length === 0) {
          toast.error(
            `Please select at least one role for ${
              company?.displayName || "Unknown Company"
            }`
          );
          return;
        }
      }

      // Build the new payload format
      const companies = selectedCompanies.map((companyId) => ({
        companyUUID: companyId,
        roles: companyForms[companyId].roles, // Already string[] of role UUIDs
      }));

      // Build validCompanies for UI update with full role objects
      const validCompanies: CompanyAccess[] = selectedCompanies.map(
        (companyId) => {
          const formData = companyForms[companyId];
          const company = companyList?.find((c) => c.companyUUID === companyId);

          const rolesPayload = formData.roles.map((roleId: string) => {
            const role = company?.roles.find((r) => r.roleUUID === roleId);
            return {
              roleUUID: roleId,
              roleName: role?.roleName || "",
              description: role?.description || "",
              roleCode: role?.roleCode || "",
              isSystemRole: role?.isSystemRole || false,
              status: role?.status || "active",
            };
          });

          return {
            companyUUID: formData.company.companyUUID,
            displayName: formData.company.displayName,
            roles: rolesPayload as any,
          };
        }
      );

      // Single API call with new format
      await addAccessAsync(
        {
          userUUID,
          companies,
        },
        {
          onSuccess: () => {
            const updatedAccess = [...access, ...validCompanies];
            setVisible(false);
            setEditingCompanyId(null);
            setAddNewVisible(false);
            setSelectedCompanies([]);
            setCompanyForms({});
          },
        }
      );
    }, [
      selectedCompanies,
      companyForms,
      companyList,
      access,
      userUUID,
      addAccessAsync,
    ]);

    const handleCancel = useCallback(() => {
      setVisible(false);
      setEditingCompanyId(null);
    }, []);
    const handleAddNewCancel = useCallback(() => {
      setAddNewVisible(false);
      setSelectedCompanies([]);
      setCompanyForms({});
    }, []);
    const handleRemoveCancel = useCallback(() => {
      setRemoveModalVisible(false);
      setCompanyToRemove(null);
    }, []);
    const handleRemoveCompanyFromList = useCallback((companyId: string) => {
      setSelectedCompanies((prev) => prev.filter((id) => id !== companyId));
    }, []);

    // Get the current company access for editing
    const currentCompanyAccess = useMemo(
      () => access.find((item) => item.companyUUID === editingCompanyId),
      [access, editingCompanyId]
    );

    const editModalContent = useMemo(() => {
      if (!currentCompanyAccess) return null;

      return (
        <EditModal
          form={form}
          companyList={companyList || []}
          currentCompany={currentCompanyAccess}
          loading={updateLoading}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      );
    }, [
      form,
      companyList,
      currentCompanyAccess,
      handleSave,
      handleCancel,
    ]);

    const addNewModalContent = useMemo(
      () => (
        <AddNewModal
          companyList={companyList || []}
          selectedCompanies={selectedCompanies}
          companyForms={companyForms}
          loading={addLoading}
          onCompanySelectionChange={handleCompanySelectionChange}
          onCompanyFormUpdate={updateCompanyForm}
          onRemoveCompany={handleRemoveCompanyFromList}
          onSave={handleAddNewSave}
          onCancel={handleAddNewCancel}
          existingCompanyUUIDs={access.map((a) => a.companyUUID)}
        />
      ),
      [
        companyList,
        selectedCompanies,
        companyForms,
        addLoading,
        handleCompanySelectionChange,
        updateCompanyForm,
        handleRemoveCompanyFromList,
        handleAddNewSave,
        handleAddNewCancel,
        access,
      ]
    );

    const userTitle = useMemo(() => <UserTitle user={user} />, [user]);

    const removeModalContent = useMemo(() => {
      const companyToRemoveName = companyToRemove
        ? companyList?.find((c) => c.companyUUID === companyToRemove)
            ?.displayName || "Unknown Company"
        : "";
      return (
        <>
          <p>
            Are you sure you want to remove access for{" "}
            <strong>{companyToRemoveName}</strong>?
          </p>
          <p>This action cannot be undone.</p>
        </>
      );
    }, [companyToRemove, companyList]);

    const renderedTags = useMemo(() => {
      if (!companyList) return null;

      return access.map((companyAccess) => {
        const company = companyList.find(
          (c) => c.companyUUID === companyAccess.companyUUID
        );
        const companyId = companyAccess.companyUUID;
        return (
          <Tooltip
            key={companyId}
            title={
              <div>
                <div className="font-semibold">
                  {company?.displayName || "Unknown Company"}
                </div>
                <div>
                  Roles: {companyAccess.roles.map((r) => r.roleName).join(", ")}
                </div>
              </div>
            }
          >
            <Popover
              content={editModalContent}
              title={userTitle}
              trigger="click"
              open={visible && editingCompanyId === companyId}
              onOpenChange={(open) => {
                if (!open) {
                  handleCancel();
                }
              }}
              placement="bottomLeft"
            >
              <Tag
                className="!m-0 cursor-pointer flex items-center gap-1"
                variant={"filled"}
                color="purple"
                onClick={() => handleEditCompany(companyId)}
              >
                {company?.displayName || "Unknown Company"}
                <CloseCircleOutlined
                  className="ml-1 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCompany(companyId);
                  }}
                />
              </Tag>
            </Popover>
          </Tooltip>
        );
      });
    }, [
      companyList,
      access,
      editModalContent,
      userTitle,
      visible,
      editingCompanyId,
      handleEditCompany,
      handleRemoveCompany,
      handleCancel,
    ]);

    const addMoreTag = useMemo(() => {
      if (!companyList || access.length >= companyList.length) return null;
      return (
        <Tooltip title="Add new company access">
          <Tag
            className="!m-0 cursor-pointer"
            variant={"filled"}
            color="blue"
            onClick={handleAddNewCompany}
          >
            <PlusOutlined /> Add More
          </Tag>
        </Tooltip>
      );
    }, [companyList, access.length, handleAddNewCompany]);

    const noAccessMessage = useMemo(() => {
      if (access.length === 0)
        return <span className="text-gray-400">No access assigned</span>;
      return null;
    }, [access.length]);


    return (
      <>
        <div className="flex gap-1 flex-wrap">
          {renderedTags}
          {noAccessMessage}
          {addMoreTag}
        </div>

        {/* Modal for adding new company access */}
        <ModalWrapper
          title={userTitle}
          open={addNewVisible}
          onCancel={handleAddNewCancel}
          footer={null}
          width={800}
          maskClosable={false}
        >
          {addNewModalContent}
        </ModalWrapper>

        {/* Confirmation modal for removing company access */}
        <ModalWrapper
          title="Confirm Removal"
          open={removeModalVisible}
          onCancel={handleRemoveCancel}
          footer={[
            <Button key="cancel" onClick={handleRemoveCancel}>
              Cancel
            </Button>,
            <Button
              key="remove"
              type="primary"
              danger
              onClick={confirmRemoveCompany}
              loading={removeLoading}
            >
              Remove
            </Button>,
          ]}
        >
          {removeModalContent}
        </ModalWrapper>
      </>
    );
  }
);

EditableAccessCell.displayName = "EditableAccessCell";
