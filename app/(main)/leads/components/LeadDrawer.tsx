import AddNewContactModal from "@/components/AddNewContactModal/AddNewContactModal";
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
import { useLeadModal } from "@/context/store/optimizedSelectors";

// ===========================
// Types & Interfaces
// ===========================

interface Healthcare {
  hcoUUID: string;
  hcoName: string;
}

interface LeadFormData {
  leadName: string;
  summary: string;
  dateAndTime: string;
  leadSource: string;
  contactPerson: string[];
  owner: string[];
  hcoUUID: string;
}


const validationSchema = Yup.object().shape({
  leadName: Yup.string().required('Lead name is required'),
  summary: Yup.string().required('Summary is required'),
  leadSource: Yup.string().required('Lead source is required'),
  contactPerson: Yup.array().required('Contact person is required').min(1, 'At least one contact person is required'),
  owner: Yup.array().required('Owner is required').min(1, 'At least one owner is required'),
  hcoUUID: Yup.string().required('Healthcare is required'),
  dateAndTime: Yup.date().required('Date is required'),
});

// ===========================
// Constants
// ===========================

const LEAD_SOURCE_OPTIONS = ["Advertisement", "Email", "Social Media", "Partner", "Other"].map((mode) => ({
  label: mode,
  value: mode.toLowerCase()
}));

const OWNER_OPTIONS = [{
  label: "Owner 1",
  value: "123"
}];



function LeadDrawer() {
  const [Healthcares] = useState<Healthcare[]>(HealthCareData as any);
  const [loading, setLoading] = useLoading();
  const [AddNewContactModalOpen, setAddNewContactModalOpen] = useState(false);
  const [contactsOptions, setContactsOptions] = useState<{ label: string; value: string }[]>([
    { label: "Contact 1", value: "contact-1" },
    { label: "Contact 2", value: "contact-2" },
  ]);
  const { leadModal, toggleLeadDrawer, preFilledData } = useLeadModal();

  const formikRef = useRef<FormikProps<LeadFormData>>(null);
  const router = useRouter();
  const handleSubmit = async (values: LeadFormData): Promise<void> => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('New Prospect created!');
      router.push(`/leads/${values.hcoUUID}`);
      toggleLeadDrawer();
    } catch (error) {
      toast.error('Failed to create prospect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleClearForm = useCallback(() => {
    if (formikRef.current) {
      formikRef.current.resetForm();
      toast.info('Form cleared');
    }
  }, []);

  const handleAddNewContact = (contactData: any) => {
    if (contactData) {
      const newId = String(Date.now());
      const newOption = { label: contactData.name + " - " + contactData.role, value: newId };
      setContactsOptions(prev => [...prev, newOption]);
      // Set the value and force a re-render
      setTimeout(() => {
        formikRef.current?.setFieldValue('contactPerson', newId);
        formikRef.current?.setFieldTouched('contactPerson', true);
      }, 0);
    }
    setAddNewContactModalOpen(false);
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
          dateAndTime: preFilledData?.dateAndTime || dayjs().format('YYYY-MM-DD hh:mm:ss A'),
          summary: preFilledData?.summary || "",
          leadSource: preFilledData?.leadSource || "",
          contactPerson: preFilledData?.contactPerson || [],
          owner: preFilledData?.owner || [],
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
                <div className="relative">
                  <Label text="Healthcare" htmlFor="hcoUUID" required />
                  <Field name="hcoUUID">
                    {({ field, meta }: FieldProps) => (
                      <>
                        <AsyncSearchSelect
                          {...field}
                          allowClear
                          value={field.value}
                          placeholder="Select healthcare..."
                          options={Healthcares.map((h) => ({
                            label: h.hcoName,
                            value: h.hcoUUID,
                          }))}
                          onChange={(value) => {
                            setFieldValue("hcoUUID", value);
                            setFieldValue("contactPerson", "");
                          }}
                        />
                        {meta.touched && meta.error && (
                          <span className="field-error">{meta.error}</span>
                        )}
                      </>
                    )}
                  </Field>
                </div>
              </Col>

              <Col xs={24} sm={12}>
                <CustomSelect
                  name="leadSource"
                  label="Lead Source"
                  options={LEAD_SOURCE_OPTIONS}
                />
              </Col>

              <Col xs={24} sm={12}>
                <CustomDatePicker
                  name="dateAndTime"
                  label="Date & Time"
                  format="YYYY-MM-DD hh:mm A"
                  showTime
                  required
                />
              </Col>

              <Col xs={24} sm={12}>
                <CustomSelect
                  name="owner"
                  label="Owner"
                  mode="multiple"
                  required
                  options={OWNER_OPTIONS}
                />
              </Col>

              <Col xs={24} sm={24}>
                <CustomSelect
                  hideSelected
                  name="contactPerson"
                  label="Contact Person"
                  placeholder={`${values.hcoUUID ? "Select contact person" : "Select healthcare first"}`}
                  loading={!values.hcoUUID}
                  disabled={!values.hcoUUID}
                  mode="multiple"
                  allowClear
                  maxResponsive
                  options={contactsOptions}
                  onChange={(value) => setFieldValue("contactPerson", value)}
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
      hcoName={Healthcares.find((h) => h.hcoUUID.toString() === formikRef.current?.values.hcoUUID)?.hcoName}
      open={AddNewContactModalOpen}
      onClose={() => setAddNewContactModalOpen(false)}
      onSave={(values) => handleAddNewContact(values)}
      requireHelthcareId
    />
  </>
  );
}
export default memo(LeadDrawer);
