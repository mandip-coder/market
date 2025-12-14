'use client'
import { useRoleStore } from "@/context/store/rolesStore";
import { useApi } from "@/hooks/useAPI";
import { useLoading } from "@/hooks/useLoading";
import { APIPATH } from "@/shared/constants/url";
import { Button, Drawer } from "antd";
import { Form, Formik, FormikProps } from 'formik';
import { Save } from "lucide-react";
import { memo, useRef } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
import BasicDetailsForm from "./BasicDetailsForm";
import { Role } from "./RoleDataTable";



export interface RolesFormData {
  roleUUID: string;
  roleName: string;
  description: string;
  roleCode: string;
  isSystemRole: boolean;
  status: "active" | "inactive"
  createdAt: string;
  updatedAt: string;
}


function AddRoleDrawer() {
  const API = useApi()
  const [loading, setLoading] = useLoading();
  const formikRef = useRef<FormikProps<RolesFormData>>(null);
  const { addRolesDrawer, toggleRolesDrawer, editRole, setTableDataState, setEditRole } = useRoleStore()
  const isEditMode = !!editRole;
  const rolesData = editRole || null;

  const handleClose = () => {
    formikRef.current?.resetForm();
    setEditRole(null);
    toggleRolesDrawer();
  };

  const handleSubmit = async (values: RolesFormData): Promise<void> => {
    setLoading(true);
    try {
      if (isEditMode) {
        const res = await API.put(`${APIPATH.ROLES.UPDATEROLE}${rolesData?.roleUUID}`, values);
        setTableDataState(prevData => prevData.map(r => r.roleUUID === rolesData?.roleUUID ? { ...r, ...res.data as Role } : r));
        toast.success('Role updated successfully!');
      } else {
        const res = await API.post(APIPATH.ROLES.CREATEROLE, values)
        if (res.status) {
          const newRole = { ...res.data as Role, status: (res.data as Role).status || 'active' };
          setTableDataState(prevData => [...prevData, newRole]);
          toast.success('Role created successfully!');
        } else {
          toast.error(res.message);
        }
      }
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getInitialValues = (): RolesFormData => {
    if (isEditMode && rolesData) {
      return {
        ...rolesData,
      };
    }

    return {
      roleUUID: '',
      roleName: '',
      description: '',
      roleCode: '',
      isSystemRole: false,
      status: 'active',
      createdAt: '',
      updatedAt: '',
    }
  }
  const validationSchema = Yup.object().shape({
    roleName: Yup.string().required('Role Name is required'),
    description: Yup.string().required('Description is required'),
    roleCode: Yup.string().required('Role Code is required'),

  });
  return (
    <Drawer
      title={
        <span className="font-semibold text-gray-800 dark:text-white text-lg">
          {isEditMode ? rolesData?.roleName : 'Create New Role'}
        </span>
      }
      size={"large"}
      onClose={handleClose}
      open={addRolesDrawer}
      destroyOnHidden
      className="dark:bg-gray-900"
      footer={
        <div className="flex justify-end space-x-2">
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => formikRef.current?.submitForm()}
            loading={loading}
            icon={<Save className="h-4 w-4" />}
          >
            {isEditMode ? 'Update' : 'Create'}
          </Button>
        </div>
      }
    >
      <Formik
        innerRef={formikRef}
        initialValues={getInitialValues()}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, handleChange, handleBlur, setFieldValue, errors, touched }) => (
          <Form className="space-y-3">
            <BasicDetailsForm
              values={values}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              errors={errors}
              touched={touched}
            />
          </Form>
        )}
      </Formik>
    </Drawer>
  );
}
export default memo(AddRoleDrawer);