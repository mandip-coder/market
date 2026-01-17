'use client'
import { useRoleStore } from "@/context/store/rolesStore";
import { Button, Drawer } from "antd";
import { Form, Formik, FormikProps } from 'formik';
import { Save } from "lucide-react";
import { memo, useRef } from "react";
import * as Yup from 'yup';
import BasicDetailsForm from "./BasicDetailsForm";
import { useCreateRole, useUpdateRole } from "../services/roles.hooks";
import { Role } from "../services/roles.types";


function AddRoleDrawer() {
  const formikRef = useRef<FormikProps<Role>>(null);
  const { addRolesDrawer, toggleRolesDrawer, editRole, setEditRole } = useRoleStore()
  const isEditMode = !!editRole;
  const rolesData = editRole || null;

  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();

  const handleClose = () => {
    formikRef.current?.resetForm();
    setEditRole(null);
    toggleRolesDrawer();
  };

  const handleSubmit = async (values: Role): Promise<void> => {
      if (isEditMode && rolesData?.roleUUID) {
        await updateRoleMutation.mutateAsync({
          roleUUID: rolesData.roleUUID,
          role: values
        },{
          onSuccess: () => {
            handleClose();
          },
        });
      } else {
        const { roleUUID, createdAt, updatedAt, ...roleData } = values;
        await createRoleMutation.mutateAsync(roleData,{
          onSuccess: () => {
            handleClose();
          },
        });
      }
  };

  const getInitialValues = (): Role => {
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
            loading={createRoleMutation.isPending || updateRoleMutation.isPending}
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