"use client";

import Label from "@/components/Label/Label";
import { rowGutter } from "@/shared/constants/themeConfig";
import { Col, Row, Select, Tooltip } from "antd";
import { memo, useEffect, useState } from "react";
import { CountryOption, UserFormValues } from "./Add-User-Drawer";
import { Company } from "../../company-master/components/CompanyDataTable";

interface CountryAccessFormProps {
  values: UserFormValues;
  setFieldValue: (field: string, value: any) => void;
  errors: Record<string, any>;
  companiesData: Partial<Company>[];
  countryOptions: CountryOption[];
}

function CountryAccessForm({
  values,
  setFieldValue,
  errors,
  companiesData,
  countryOptions
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
              options={countryOptions}
              value={values.countryAccess || []}
              onChange={(value) => {
                setFieldValue("countryAccess", value);
              }}
              maxTagPlaceholder={(omitted) => (
                <Tooltip
                  title={omitted.map((item) => String(item.label)).join(", ")}
                >
                  {`+${omitted.length} more`}
                </Tooltip>
              )}
              status={errors.countryAccess ? "error" : undefined}
            />

            {errors.countryAccess && (
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
              options={companiesData}
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
              status={errors.companyAccess ? "error" : undefined}
            />

            {errors.companyAccess && (
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
