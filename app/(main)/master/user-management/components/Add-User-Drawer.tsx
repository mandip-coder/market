'use client'
import { useUsersStore } from "@/context/store/usersStore";
import { useLoading } from "@/hooks/useLoading";
import { Button, Checkbox, Col, Divider, Drawer, Row } from "antd";
import { Form, Formik, FormikProps } from 'formik';
import { Save } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import * as Yup from 'yup';
import { User } from "../services/user.types";
import BasicDetailsForm from "./BasicDetailsForm";
import CountryAccessForm from "./CompanyAccessForm";
import ProfileImage from "./ProfileImage";
import { useCompanies, useCountries } from "@/services/dropdowns/dropdowns.hooks";
import { useAddUser, useUpdateUser } from "../services/user.hooks";
import { UserFormValues } from "./BasicDetailsForm";


function AddUserDrawer() {
  const [loading, setLoading] = useLoading();
  const formikRef = useRef<FormikProps<UserFormValues>>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const { addUserDrawer, toggleAddUserDrawer, editUser, setEditUser } = useUsersStore()

  // Hooks
  const addUserMutation = useAddUser();
  const updateUserMutation = useUpdateUser();
  const {data:countryOptions=[]} = useCountries()
  const {data:companiesData=[]} = useCompanies()


  const isEditMode = !!editUser;
  const userData = editUser || null;
  useEffect(() => {
    
    if (isEditMode && userData?.profileImageUrl) {
      setProfileImageUrl(userData.profileImageUrl);
    } else if (!isEditMode) {
      setProfileImageUrl(null);
    }
  }, [isEditMode, userData]);

  const handleClose = () => {
    toggleAddUserDrawer();
    formikRef.current?.resetForm();
    setProfileImageUrl(null);
    setEditUser(null);
  };

  const handleSubmit = async (values: UserFormValues): Promise<void> => {
      const { profileImage, ...payload } = values;
      
      if (isEditMode && userData?.userUUID) {
        await updateUserMutation.mutateAsync({
          userUUID: userData.userUUID,
          payload: payload as unknown as User
        },{
          onSuccess: () => {
            handleClose();
            setProfileImageUrl(null);
          },
        });
      } else {
        await addUserMutation.mutateAsync(payload as unknown as User,{
          onSuccess: () => {
            handleClose();
            setProfileImageUrl(null);
          },
        });
      }
  };

  const handleImageChange = useCallback((file: File, url: string) => {
    formikRef.current?.setFieldValue('profileImage', file);
    formikRef.current?.setFieldValue('profileImageUrl', url);
    setProfileImageUrl(url);
  }, []);

  const handleImageRemove = useCallback(() => {
    formikRef.current?.setFieldValue('profileImage', null);
    formikRef.current?.setFieldValue('profileImageUrl', null);
    setProfileImageUrl(null);
  }, []);

  // Clean up the object URL when the component unmounts
  useEffect(() => {
    return () => {
      if (profileImageUrl && !userData?.profileImageUrl) {
        // Only revoke if it's not the original image from userData
        URL.revokeObjectURL(profileImageUrl);
      }
    };
  }, [profileImageUrl, userData]);

  // Set initial values based on mode
  const getInitialValues = (): UserFormValues => {
    if (isEditMode && userData) {
      return {
        ...userData,
        profileImage: null,
        // Map country UUID array from API response to form field
        countryAccess: userData.countryAccessUUID || [],
      };
    }

    return {
      initial: "",
      firstName: "",
      lastName: "",
      officePhone: "",
      email: "",
      loginUsername: "",
      profileImage: null,
      profileImageUrl: null,
      multiFactorLogin: false,
      countryAccess: [],
      companyAccess: [],
      empCode: "",
      phone1: "",
      phone2: "",
      phone3: "",
      phone1HasWhatsapp: false,
      phone2HasWhatsapp: false,
      phone3HasWhatsapp: false


    };
  };
const validationSchema = Yup.object().shape({
    initial: Yup.string().required('Initial is required'),
    firstName: Yup.string().trim().required('First name is required').matches(/^[a-zA-Z ]+$/, 'First name should only contain letters and spaces'),
    lastName: Yup.string().trim().required('Last name is required').matches(/^[a-zA-Z ]+$/, 'Last name should only contain letters and spaces'),
    email: Yup.string().required('Email is required').email('Invalid email address'),
    loginUsername: Yup.string().required('Login username is required'),
    companyAccess: Yup.array().required('Company access is required').min(1, 'At least one company is required'),
    countryAccess: Yup.array().required('Country access is required').min(1, 'At least one country is required'),
    phone1: Yup.string()
    .required('Phone 1 is required')
    .test('unique-phone1', 'Phone numbers must be unique', function(value) {
      const { phone2, phone3 } = this.parent;
      if (phone2 && value === phone2) return false;
      if (phone3 && value === phone3) return false;
            return true;
          }),
          phone2: Yup.string()
          .test('unique-phone2', 'Phone numbers must be unique', function(value) {
            if (!value) return true;
            const { phone1, phone3 } = this.parent;
            if (phone1 && value === phone1) return false;
            if (phone3 && value === phone3) return false;
            return true;
          }).nullable(),
          phone3: Yup.string()
          .test('unique-phone3', 'Phone numbers must be unique', function(value) {
            if (!value) return true;
            const { phone1, phone2 } = this.parent;
            if (phone1 && value === phone1) return false;
            if (phone2 && value === phone2) return false;
            return true;
        }).nullable(),
        officePhone: Yup.string().required('Office phone is required').test('unique-officePhone', 'Phone numbers must be unique', function(value) {
          const { phone1, phone2, phone3 } = this.parent;
          if (phone1 && value === phone1) return false;
          if (phone2 && value === phone2) return false;
          if (phone3 && value === phone3) return false;
          return true;
        }),
      });

      return (
        <Drawer
      size={"large"}
      title={
        <span className="font-semibold text-gray-800 dark:text-white text-lg">
          {isEditMode ? userData?.fullName : 'Create New User'}
        </span>
      }
      onClose={handleClose}
      open={addUserDrawer}
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
            loading={loading || addUserMutation.isPending || updateUserMutation.isPending}
            icon={<Save className="h-4 w-4" />}
          >
            {isEditMode ? 'Update User' : 'Create User'}
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
            {/* Profile Image Section */}
            <ProfileImage
              imageUrl={profileImageUrl}
              onImageChange={handleImageChange}
              onImageRemove={handleImageRemove}
              moduleName="userProfile"
            />

            <Divider size="large">Basic Details</Divider>
            <BasicDetailsForm
              values={values}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              errors={errors}
              touched={touched}
            />

            <Divider size="large">Access Permissions</Divider>
            <CountryAccessForm
              values={values}
              setFieldValue={setFieldValue}
              errors={errors}
              touched={touched}
              companiesData={companiesData}
              countryOptions={countryOptions}
            />

            <Row gutter={[12, 8]} className="!mt-6">
              <Col xs={24}>
                <Checkbox
                  name="multiFactorLogin"
                  checked={values.multiFactorLogin}
                  onChange={(e) => setFieldValue('multiFactorLogin', e.target.checked)}
                  className="mb-1"
                >
                  <span className="font-medium text-sm">Enable Multi-Factor Authentication</span>
                </Checkbox>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                  Add an extra layer of security to your account by requiring a verification code in addition to your password.
                </p>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    </Drawer>
  );
}

export default memo(AddUserDrawer);