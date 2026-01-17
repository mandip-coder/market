'use client'
import Input from "@/components/Input/Input";
import Label from "@/components/Label/Label";
import { rowGutter } from "@/shared/constants/themeConfig";
import { Col, Row } from "antd";
import TextArea from "antd/es/input/TextArea";
import { FormikErrors, FormikHandlers, FormikHelpers, FormikTouched } from "formik";
import { memo } from "react";
import { Role } from "../services/roles.types";
import CustomCheckBox from "@/components/CustomCheckBox/CustomCheckBox";

interface BasicDetailsFormProps {
  values: Role;
  handleChange: FormikHandlers["handleChange"];
  handleBlur: FormikHandlers["handleBlur"];
  setFieldValue: FormikHelpers<Role>["setFieldValue"];
  errors: FormikErrors<Role>;
  touched: FormikTouched<Role>;
}

function BasicDetailsForm({
  values,
  handleBlur,
  setFieldValue,
  handleChange,
  errors,
  touched
}: BasicDetailsFormProps) {

  return (
    <div className="space-y-6">
      <div>
        <Row gutter={rowGutter}>
          <Col xs={24} sm={12}>
            <Input
              name="roleName"
              label="Role Name"
              required
            />
          </Col>
          <Col xs={24} sm={12}>
            <Input
              name="roleCode"
              label="Role Code"
              required
            />
          </Col>

          <Col xs={24}>
            <div className="relative">
              <Label text="Description" required={true} />
              <TextArea
                name="description"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.description}
                required
              />
              {errors.description && touched.description && (
                <span className="field-error">
                  {errors.description}
                </span>
              )}
            </div>
          </Col>
          <Col xs={24}>
            <CustomCheckBox
              name="isSystemRole"
            >
              Is System Role?
            </CustomCheckBox>
          </Col>
        </Row>
      </div>
    </div>
  );
}
export default memo(BasicDetailsForm);