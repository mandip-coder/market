"use client";
import AddNewContactModal, {
  HCOContactPerson,
} from "@/components/AddNewContactModal/AddNewContactModal";
import CustomDatePicker from "@/components/CustomDatePicker/CustomDatePicker";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import Input from "@/components/Input/Input";
import Label from "@/components/Label/Label";
import ContactOptionsRender from "@/components/shared/ContactOptionsRender";
import { useDealStore } from "@/context/store/dealsStore";
import {
  useDropdownContactPersons,
  useHCOList,
  useLeadSources,
  useProducts,
  useUsers,
} from "@/services/dropdowns/dropdowns.hooks";
import { Button, Col, Drawer, Row } from "antd";
import TextArea from "antd/es/input/TextArea";
import dayjs, { Dayjs } from "dayjs";
import { Field, Form, Formik, FormikProps } from "formik";
import { Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useRef, useState } from "react";
import { toast } from '@/components/AppToaster/AppToaster';
import * as Yup from "yup";
import { useCreateDeal } from "../services/deals.hooks";
import { contactDropDownFilter } from "@/Utils/helpers";

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

function DealDrawer() {
  const [AddNewContactModalOpen, setAddNewContactModalOpen] = useState(false);
  const [selectedHCO, setSelectedHCO] = useState<string>("");
  const { setDealDrawer, openDealDrawer } = useDealStore();
  const formikRef = useRef<FormikProps<DealFormData>>(null);
  const { data: hcoList = [] } = useHCOList({
    enabled: openDealDrawer,
  });
  const { data: products = [] } = useProducts({
    enabled: openDealDrawer,
  });
  const { data: usersList = [] } = useUsers({
    enabled: openDealDrawer,
  });
  const { data: leadSources = [] } = useLeadSources({
    enabled: openDealDrawer,
  });
  const { data: contactsOptions = [],isFetching } = useDropdownContactPersons(selectedHCO);
  const { mutate: createDeal, isPending } = useCreateDeal();

  const router = useRouter();
  const handleSubmit = async (values: DealFormData): Promise<void> => {
    const finalValues = {
      ...values,
      dealDate: dayjs(values.dealDate).format("YYYY-MM-DD"),
    };

    createDeal(finalValues, {
      onSuccess: (data) => {
        setDealDrawer(false);
        formikRef.current?.resetForm();
        router.push(`/deals/${data.dealUUID}`);
      },
    });
  };

  const handleClearForm = useCallback(() => {
    if (formikRef.current) {
      formikRef.current.resetForm();
      toast.info("Form cleared");
    }
  }, []);

  const handleAddNewContact = useCallback((contactData: HCOContactPerson) => {
    setAddNewContactModalOpen(false);
    if (contactData) {
      setTimeout(() => {
        const currentContacts = formikRef.current?.values.contactPersons || [];
        formikRef.current?.setFieldValue("contactPersons", [
          ...currentContacts,
          contactData.hcoContactUUID,
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
              loading={isPending}
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
          validateOnBlur={false}
          validateOnChange={false}
        >
          {({ values, handleChange, handleBlur, setFieldValue }) => {
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
                      showSearch={{
                        optionFilterProp: "label",
                      }}
                      options={hcoList.map((h) => ({
                        label: h.hcoName,
                        value: h.hcoUUID,
                      }))}
                      onChange={(value) => {
                        setFieldValue("hcoUUID", value);
                        setFieldValue("contactPersons", []);
                        setSelectedHCO(value);
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
                      showSearch={{
                        optionFilterProp: "label",
                      }}
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
                      showSearch={{
                        optionFilterProp: "label",
                      }}
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
                            loading={
                              !values.hcoUUID ||isFetching
                            }
                            disabled={
                              !values.hcoUUID||isFetching
                            }
                            allowClear
                            options={contactsOptions.map((contact) => ({
                              label: contact.fullName,
                              value: contact.hcoContactUUID,
                              contact,
                            }))}
                            hideSelected
                            optionRender={(option) => (
                              <ContactOptionsRender option={option} />
                            )}
                            onChange={(value) =>
                              setFieldValue("contactPersons", value)
                            }
                            showSearch={{
                              filterOption: contactDropDownFilter
                            }}
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
            );
          }}
        </Formik>
      </Drawer>

      <AddNewContactModal
        hcoUUID={formikRef.current?.values.hcoUUID}
        hcoName={
          hcoList.find((h) => h.hcoUUID === formikRef.current?.values.hcoUUID)
            ?.hcoName
        }
        open={AddNewContactModalOpen}
        onClose={() => setAddNewContactModalOpen(false)}
        onSave={(values) => handleAddNewContact(values)}
        requireHelthcareId
      />
    </>
  );
}
export default memo(DealDrawer);