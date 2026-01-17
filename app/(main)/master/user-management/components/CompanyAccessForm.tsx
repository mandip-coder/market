"use client";

import Label from "@/components/Label/Label";
import { rowGutter } from "@/shared/constants/themeConfig";
import { Col, Row, Select, Tooltip } from "antd";
import { memo, useEffect, useState } from "react";
import { Company } from "../../company-master/services/company.types";
import { UserFormValues } from "./BasicDetailsForm";
import { Country } from "@/services/dropdowns/dropdowns.types";

interface CountryAccessFormProps {
  values: UserFormValues;
  setFieldValue: (field: string, value: any) => void;
  errors: Record<string, any>;
  companiesData: Partial<Company>[];
  countryOptions: Country[];
  touched: Record<string, boolean>;
}

function CountryAccessForm({
  values,
  setFieldValue,
  errors,
  companiesData,
  countryOptions,
  touched
}: CountryAccessFormProps) {
 

  return (
    <div className="!space-y-3">
      <Row gutter={rowGutter}>
        {/* Countries */}
        <Col xs={24} sm={12}>
          <div className="relative">
            <Label text="Countries" required />

            <Select
              className="w-full"
              mode="multiple"
              allowClear
              showSearch={
                {
                  optionFilterProp: "label",
                }
              }
              maxTagCount="responsive"
              placeholder="Select countries"
              options={countryOptions.map((country) => ({
                label: country.countryName,
                value: country.countryUUID,
              }))}
              value={values.countryAccess || []}
              onChange={(value) => {
                setFieldValue("countryAccess", value);
              }}
              onBlur={() => {
                setFieldValue("countryAccess", values.countryAccess);
              }}
              maxTagPlaceholder={(omitted) => (
                <Tooltip
                  title={omitted.map((item) => String(item.label)).join(", ")}
                >
                  {`+${omitted.length} more`}
                </Tooltip>
              )}
              status={touched.countryAccess && errors.countryAccess ? "error" : undefined}
            />

            {touched.countryAccess && errors.countryAccess && (
              <div className="field-error">
                {errors.countryAccess as string}
              </div>
            )}
          </div>
        </Col>

        {/* Companies */}
        <Col xs={24} sm={12}>
          <div className="relative">
            <Label text="Companies" required />

            <Select
              className="w-full"
              mode="multiple"
              allowClear
              showSearch={{
                optionFilterProp: "label",
              }}
              maxTagCount="responsive"
              placeholder="Select companies"
              options={companiesData.map((company) => ({
                label: company.displayName,
                value: company.companyUUID,
              }))}
              value={values.companyAccess || []}
              onChange={(value) => {
                setFieldValue("companyAccess", value);
              }}
              maxTagPlaceholder={(omitted) => (
                <Tooltip
                  title={omitted.map((item) => String(item.label)).join(", ")}
                >
                  {`+${omitted.length} more`}
                </Tooltip>
              )}
              status={touched.companyAccess && errors.companyAccess ? "error" : undefined}
            />

            {touched.companyAccess && errors.companyAccess && (
              <div className="field-error">
                {errors.companyAccess as string}
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default memo(CountryAccessForm);
