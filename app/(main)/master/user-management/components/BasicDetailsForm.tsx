'use client'
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import Input from "@/components/Input/Input";
import Label from "@/components/Label/Label";
import { rowGutter } from "@/shared/constants/themeConfig";
import { QuestionCircleOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { Checkbox, Col, Row, Tooltip } from "antd";
import { FormikErrors, FormikHandlers, FormikHelpers, FormikTouched } from "formik";
import { memo } from "react";
import { UserFormValues } from "./Add-User-Drawer";

interface BasicDetailsFormProps {
  values: UserFormValues;
  handleChange: FormikHandlers["handleChange"];
  handleBlur: FormikHandlers["handleBlur"];
  setFieldValue: FormikHelpers<UserFormValues>["setFieldValue"];
  errors: FormikErrors<UserFormValues>;
  touched: FormikTouched<UserFormValues>;
}

function BasicDetailsForm({
  values,
  setFieldValue,
}: BasicDetailsFormProps) {
  // Phone number input component to reduce code duplication
  const PhoneNumberInput = ({
    name,
    label,
    required = false,
    whatsappFieldName
  }: {
    name: string;
    label: string;
    required?: boolean;
    whatsappFieldName: string;
  }) => (
    <Col xs={24} sm={12}>
      <Label text={label} required={required} />
      <div className="flex items-center gap-2">
        <Input
          name={name}
          placeholder="Enter phone number"
          className="flex-1"
          controls={false}
        />{
          values[name as keyof UserFormValues] && <>
            <WhatsAppOutlined />
            <Tooltip title="Check if this number has WhatsApp" placement="top" destroyOnHidden>
              <Checkbox

                name={whatsappFieldName}
                checked={values[whatsappFieldName as keyof UserFormValues] as boolean}
                onChange={(e) => setFieldValue(whatsappFieldName, e.target.checked)}
              />
            </Tooltip>
          </>
        }
      </div>
    </Col>
  );

  return (
    <div className="space-y-6">
      {/* Personal Information Section */}
      <div>
        <Row gutter={rowGutter}>
          <Col sm={4}>
            <CustomSelect
              name="initial"
              label="Initial"
              required
              placeholder="Mr"
              options={["Mr", "Mrs", "Miss", "Ms", "Dr", "Prof"].map((initial) => ({
                label: initial,
                value: initial
              }))}
            />
          </Col>
          <Col sm={10}>
            <Input
              name="firstName"
              label="First Name"
              required
            />
          </Col>
          <Col sm={10}>
            <Input
              name="lastName"
              label="Last Name"
              required
            />
          </Col>
          <Col xs={24} sm={12}>
            <Input
              name="empCode"
              label="Employee Code"
              required
            />
          </Col>
          <Col xs={24} sm={12}>
            <Input
              name="email"
              label="Email"
              required
              type="email"
            />
          </Col>
        </Row>
      </div>
      <Row gutter={rowGutter}>
        <PhoneNumberInput
          name="phone1"
          label="Phone 1"
          required
          whatsappFieldName="phone1HasWhatsapp"
        />
        <PhoneNumberInput
          name="phone2"
          label="Phone 2"
          whatsappFieldName="phone2HasWhatsapp"
        />
        <PhoneNumberInput
          name="phone3"
          label="Phone 3"
          whatsappFieldName="phone3HasWhatsapp"
        />

        <Col xs={24} sm={12}>
          <Input
            name="officePhone"
            label="Office Phone"
          />
        </Col>
      </Row>
      {/* Account Information Section */}
      <div>
        <Row gutter={rowGutter}>
          <Col xs={24} sm={12}>
            <Input
              label="Username"
              name="loginUsername"
              required
              prefix="@"
              suffix={
                <Tooltip title="Username should be unique" placement="top" destroyOnHidden>
                  <QuestionCircleOutlined />
                </Tooltip>
              }
            />
          </Col>
        </Row>
      </div>
    </div>
  );
}
export default memo(BasicDetailsForm);