"use client";
import AddNewContactModal from "@/components/AddNewContactModal/AddNewContactModal";
import AsyncSearchSelect from "@/components/AsyncSearchSelect/AsyncSearchSelect";
import CustomDatePicker from "@/components/CustomDatePicker/CustomDatePicker";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import Input from "@/components/Input/Input";
import Label from "@/components/Label/Label";
import { useDealStore } from "@/context/store/dealsStore";
import { useLoading } from "@/hooks/useLoading";
import { Button, Col, Drawer, Row } from "antd";
import TextArea from "antd/es/input/TextArea";
import dayjs, { Dayjs } from "dayjs";
import { Field, Form, Formik, FormikProps } from "formik";
import { Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import HealthCareData from "../healthcares.json";
import { APIPATH } from "@/shared/constants/url";
import { useApi } from "@/hooks/useAPI";

interface Healthcare {
  hcoUUID: string;
  hcoName: string;
}

interface DealFormData {
  dealUUID: string;
  dealName: string;
  summary: string;
  createdDate: Dayjs;
  leadSource: string;
  contactPersons: string[];
  owners: string[];
  hcoUUID: string;
  products?: string[];
}

const validationSchema = Yup.object().shape({
  hcoUUID: Yup.string().required("Healthcare is required"),
  createdDate: Yup.date().required("Date is required"),
  dealName: Yup.string().required("Deal name is required"),
  leadSource: Yup.string().required("Lead source is required"),
  contactPersons: Yup.array()
    .of(Yup.string())
    .min(1, "At least one contact person is required")
    .required("Contact persons are required"),
  owners: Yup.array()
    .of(Yup.string())
    .min(1, "At least one owner is required")
    .required("Owners are required"),
  products: Yup.array()
    .of(Yup.string())
    .min(1, "At least one product is required")
    .required("Products are required"),
});

const OWNER_OPTIONS = [
  {
    label: "Owner 1",
    value: "123",
  },
];

const PRODUCT_OPTIONS = [
  { label: "Apozyl", value: "apozyl" },
  { label: "Zithromax", value: "zithromax" },
  { label: "Lipitor", value: "lipitor" },
  { label: "Metformin", value: "metformin" },
  { label: "Insulin", value: "insulin" },
  { label: "Aspirin", value: "aspirin" },
  { label: "Amoxicillin", value: "amoxicillin" },
  { label: "Omeprazole", value: "omeprazole" },
  { label: "Simvastatin", value: "simvastatin" },
  { label: "Losartan", value: "losartan" },
];

interface LeadSource {
  leadSourceUUID: string;
  leadSourceName: string;
}

export default function DealDrawer() {
  const [Healthcares, setHealthcares] = useState<Healthcare[]>([]);
  const [LeadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [loading, setLoading] = useLoading();
  const [AddNewContactModalOpen, setAddNewContactModalOpen] = useState(false);
  const [contactsOptions, setContactsOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const { setDealDrawer, openDealDrawer } = useDealStore();
  const formikRef = useRef<FormikProps<DealFormData>>(null);
  const API = useApi();
  const fetchHealthcares = async () => {
    try {
      const response = await API.get(APIPATH.HCO.GETHEALTHCARES);
      setHealthcares(response.data.list as Healthcare[]);
    } catch (error) {
      console.error("Error fetching healthcares:", error);
    }
  };
  const fetchLeadSources = async () => {
    try {
      const response = await API.get(APIPATH.DROPDOWN.LEADSOURCE);
      setLeadSources(response.data as LeadSource[]);
    } catch (error) {
      console.error("Error fetching lead sources:", error);
    }
  };
  useEffect(() => {
    fetchHealthcares();
    fetchLeadSources();
  }, []);

  const router = useRouter();
  const handleSubmit = async (values: DealFormData): Promise<void> => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Deal created!");
      console.log(values);
      // router.push(`/deals/${values.dealUUID}`);
      setDealDrawer(false);
    } catch (error) {
      toast.error("Failed to create deal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = useCallback(() => {
    if (formikRef.current) {
      formikRef.current.resetForm();
      toast.info("Form cleared");
    }
  }, []);

  const handleAddNewContact = useCallback((contactData: any) => {
    setAddNewContactModalOpen(false);
    if (contactData) {
      const newId = String(Date.now());
      const newOption = {
        label: contactData.name + " - " + contactData.role,
        value: newId,
      };
      setContactsOptions((prev) => [...prev, newOption]);
      setTimeout(() => {
        const currentContacts = formikRef.current?.values.contactPersons || [];
        formikRef.current?.setFieldValue("contactPersons", [
          ...currentContacts,
          newId,
        ]);
        formikRef.current?.setFieldTouched("contactPersons", true);
      }, 0);
    }
  }, []);

  const handleClose = useCallback(() => {
    setDealDrawer(false);
  }, []);

  return (
    <>
      <Drawer
        title={<span className="text-lg font-semibold">Create New Deal</span>}
        onClose={handleClose}
        size="large"
        open={openDealDrawer}
        destroyOnHidden
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={handleClearForm}>Clear</Button>
            <Button
              type="primary"
              form="dealForm"
              htmlType="submit"
              loading={loading}
              icon={<Save size={16} />}
            >
              Create Deal
            </Button>
          </div>
        }
      >
        <Formik
          innerRef={formikRef}
          initialValues={{
            hcoUUID: "",
            hcoName: "",
            contactPersons: [],
            owners: [],
            createdDate: dayjs(),
            summary: "",
            products: [],
            dealName: "",
            dealUUID: "",
            leadSource: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          validateOnBlur
        >
          {({ values, handleChange, handleBlur, setFieldValue }) => (
            <Form id="dealForm">
              <Row gutter={[16, 16]}>
                <Col xs={24}>
                  <Input name="dealName" label="Deal Name" required />
                </Col>

                <Col xs={24} sm={12}>
                  <CustomSelect
                    allowClear
                    name="hcoUUID"
                    label="Healthcare"
                    placeholder="Select healthcare..."
                    required
                    options={Healthcares.map((h) => ({
                      label: h.hcoName,
                      value: h.hcoUUID,
                    }))}
                    onChange={(value) => {
                      setFieldValue("hcoUUID", value);
                      setFieldValue("contactPersons", []);
                      const fetchContacts = async () => {
                        try {
                          const response = await API.get(APIPATH.DROPDOWN.LEADSOURCE,);
                          const contacts = response.data as {contactPersonUUID: string; contactPersonName: string}[];
                          setContactsOptions(contacts.map((contact) => ({
                            label: contact.contactPersonName,
                            value: contact.contactPersonUUID,
                          })));
                        } catch (error) {
                          console.error("Error fetching contacts:", error);
                        }
                      };
                      fetchContacts();
                    }}
                  />
                </Col>

                <Col xs={24} sm={12}>
                  <CustomSelect
                    name="leadSource"
                    label="Lead Source"
                    required
                    options={LeadSources.map((leadSource) => ({
                      label: leadSource.leadSourceName,
                      value: leadSource.leadSourceUUID,
                    }))}
                  />
                </Col>

                <Col xs={24} sm={12}>
                  <CustomDatePicker name="createdDate" label="Date" required />
                </Col>

                <Col xs={24} sm={12}>
                  <CustomSelect
                    mode="multiple"
                    name="owners"
                    label="Owners"
                    required
                    allowClear
                    placeholder="Select owners..."
                    options={OWNER_OPTIONS}
                    maxResponsive
                  />
                </Col>

                <Col xs={24} sm={12}>
                  <Field name="contactPersons">
                    {({ field, meta }: any) => (
                      <div className="relative">
                        <Label
                          text="Contact Persons"
                          htmlFor="contactPersons"
                          required
                        />
                        <CustomSelect
                          {...field}
                          mode="multiple"
                          value={field.value}
                          placeholder={`${
                            values.hcoUUID
                              ? "Select contact persons"
                              : "Select healthcare first"
                          }`}
                          loading={!values.hcoUUID||contactsOptions.length === 0}
                          disabled={!values.hcoUUID||contactsOptions.length === 0}
                          allowClear
                          options={contactsOptions}
                          onChange={(value) =>
                            setFieldValue("contactPersons", value)
                          }
                          maxResponsive
                          popupRender={(contact) => (
                            <>
                              {contact}
                              <div className="flex p-2 gap-2 justify-end border-t border-gray-100 dark:border-gray-700">
                                <Button
                                  size="small"
                                  type="primary"
                                  onClick={() =>
                                    setAddNewContactModalOpen(true)
                                  }
                                  icon={<Plus size={16} />}
                                >
                                  Add New Person
                                </Button>
                              </div>
                            </>
                          )}
                        />
                        {meta.touched && meta.error && (
                          <span className="field-error">{meta.error}</span>
                        )}
                      </div>
                    )}
                  </Field>
                </Col>

                <Col xs={12}>
                  <CustomSelect
                    required
                    mode="multiple"
                    name="products"
                    label="Products"
                    allowClear
                    placeholder="Select products..."
                    options={PRODUCT_OPTIONS}
                    hideSelected
                    maxResponsive
                  />
                </Col>
                <Col xs={24}>
                  <Label text="Summary" htmlFor="summary" />
                  <TextArea
                    name="summary"
                    id="summary"
                    value={values.summary}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Describe the deal, key discussion points, client's feedback, and any action items..."
                    maxLength={2000}
                    rows={8}
                    showCount
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </Col>
              </Row>
            </Form>
          )}
        </Formik>
      </Drawer>

      <AddNewContactModal
        hcoUUID={formikRef.current?.values.hcoUUID}
        hcoName={
          Healthcares.find(
            (h) => h.hcoUUID === formikRef.current?.values.hcoUUID
          )?.hcoName
        }
        open={AddNewContactModalOpen}
        onClose={() => setAddNewContactModalOpen(false)}
        onSave={(values) => handleAddNewContact(values)}
        requireHelthcareId
      />
    </>
  );
}
