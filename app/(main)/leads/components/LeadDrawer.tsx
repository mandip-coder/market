import AddNewContactModal, { HCOContactPerson } from "@/components/AddNewContactModal/AddNewContactModal";
import AsyncSearchSelect from "@/components/AsyncSearchSelect/AsyncSearchSelect";
import CustomDatePicker from "@/components/CustomDatePicker/CustomDatePicker";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import Input from "@/components/Input/Input";
import Label from "@/components/Label/Label";
import { useLeadStore } from "@/context/store/leadsStore";
import { useLoading } from "@/hooks/useLoading";
import { Button, Col, Drawer, Row } from "antd";
import TextArea from "antd/es/input/TextArea";
import { Field, FieldMetaProps, FieldProps, Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
import HealthCareData from '../../deals/healthcares.json';
import dayjs from "dayjs";
import { useDropDowns, useLeadModal } from "@/context/store/optimizedSelectors";
import { useApi } from "@/hooks/useAPI";
import { APIPATH } from "@/shared/constants/url";
import { fetchContacts } from "@/Utils/helpers";
import ContactOptionsRender from "@/components/shared/ContactOptionsRender";

// ===========================
// Types & Interfaces
// ===========================

interface Healthcare {
  hcoUUID: string;
  hcoName: string;
}

export interface LeadFormData {
  leadName: string;
  summary: string;
  leadDate: string;
  leadSource: string;
  contactPersons: string[];
  assignTo: string[];
  hcoUUID: string;
}


const validationSchema = Yup.object().shape({
  leadName: Yup.string().required('Lead name is required'),
  summary: Yup.string().required('Summary is required'),
  leadSource: Yup.string().required('Lead source is required'),
  contactPersons: Yup.array().required('Contact person is required').min(1, 'At least one contact person is required'),
  assignTo: Yup.array().required('Assign to is required').min(1, 'At least one assign to is required'),
  hcoUUID: Yup.string().required('Healthcare is required'),
  leadDate: Yup.date().required('Date is required'),
});



function LeadDrawer() {
  const [loading, setLoading] = useLoading();
  const [AddNewContactModalOpen, setAddNewContactModalOpen] = useState(false);
  const { leadModal, toggleLeadDrawer, preFilledData } = useLeadModal();
  const { usersList, hcoList, leadSources, products } = useDropDowns();
  const [contactsOptions, setContactsOptions] = useState<HCOContactPerson[]>([]);
  const formikRef = useRef<FormikProps<LeadFormData>>(null);
  const router = useRouter();
  const API = useApi();
  const handleSubmit = async (values: LeadFormData): Promise<void> => {
    setLoading(true);
    const response = await API.post(APIPATH.LEAD.CREATELEAD, values);
    if (response) {
      toast.success('Lead created successfully');
      toggleLeadDrawer();
      router.push(`/leads/${values.hcoUUID}`);
    }
    setLoading(false);
  }

  const handleClearForm = useCallback(() => {
    if (formikRef.current) {
      formikRef.current.resetForm();
      toast.info('Form cleared');
    }
  }, []);

  const handleAddNewContact = (contactData: HCOContactPerson) => {
    if (contactData) {
      setContactsOptions(prev => [...prev, contactData]);
      formikRef.current?.setFieldValue('contactPersons', contactData.hcoContactUUID);
      formikRef.current?.setFieldTouched('contactPersons', true);
      setAddNewContactModalOpen(false);
    }
  }

  const handleClose = useCallback(() => {
    toggleLeadDrawer();
  }, [])

  return (<>
    <Drawer
      title={<span className="text-lg font-semibold">Prospect Details</span>}
      onClose={handleClose}
      size="large"
      open={leadModal}
      destroyOnHidden
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleClearForm}>Clear</Button>
          <Button
            type="primary"
            form="leadForm"
            htmlType="submit"
            loading={loading}
            icon={<Search size={16} />}
          >
            Start Prospect
          </Button>
        </div>
      }
    >
      <Formik
        innerRef={formikRef}
        initialValues={{
          leadName: preFilledData?.leadName || "",
          hcoUUID: preFilledData?.hcoUUID || "",
          leadDate: preFilledData?.leadDate || dayjs().format('YYYY-MM-DD'),
          summary: preFilledData?.summary || "",
          leadSource: preFilledData?.leadSource || "",
          contactPersons: preFilledData?.contactPersons || [],
          assignTo: preFilledData?.assignTo || [],
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnBlur
      >
        {({ values, handleChange, handleBlur, setFieldValue }) => (
          <Form id="leadForm">
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Input
                  name="leadName"
                  label="Lead Name"
                  required
                />
              </Col>

              <Col xs={24} sm={12}>

                <CustomSelect
                  name="hcoUUID"
                  label="Healthcare"
                  allowClear
                  required
                  value={values.hcoUUID}
                  placeholder="Select healthcare..."
                  options={hcoList.map((h) => ({
                    label: h.hcoName,
                    value: h.hcoUUID,
                  }))}
                  onChange={async (value) => {
                    setFieldValue("hcoUUID", value);
                    setFieldValue("contactPersons", []);
                    const contacts = await fetchContacts(API, value);
                    setContactsOptions(contacts ?? []);
                  }}
                />

              </Col>

              <Col xs={24} sm={12}>
                <CustomSelect
                  required
                  name="leadSource"
                  label="Lead Source"
                  options={leadSources.map((source) => ({
                    label: source.leadSourceName,
                    value: source.leadSourceUUID,
                  }))}
                />
              </Col>

              <Col xs={24} sm={12}>
                <CustomDatePicker
                  name="leadDate"
                  label="Date"
                  format="YYYY-MM-DD"
                  required
                />
              </Col>

              <Col xs={24} sm={12}>
                <CustomSelect
                  name="assignTo"
                  label="Assign To"
                  mode="multiple"
                  required
                  options={usersList.map((user) => ({
                    label: user.fullName,
                    value: user.userUUID,
                  }))}
                />
              </Col>

              <Col xs={24} sm={24}>
                <CustomSelect
                  hideSelected
                  required
                  name="contactPersons"
                  label="Contact Persons"
                  placeholder={`${values.hcoUUID ? "Select contact person" : "Select healthcare first"}`}
                  loading={!values.hcoUUID}
                  disabled={!values.hcoUUID}
                  mode="multiple"
                  allowClear
                  maxResponsive
                  options={contactsOptions.map((contact) => ({
                    label: contact.fullName,
                    value: contact.hcoContactUUID,
                    contact
                  }))}
                  optionRender={(contact) => <ContactOptionsRender option={contact} />}
                  popupRender={(contact) => (
                    <>
                      {contact}
                      <div className="flex p-2 gap-2 justify-end border-t border-gray-100 dark:border-gray-700">
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => setAddNewContactModalOpen(true)}
                          icon={<Plus size={16} />}
                        >
                          Add New Person
                        </Button>
                      </div>
                    </>
                  )}
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
                  placeholder="Describe the lead, key discussion points, client's feedback, and any action items..."
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
      hcoName={hcoList.find((h) => h.hcoUUID.toString() === formikRef.current?.values.hcoUUID)?.hcoName}
      open={AddNewContactModalOpen}
      onClose={() => setAddNewContactModalOpen(false)}
      onSave={(values) => handleAddNewContact(values)}
      requireHelthcareId
    />
  </>
  );
}
export default memo(LeadDrawer);
