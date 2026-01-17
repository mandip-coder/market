"use client";
import { toast } from "@/components/AppToaster/AppToaster";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import Input from "@/components/Input/Input";
import Label from "@/components/Label/Label";
import {
  useCountry,
  useCountryStates,
  useHcoServices,
  useHCOTypes,
  useRegions,
  useStatesCities
} from "@/services/dropdowns/dropdowns.hooks";
import { rowGutter } from "@/shared/constants/themeConfig";
import { Button, Col, Drawer, Row } from "antd";
import TextArea from "antd/es/input/TextArea";

import { useHealthCareStore } from "@/context/store/healthCareStore";
import { Form, Formik, FormikProps } from "formik";
import { Building, Flag, Globe, Hash, Layers, Mail, MapPin, MapPinned, Phone, Save } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import * as Yup from "yup";
import { useCreateHealthcare } from "./services/healthcares.hooks";
import { CreateHealthcareData } from "./services/types";

const validationSchema = Yup.object().shape({
  hcoName: Yup.string().required("Healthcare name is required"),
  hcoTypeUUID: Yup.string().required("Healthcare type is required"),
  address: Yup.string().required("Address is required"),
  countryUUID: Yup.string().required("Country is required"),
  stateUUID: Yup.string().required("State/Province is required"),
  cityUUID: Yup.string().required("City is required"),
  phone1: Yup.string()
    .required("Primary phone is required")
    .matches(/^\d{7,20}$/, "Invalid phone number"),
  phone2: Yup.string().matches(/^\d{7,20}$/, "Invalid phone number"),
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email address"),
  regionUUID: Yup.string().required("Region is required"),
  services: Yup.array().of(Yup.string()).required("Services are required").min(1, "At least one service is required"),
  healthcareCode: Yup.string(),
  icbCode: Yup.string(),
  website: Yup.string().url("Invalid URL"),
});
export default function AddhealthcareDrawer() {
  const { addHealthCareModal, setHealthCareModal } = useHealthCareStore();
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [noStatesAvailable, setNoStatesAvailable] = useState(false);
  const [noCitiesAvailable, setNoCitiesAvailable] = useState(false);
  const { data: healthcareTypes = [] } = useHCOTypes({
    enabled: addHealthCareModal,
  });
  const { data: countryList = [] } = useCountry({
    enabled: addHealthCareModal,
  });
  const { data: states = [], isLoading: statesLoading } =
    useCountryStates(selectedCountry);
  const { data: cities = [], isLoading: citiesLoading } =
    useStatesCities(selectedState);
  const { data: regions = [] } = useRegions({
    enabled: addHealthCareModal,
  });
  const { data: hcoServices = [] } = useHcoServices({
    enabled: addHealthCareModal,
  });
  const createHealthcareMutation = useCreateHealthcare();

  const handleSubmit = useCallback(
    async (values: CreateHealthcareData, { resetForm }: any) => {
      await createHealthcareMutation.mutateAsync(values, {
        onSuccess: () => {
          resetForm();
          setHealthCareModal(false);
        },
      });
    },
    [createHealthcareMutation]
  );

  const handleCountryChange = useCallback(
    (value: string, setFieldValue: any) => {
      setSelectedCountry(value);
      setFieldValue("countryUUID", value);
      setFieldValue("stateUUID", "");
      setFieldValue("cityUUID", "");
      setSelectedState("");
      setNoCitiesAvailable(false);
      setNoStatesAvailable(false);
    },
    []
  );

  const handleStateChange = useCallback((value: string, setFieldValue: any) => {
    setSelectedState(value);
    setFieldValue("stateUUID", value);
    setFieldValue("cityUUID", "");
    setNoCitiesAvailable(false);
  }, []);

  const addorgFormRef = useRef<FormikProps<any> | null>(null);

  // Memoize dropdown options to prevent recreating on every render
  const healthcareTypeOptions = useMemo(
    () =>
      healthcareTypes.map((type) => ({
        value: type.hcoTypeUUID,
        label: type.hcoTypeName,
      })),
    [healthcareTypes]
  );

  const countryOptions = useMemo(
    () =>
      countryList.map((country) => ({
        label: country.countryName,
        value: country.countryUUID,
      })),
    [countryList]
  );

  const stateOptions = useMemo(
    () =>
      states.map((state) => ({
        label: state.stateName,
        value: state.stateUUID,
      })),
    [states]
  );

  const cityOptions = useMemo(
    () =>
      cities.map((city) => ({
        label: city.cityName,
        value: city.cityUUID,
      })),
    [cities]
  );

  const regionOptions = useMemo(
    () =>
      regions.map((region) => ({
        label: region.regionName,
        value: region.regionUUID,
      })),
    [regions]
  );

  const serviceOptions = useMemo(
    () =>
      hcoServices.map((service) => ({
        label: service.hcoServiceName,
        value: service.hcoServiceUUID,
      })),
    [hcoServices]
  );
 

  return (
    <Drawer
      title={
        <span className=" font-semibold text-gray-800 dark:text-white">
          Add New Healthcare
        </span>
      }
      onClose={() => setHealthCareModal(false)}
      open={addHealthCareModal}
      size={"large"}
      destroyOnHidden
      className="healthcare-drawer dark:bg-gray-800"
      footer={
        <Row justify="end">
          <Button
            type="primary"
            htmlType="submit"
            form="orgform"
            loading={createHealthcareMutation.isPending}
            icon={<Save className="h-4 w-4" />}
          >
            Create Healthcare
          </Button>
        </Row>
      }
    >
      <Formik
        initialValues={{
          hcoName: "",
          hcoTypeUUID: "",
          address: "",
          phone1: "",
          phone2: "",
          email: "",
          website: "",
          cityUUID: "",
          icbCode: "",
          healthcareCode: "",
          countryUUID: "",
          stateUUID: "",
          regionUUID: "",
          hcoServices: [],
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        innerRef={addorgFormRef}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          setFieldValue,
        }) => (
          <Form id="orgform">
            <Row gutter={rowGutter}>
              <Row gutter={[16, 16]}>
                <Col xs={24}>
                  <Input
                    name="hcoName"
                    label="Healthcare Name"
                    required
                    prefix={
                      <Building className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    }
                  />
                </Col>
                <Col xs={8}>
                  <CustomSelect
                    required
                    name="hcoTypeUUID"
                    label="Type"
                    placeholder="Select healthcare type"
                    options={healthcareTypeOptions}
                    showSearch={{
                      optionFilterProp: "label",
                    }}
                  />
                </Col>
                <Col xs={8}>
                  <CustomSelect
                    required
                    name="countryUUID"
                    label="Country"
                    showSearch={{
                      optionFilterProp: "label",
                    }}
                    options={countryOptions}
                    value={selectedCountry}
                    onChange={(value) =>
                      handleCountryChange(value, setFieldValue)
                    }
                    prefix={
                      <Flag className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    }
                  />
                </Col>
                <Col xs={8}>
                  <CustomSelect
                    required
                    name="stateUUID"
                    label="State/Province"
                    showSearch={{
                      optionFilterProp: "label",
                    }}
                    options={stateOptions}
                    onChange={(value) =>
                      handleStateChange(value, setFieldValue)
                    }
                    disabled={!selectedCountry || noStatesAvailable}
                    loading={statesLoading}
                    prefix={
                      <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    }
                  />
                </Col>
                <Col xs={8}>
                  {noCitiesAvailable ? (
                    <div className="relative">
                      <Label text="City" required />
                      <Input
                        name="cityUUID"
                        value={values.cityUUID}
                        disabled
                        prefix={
                          <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        }
                      />
                      <div className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                        Using state name as city (no cities available)
                      </div>
                    </div>
                  ) : (
                    <CustomSelect
                      required
                      name="cityUUID"
                      label="City"
                      options={cityOptions}
                      disabled={!selectedState}
                      loading={citiesLoading}
                      showSearch={{
                        optionFilterProp: "label",
                      }}
                      prefix={
                        <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      }
                    />
                  )}
                </Col>
                <Col xs={8}>
                  <CustomSelect
                    required
                    name="regionUUID"
                    label="Region"
                    placeholder="Select region"
                    options={regionOptions}
                    showSearch={{
                      optionFilterProp: "label",
                    }}
                    prefix={
                      <MapPinned className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    }
                  />
                </Col>
                <Col xs={8}>
                  <CustomSelect
                    maxResponsive
                    required
                    name="hcoServices"
                    label="Services"
                    placeholder="Select services"
                    options={serviceOptions}
                    mode="multiple"
                    showSearch={{
                      optionFilterProp: "label",
                    }}
                    prefix={
                      <Layers className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    }
                  />
                </Col>
                <Col xs={24}>
                  <div className="relative">
                    <Label text="Address" required />
                    <TextArea
                      name="address"
                      rows={3}
                      required
                      onChange={handleChange}
                      onBlur={handleBlur}
                      status={
                        touched.address && errors.address ? "error" : undefined
                      }
                      className="rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {touched.address && errors.address && (
                      <span className="field-error">
                        {errors.address as any}
                      </span>
                    )}
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <Input
                    name="healthcareCode"
                    label="Healthcare Code"
                    prefix={
                      <Hash className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    }
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Input
                    name="icbCode"
                    label="ICB Code"
                    prefix={
                      <Hash className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    }
                  />
                </Col>
                <Col xs={24}>
                  <Input
                    name="email"
                    label="Email"
                    type="email"
                    required
                    placeholder="Enter email address"
                    prefix={
                      <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    }
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Input
                    name="phone1"
                    label="Primary Phone"
                    minLength={7}
                    maxLength={20}
                    required
                    prefix={
                      <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    }
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Input
                    name="phone2"
                    label="Secondary Phone"
                    minLength={7}
                    maxLength={20}
                    prefix={
                      <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    }
                  />
                </Col>

                <Col xs={24}>
                  <Input
                    name="website"
                    label="Website"
                    placeholder="Enter website URL"
                    prefix={
                      <Globe className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    }
                  />
                </Col>

              </Row>
            </Row>
          </Form>
        )}
      </Formik>
    </Drawer>
  );
}
