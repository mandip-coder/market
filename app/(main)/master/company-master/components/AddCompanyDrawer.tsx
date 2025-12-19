"use client";
import { useCompanyModalStore } from "@/context/store/optimizedSelectors";
import { useApi } from "@/hooks/useAPI";
import { useLoading } from "@/hooks/useLoading";
import { APIPATH } from "@/shared/constants/url";
import { Button, Divider, Drawer } from "antd";
import { Form, Formik, FormikProps } from "formik";
import { Save } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import ProfileImage from "../../user-management/components/ProfileImage";
import BasicDetailsForm from "./BasicDetailsForm";
import { Company } from "./CompanyDataTable";

export interface CompanyFormData extends Omit<Company, "roles" | "products"> {
  rolesUUID: string[];
  productsUUID: string[]
}

function AddCompanyDrawer() {
  const API = useApi();
  const [loading, setLoading] = useLoading();
  const formikRef = useRef<FormikProps<CompanyFormData>>(null);
  const [logoUrl, setProfileImageUrl] = useState<string | null>(null);
  const {
    addCompanyDrawer,
    toggleCompanyDrawer,
    editCompany,
    setTableDataState,
    setEditCompany,
    rolesData,
    productsData,
    setRolesData,
    setProductsData
  } = useCompanyModalStore();
  const isEditMode = !!editCompany;
  const companyData = editCompany || null;

  const fetchRoles = async () => {
    try {
      const response = await API.get(APIPATH.ROLES.GETROLES);
      const roleMAPPER = response.data.map((role: any) => ({ label: role.roleName, value: role.roleUUID }));
      setRolesData(roleMAPPER);
    } catch (error: any) {
      setRolesData([])
    }
  }
  const fetchProducts = async () => {
    try {
      const response = await API.get(APIPATH.PRODUCTS.GETPRODUCTS);
      const productMAPPER = response.data.map((product: any) => ({ label: product.productName, value: product.productUUID }));
      setProductsData(productMAPPER);
    } catch (error: any) {
      setProductsData([])
    }
  }
  useEffect(()=>{
    fetchRoles();
    fetchProducts();
  },[])

  useEffect(() => {
    if (isEditMode && companyData?.logoUrl) {
      setProfileImageUrl(companyData.logoUrl);
    } else if (!isEditMode) {
      setProfileImageUrl(null);
    }
  }, [isEditMode, companyData]);
  const handleClose = () => {
    formikRef.current?.resetForm();
    setProfileImageUrl(null);
    setEditCompany(null);
    toggleCompanyDrawer();
  };

  const handleSubmit = async (values: CompanyFormData): Promise<void> => {
    setLoading(true);

    try {
      if (isEditMode) {
        const res = await API.put(
          `${APIPATH.COMPANY.UPDATECOMPANY}${companyData?.companyUUID}`,
          values
        );
        if (res.status) {
          setTableDataState((prevData) =>
            prevData.map((c) =>
              c.companyUUID === companyData?.companyUUID
                ? { ...c, ...(res.data as Company) }
                : c
            )
          );
          toast.success("Company updated successfully!");
        } else {
          toast.error(res.message);
        }
      } else {
        const res = await API.post(APIPATH.COMPANY.CREATECOMPANY, values);
        if (res.status) {
          setTableDataState((prevData) => [...prevData, res.data as Company]);
          toast.success("Company created successfully!");
        } else {
          toast.error(res.message);
        }
      }

      handleClose();
      setProfileImageUrl(null);
    } catch (error: any) {
      toast.error(
        error.message || "Failed to create company. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = useCallback((file: File, url: string) => {
    formikRef.current?.setFieldValue("logo", file);
    formikRef.current?.setFieldValue("logoUrl", url);
    setProfileImageUrl(url);
  }, []);

  const handleImageRemove = useCallback(() => {
    formikRef.current?.setFieldValue("logo", null);
    formikRef.current?.setFieldValue("logoUrl", null);
    setProfileImageUrl(null);
  }, []);

  // Clean up the object URL when the component unmounts
  useEffect(() => {
    return () => {
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl);
      }
    };
  }, [logoUrl]);

  const getInitialValues = (): CompanyFormData => {
    if (isEditMode && companyData) {
      return {
        ...companyData,
      };
    }

    return {
      companyUUID: "",
      displayName: "",
      legalName: "",
      shortName: "",
      address: "",
      webUrl: "",
      email: "",
      phone1: "",
      phone2: null,
      phone3: null,
      status: "active",
      createdAt: "",
      updatedAt: "",
      logoUrl: null,
      rolesUUID: [],
      productsUUID: [],
    };
  };
  const validationSchema = Yup.object().shape({
    displayName: Yup.string().required("Display name is required"),
    legalName: Yup.string().required("Legal name is required"),
    shortName: Yup.string().required("Short name is required"),
    address: Yup.string().required("Address is required"),
    phone1: Yup.string()
      .required("Phone number is required")
      .max(15, "Phone number must be at most 15 characters")
      .min(10, "Phone number must be at least 10 characters"),
    phone2: Yup.string()
      .max(15, "Phone number must be at most 15 characters")
      .min(10, "Phone number must be at least 10 characters")
      .nullable(),
    phone3: Yup.string()
      .max(15, "Phone number must be at most 15 characters")
      .min(10, "Phone number must be at least 10 characters")
      .nullable(),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    webUrl: Yup.string().url("Invalid URL"),
    rolesUUID: Yup.array().min(1, "At least one role is required"),
    productsUUID: Yup.array().min(1, "At least one product is required"),
  });
  return (
    <Drawer
      title={
        <span className="font-semibold text-gray-800 dark:text-white text-lg">
          {isEditMode ? companyData?.displayName : "Create New Company"}
        </span>
      }
      onClose={handleClose}
      open={addCompanyDrawer}
      destroyOnHidden
      size={"large"}
      className="dark:bg-gray-900"
      footer={
        <div className="flex justify-end space-x-2">
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="primary"
            onClick={() => formikRef.current?.submitForm()}
            loading={loading}
            icon={<Save className="h-4 w-4" />}
          >
            {isEditMode ? "Update" : "Create"}
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
        {({
          values,
          handleChange,
          handleBlur,
          setFieldValue,
          errors,
          touched,
        }) => (
          <Form className="space-y-3">
            {/* Profile Image Section */}
            <ProfileImage
              imageUrl={logoUrl}
              onImageChange={handleImageChange}
              onImageRemove={handleImageRemove}
              title="Company Logo"
            />

            <Divider size="large">Basic Details</Divider>
            <BasicDetailsForm
              values={values}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              errors={errors}
              touched={touched}
              rolesData={rolesData}
              productsData={productsData}
            />
          </Form>
        )}
      </Formik>
    </Drawer>
  );
}
export default memo(AddCompanyDrawer);
