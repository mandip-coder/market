import AddNewContactModal, {
  HCOContactPerson,
} from "@/components/AddNewContactModal/AddNewContactModal";
import CustomDatePicker from "@/components/CustomDatePicker/CustomDatePicker";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import Input from "@/components/Input/Input";
import Label from "@/components/Label/Label";
import ContactOptionsRender from "@/components/shared/ContactOptionsRender";
import { useLeadModal } from "@/context/store/optimizedSelectors";
import { useDropdownContactPersons, useHCOList, useLeadSources, useUsers } from "@/services/dropdowns/dropdowns.hooks";
import { Button, Col, Drawer, Row } from "antd";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";
import {
  Form,
  Formik,
  FormikProps
} from "formik";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { toast } from '@/components/AppToaster/AppToaster';
import * as Yup from "yup";
import { useCreateLead } from "../services/leads.hooks";
import { useApplyRecommendation } from "../services/recommendations.hooks";
import { contactDropDownFilter } from "@/Utils/helpers";

export interface LeadFormData {
  leadName: string;
  summary: string;
  leadDate: string;
  leadSource: string;
  contactPersons: string[];
  assignTo: string[];
  hcoUUID: string;
  // leadUUID: string;
}

const validationSchema = Yup.object().shape({
  leadName: Yup.string().required("Title is required"),
  summary: Yup.string().required("Summary is required"),
  leadSource: Yup.string().required("Prospect source is required"),
  contactPersons: Yup.array()
    .required("Contact person is required")
    .min(1, "At least one contact person is required"),
  assignTo: Yup.array()
    .required("Assign to is required")
    .min(1, "At least one assign to is required"),
  hcoUUID: Yup.string().required("Healthcare is required"),
  leadDate: Yup.date().required("Date is required"),
});

function LeadDrawer() {
  const [AddNewContactModalOpen, setAddNewContactModalOpen] = useState(false);
  const { leadModal, toggleLeadDrawer, preFilledData, recommendationUUID, clearRecommendationUUID } = useLeadModal();

  const { data: hcoList = [] } = useHCOList({
    enabled: leadModal,
  })
  const { data: usersList = [] } = useUsers({
    enabled: leadModal,
  })
  const { data: leadSources = [] } = useLeadSources({
    enabled: leadModal,
  })

  const [selectedHcoUUID, setSelectedHcoUUID] = useState<string>("");

  const formikRef = useRef<FormikProps<LeadFormData>>(null);
  const router = useRouter();

  // Use React Query mutation hook for creating leads
  const createLeadMutation = useCreateLead();
  const applyRecommendationMutation = useApplyRecommendation();
  const { data: hcoContactList = [] } = useDropdownContactPersons(selectedHcoUUID);

  useEffect(() => {
    if (leadModal && preFilledData?.hcoUUID) {
      setSelectedHcoUUID(preFilledData.hcoUUID);
    } else if (!leadModal) {
      setSelectedHcoUUID("");

    }
  }, [leadModal, preFilledData?.hcoUUID]);



  const handleSubmit = async (values: LeadFormData): Promise<void> => {
    createLeadMutation.mutate(values, {
      onSuccess: (data) => {
        // If this lead was created from a recommendation, apply it
        if (recommendationUUID) {
          applyRecommendationMutation.mutate(recommendationUUID, {
            onSettled: () => {
              clearRecommendationUUID();
            },
          });
        }
        toggleLeadDrawer();
        router.push(`/leads/${data.leadUUID}`);
      },
    });
  };

  const handleClearForm = useCallback(() => {
    if (formikRef.current) {
      formikRef.current.resetForm();
      toast.info("Form cleared");
    }
  }, []);

  const handleAddNewContact = (contactData: HCOContactPerson) => {
    setTimeout(() => {
      if (contactData) {
        const currentContacts = formikRef.current?.values.contactPersons || [];
        formikRef.current?.setFieldValue(
          "contactPersons",
          [...currentContacts, contactData.hcoContactUUID]
        );
        formikRef.current?.setFieldTouched("contactPersons", true);
        setAddNewContactModalOpen(false);
      }

    }, 100);
  };

  const handleClose = useCallback(() => {
    // Clear recommendation UUID if drawer is closed without submitting
    if (recommendationUUID) {
      clearRecommendationUUID();
    }
    toggleLeadDrawer();
  }, [recommendationUUID, clearRecommendationUUID, toggleLeadDrawer]);

  return (
    <>
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
              loading={createLeadMutation.isPending}
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
            leadDate: preFilledData?.leadDate || dayjs().format("YYYY-MM-DD"),
            summary: preFilledData?.summary || "",
            leadSource: preFilledData?.leadSource || "",
            contactPersons: preFilledData?.contactPersons || [],
            assignTo: preFilledData?.assignTo || [],
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          validateOnBlur
        >
          {({ values, handleChange, handleBlur, setFieldValue }) => {
            return (
              <Form id="leadForm">
                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <Input name="leadName" label="Title" required />
                  </Col>

                  <Col xs={24} sm={12}>
                    <CustomSelect
                      name="hcoUUID"
                      label="Healthcare"
                      allowClear
                      required
                      value={values.hcoUUID}
                      placeholder="Select healthcare..."
                      disabled={!!recommendationUUID && !!preFilledData?.hcoUUID}
                      options={hcoList.map((h) => ({
                        label: h.hcoName,
                        value: h.hcoUUID,
                      }))}
                      showSearch={{
                        optionFilterProp: "label",
                      }}
                      onChange={async (value) => {
                        setFieldValue("hcoUUID", value);
                        setFieldValue("contactPersons", []);
                        setSelectedHcoUUID(value);
                      }}
                    />
                  </Col>

                  <Col xs={24} sm={12}>
                    <CustomSelect
                      required
                      name="leadSource"
                      label="Prospect Source"
                      options={leadSources.map((source) => ({
                        label: source.leadSourceName,
                        value: source.leadSourceUUID,
                      }))}
                      showSearch={{
                        optionFilterProp: "label",
                      }}
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
                      showSearch={{
                        optionFilterProp: "label",
                      }}
                      maxResponsive
                    />
                  </Col>

                  <Col xs={24} sm={24}>
                    <CustomSelect
                      hideSelected
                      required
                      name="contactPersons"
                      label="Contact Persons"
                      placeholder={`${values.hcoUUID
                        ? "Select contact person"
                        : "Select healthcare first"
                        }`}
                      loading={!values.hcoUUID}
                      disabled={!values.hcoUUID}
                      mode="multiple"
                      allowClear
                      maxResponsive
                      showSearch={{
                        filterOption: contactDropDownFilter
                      }}
                      options={hcoContactList.map((contact) => ({
                        label: contact.fullName,
                        value: contact.hcoContactUUID,
                        contact,
                      }))}
                      optionRender={(contact) => (
                        <ContactOptionsRender option={contact} />
                      )}
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
                    <Label text="Summary" htmlFor="summary" required />
                    <TextArea
                      name="summary"
                      id="summary"
                      value={values.summary}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Describe the Prospect, key discussion points, client's feedback, and any action items..."
                      maxLength={2000}
                      rows={8}
                      showCount
                      required
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
          hcoList.find(
            (h) => h.hcoUUID.toString() === formikRef.current?.values.hcoUUID
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
export default memo(LeadDrawer);
