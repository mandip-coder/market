"use client";
import AddNewContactModal from "@/components/AddNewContactModal/AddNewContactModal";
import CustomDatePicker from "@/components/CustomDatePicker/CustomDatePicker";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import Input from "@/components/Input/Input";
import Label from "@/components/Label/Label";
import ContactOptionsRender from "@/components/shared/ContactOptionsRender";
import { useDealStore } from "@/context/store/dealsStore";
import { useDropDowns } from "@/context/store/optimizedSelectors";
import { useApi } from "@/hooks/useAPI";
import { useLoading } from "@/hooks/useLoading";
import { useLoginUser } from "@/hooks/useToken";
import { APIPATH } from "@/shared/constants/url";
import { Button, Col, Drawer, Row } from "antd";
import TextArea from "antd/es/input/TextArea";
import dayjs, { Dayjs } from "dayjs";
import { Field, Form, Formik, FormikProps } from "formik";
import { Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

interface DealFormData {
  dealUUID: string;
  dealName: string;
  summary: string;
  dealDate: Dayjs;
  leadSource: string;
  contactPersons: string[];
  assignTo: string[];
  hcoUUID: string;
  products: string[];
}

const validationSchema = Yup.object().shape({
  hcoUUID: Yup.string().required("Healthcare is required"),
  dealDate: Yup.date().required("Date is required"),
  dealName: Yup.string().required("Deal name is required"),
  leadSource: Yup.string().required("Lead source is required"),
  contactPersons: Yup.array()
    .of(Yup.string())
    .min(1, "At least one contact person is required")
    .required("Contact persons are required"),
  assignTo: Yup.array()
    .of(Yup.string())
    .min(1, "At least one assign to is required")
    .required("Assign to is required"),
  products: Yup.array()
    .of(Yup.string())
    .min(1, "At least one product is required")
    .required("Products are required"),
});





export default function DealDrawer() {
  const { hcoList, leadSources, usersList, products } = useDropDowns()
  const user = useLoginUser()
  const [loading, setLoading] = useLoading();
  const [AddNewContactModalOpen, setAddNewContactModalOpen] = useState(false);
  const [contactsOptions, setContactsOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const { setDealDrawer, openDealDrawer } = useDealStore();
  const formikRef = useRef<FormikProps<DealFormData>>(null);
  const API = useApi();

  const router = useRouter();
  const handleSubmit = async (values: DealFormData): Promise<void> => {
    setLoading(true);
    const finalValues = {
      ...values,
      dealDate: dayjs().format("YYYY-MM-DD"),
    }
    const response = await API.post(APIPATH.DEAL.CREATEDEAL, finalValues);
    if (response) {
      toast.success("Deal created successfully");
      setDealDrawer(false);
      formikRef.current?.resetForm();
      router.push(`/deals/${response.data.dealUUID}`);
    }
    setLoading(false);

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
            assignTo: [],
            dealDate: dayjs(),
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
          {({ values, handleChange, handleBlur, setFieldValue,errors }) =>{
            return (
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
                    options={hcoList.map((h) => ({
                      label: h.hcoName,
                      value: h.hcoUUID,
                    }))}
                    onChange={(value) => {
                      setFieldValue("hcoUUID", value);
                      setFieldValue("contactPersons", []);
                      const fetchContacts = async () => {
                        if (value) {
                          const response = await API.get(APIPATH.CONTACT.GETHCOCONTACT(value),);
                          if (response) {
                            const contacts = response.data as { hcoContactUUID: string; fullName: string }[];
                            setContactsOptions(contacts.map((contact) => ({
                              label: contact.fullName,
                              value: contact.hcoContactUUID,
                              ...contact
                            })));
                          }
                        } else {
                          setContactsOptions([]);
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
                    options={leadSources.map((leadSource) => ({
                      label: leadSource.leadSourceName,
                      value: leadSource.leadSourceUUID,
                    }))}
                  />
                </Col>

                <Col xs={24} sm={12}>
                  <CustomDatePicker name="dealDate" label="Date" required />
                </Col>

                <Col xs={24} sm={12}>
                  <CustomSelect
                    name="assignTo"
                    label="Assign To"
                    mode="multiple"
                    required
                    maxResponsive
                    allowClear
                    placeholder="Select assign to..."
                    options={usersList.map((user) => ({
                      label: user.fullName,
                      value: user.userUUID,
                    }))}
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
                          placeholder={`${values.hcoUUID
                            ? "Select contact persons"
                            : "Select healthcare first"
                            }`}
                          loading={!values.hcoUUID || contactsOptions.length === 0}
                          disabled={!values.hcoUUID || contactsOptions.length === 0}
                          allowClear
                          options={contactsOptions.map((contact) => ({
                            label: contact.label,
                            value: contact.value,
                            contact
                          }))}
                          optionRender={(option) => <ContactOptionsRender option={option} />}
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
                    options={products.map((product) => ({
                      label: product.productName,
                      value: product.productUUID,
                    }))}
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
          )
          } }
        </Formik>
      </Drawer>

      <AddNewContactModal
        hcoUUID={formikRef.current?.values.hcoUUID}
        hcoName={
          hcoList.find(
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
