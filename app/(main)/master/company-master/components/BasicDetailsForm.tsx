'use client'
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import Input from "@/components/Input/Input";
import Label from "@/components/Label/Label";
import { Product } from "@/context/store/productStore";
import { rowGutter } from "@/shared/constants/themeConfig";
import { Col, Divider, Row } from "antd";
import TextArea from "antd/es/input/TextArea";
import { FormikErrors, FormikHandlers, FormikHelpers, FormikTouched } from "formik";
import { memo, useState } from "react";
import { Role } from "../../roles-master/components/RoleDataTable";
import { CompanyFormData } from "./AddCompanyDrawer";

interface BasicDetailsFormProps {
  values: CompanyFormData;
  handleChange: FormikHandlers["handleChange"];
  handleBlur: FormikHandlers["handleBlur"];
  setFieldValue: FormikHelpers<CompanyFormData>["setFieldValue"];
  errors: FormikErrors<CompanyFormData>;
  touched: FormikTouched<CompanyFormData>;
  rolesData:Role[],
  productsData:Product[]
}

function BasicDetailsForm({
  values,
  handleBlur,
  setFieldValue,
  handleChange,
  errors,
  touched,
  rolesData=[],
  productsData=[]
}: BasicDetailsFormProps) {
  
  const [roles,setRoles]=useState(rolesData)
  const [products,setProducts]=useState(productsData)

  const PhoneNumberInput = ({
    name,
    label,
    required = false
  }: {
    name: string;
    label: string;
    required?: boolean;
  }) => (
    <Col xs={24} sm={12}>
      <Label text={label} required={required} />
      <div className="flex items-center gap-2">
        <Input
          name={name}
          placeholder="Enter phone number"
          className="flex-1"
          type="number"
          controls={false}
          maxLength={15}
          minLength={10}
        />
      </div>
    </Col>
  );

  return (
    <div className="space-y-6">
      {/* Company Information Section */}
      <div>
        <Row gutter={rowGutter}>
          <Col xs={24} sm={12}>
            <Input
              name="displayName"
              label="Display Name"
              required
            />
          </Col>
          <Col xs={24} sm={12}>
            <Input
              name="legalName"
              label="Legal Name"
              required
            />
          </Col>
          <Col xs={24} sm={12}>
            <Input
              name="shortName"
              label="Short Name"
              required
            />
          </Col>
          <Col xs={24} sm={12}>
            <Input
              name="webUrl"
              label="Website URL"
              type="url"
              placeholder="https://example.com"
            />
          </Col>
          <Col xs={24}>
            <div className="relative">
              <Label text="Address" required={true} />
              <TextArea
                name="address"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.address}
                required
              />
              {errors.address && touched.address && (
                <span className="field-error">
                  {errors.address}
                </span>
              )}
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <Input
              name="email"
              label="Email"
              type="email"
              required
            />
          </Col>
          <PhoneNumberInput
            name="phone1"
            label="Phone 1"
            required
          />
          <PhoneNumberInput
            name="phone2"
            label="Phone 2"
          />
          <PhoneNumberInput
            name="phone3"
            label="Phone 3"
          />
          <Divider size="small">Roles & Products</Divider>
          <Col xs={24} sm={12}>
            <CustomSelect
              name="rolesUUID"
              label="Roles"
              options={roles}
              mode="multiple"
              required
              maxResponsive
              />

          </Col>
          <Col xs={24} sm={12}>
            <CustomSelect
              name="productsUUID"
              label="Products"
              options={products}
              mode="multiple"
              required
              maxResponsive
            />

          </Col>
        </Row>
      </div>
    </div>
  );
}
export default memo(BasicDetailsForm);