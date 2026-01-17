import { Healthcare } from "@/app/(main)/healthcares/services/types";
import {
  useCreateContactPerson,
  useHCOList,
  usePersonalityTraits,
  useUpdateContactPerson,
} from "@/services/dropdowns/dropdowns.hooks";
import { rowGutter } from "@/shared/constants/themeConfig";
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Drawer,
  Row,
  Space,
  Switch,
  Tag,
  TimePicker,
  Typography,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import dayjs, { Dayjs } from "dayjs";
import { Form, Formik, FormikHelpers } from "formik";
import { Brain, Building, Mail, Phone, User } from "lucide-react";
import { memo, useCallback, useMemo, useRef } from "react";
import * as Yup from "yup";
import CustomSelect from "../CustomSelect/CustomSelect";
import Input from "../Input/Input";
import Label from "../Label/Label";

export interface HCOContactPerson {
  fullName: string;
  role: string;
  email: string;
  phone: string;
  linkedinUrl?: string;
  responsibility?: string;
  workingHoursStart?: string | Dayjs | null;
  workingHoursEnd?: string | Dayjs | null;
  status: "active" | "inactive";
  unsubscribe: boolean;
  rating?: number;
  hcoUUID: string;
  hcoContactUUID: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  personalityTrait: PersonalityTraits[];
  personalityTraitUUID: string[];
  remarks?: string;
}

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (contact: HCOContactPerson) => void;
  initialContact?: HCOContactPerson | null;
  hcoUUID?: string;
  hcoName?: string;
  showExtraFields?: boolean;
  requireHelthcareId?: boolean;
  healthcareOptions?: Healthcare[];
}

interface PersonalityTraits {
  personalityTraitName: string;
  personalityTraitUUID: string;
}
const validationSchema = Yup.object().shape({
  fullName: Yup.string().required("Name is required"),
  role: Yup.string().required("Role is required"),
  email: Yup.string().email("Please enter a valid email"),
  workingHoursStart: Yup.string()
    .typeError("Please select a valid time")
    .nullable(),
  workingHoursEnd: Yup.string()
    .typeError("Please select a valid time")
    .nullable(),
  phone: Yup.string().matches(
    /^\d{10}$/,
    "Please enter a valid 10-digit phone number"
  ),
  linkedinUrl: Yup.string().url("Please enter a valid LinkedIn URL").nullable(),
  responsibility: Yup.string().required("Responsibility is required"),
  remarks: Yup.string(),
  hcoUUID: Yup.string().required("Healthcare is required"),
  status: Yup.string().required("Status is required"),
  unsubscribe: Yup.boolean(),
});

const ContactModal = memo(
  ({
    open,
    onClose,
    onSave,
    initialContact,
    hcoUUID,
    hcoName,
    requireHelthcareId = false,
  }: ContactModalProps) => {
    const handleCloseModal = useCallback(() => onClose(), [onClose]);
    const isEditMode = !!initialContact;

    // Use React Query hooks instead of Zustand store
    const { data: hcoList = [] } = useHCOList({
      enabled: open,
    });
    const { data: personalityTraits = [] } = usePersonalityTraits({
      enabled: open,
    });

    const initialValues: HCOContactPerson = useMemo(() => {
      if (initialContact) {
        return {
          ...initialContact,
          personalityTraitUUID: initialContact.personalityTrait.map(
            (trait) => trait.personalityTraitUUID
          ),
        };
      }

      return {
        hcoContactUUID: "",
        fullName: "",
        role: "",
        email: "",
        phone: "",
        linkedinUrl: "",
        responsibility: "",
        workingHoursStart: null,
        workingHoursEnd: null,
        remarks: "",
        hcoUUID: hcoUUID || "",
        status: "active",
        unsubscribe: false,
        personalityTrait: [],
        personalityTraitUUID: [],
      };
    }, [initialContact, hcoUUID]);

    const formikRef = useRef<any>(null);

    // Use the mutation hook for creating contact person
    const createContactMutation = useCreateContactPerson(hcoUUID || "");
    const updateContactMutation = useUpdateContactPerson(hcoUUID || "");
    const handleSubmit = useCallback(
      async (
        values: HCOContactPerson,
        { resetForm }: FormikHelpers<HCOContactPerson>
      ) => {
        if (isEditMode) {
          await updateContactMutation.mutateAsync(values, {
            onSuccess: (response) => {
              if (onSave) {
                onSave(response);
              }
              resetForm();
              handleCloseModal();
            },
          });
        } else {
          await createContactMutation.mutateAsync(values, {
            onSuccess: (response) => {
              if (onSave) {
                onSave(response);
              }
              resetForm();
              handleCloseModal();
            },
          });
        }
      },
      [
        onSave,
        handleCloseModal,
        createContactMutation,
        hcoUUID,
        updateContactMutation,
      ]
    );

    return (
      <Formik<HCOContactPerson>
        initialValues={initialValues}
        validationSchema={validationSchema}
        innerRef={formikRef}
        onSubmit={handleSubmit}
        enableReinitialize
        validateOnChange={false}
      >
        {({
          setFieldValue,
          values,
          errors,
          touched,
          handleBlur,
          isSubmitting,
          dirty,
        }) => {
          return (
            <Drawer
              size="large"
              title={
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  <span className="dark:text-white">
                    {isEditMode ? "Edit Contact" : "Add New Contact"}
                  </span>
                </div>
              }
              open={open}
              onClose={() => handleCloseModal()}
              footer={
                <div style={{ marginTop: 24, textAlign: "right" }}>
                  <Space>
                    <Button
                      className="rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      onClick={() => handleCloseModal()}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      form="contactForm"
                      className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl"
                      loading={isSubmitting}
                      disabled={isSubmitting || !dirty}
                    >
                      {isEditMode ? "Update" : "Save"}
                    </Button>
                  </Space>
                </div>
              }
              destroyOnHidden
              maskClosable={false}
            >
              <Form id="contactForm">
                <Row gutter={rowGutter}>
                  {/* Basic Information */}
                  <>
                    <Col span={12}>
                      <Input
                        label="Name"
                        name="fullName"
                        required
                        prefix={
                          <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        }
                      />
                    </Col>
                    <Col span={12}>
                      <Input
                        label="Role"
                        name="role"
                        required
                        prefix={
                          <Building className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        }
                      />
                    </Col>

                    <Col span={12}>
                      <Input
                        label="Email"
                        name="email"
                        type="email"
                        prefix={
                          <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        }
                      />
                    </Col>
                    <Col span={12}>
                      <Input
                        label="Phone"
                        name="phone"
                        maxLength={10}
                        prefix={
                          <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        }
                      />
                    </Col>
                  </>

                  {/* LinkedIn Field */}
                  <Col span={12}>
                    <Input label="LinkedIn" name="linkedinUrl" />
                  </Col>
                  <Col span={12}>
                    <Label text="Working Hours" />
                    <TimePicker.RangePicker
                      format="HH:mm"
                      className="w-full"
                      value={[
                        values.workingHoursStart
                          ? dayjs(values.workingHoursStart, "HH:mm")
                          : null,
                        values.workingHoursEnd
                          ? dayjs(values.workingHoursEnd, "HH:mm")
                          : null,
                      ]}
                      onChange={(dates) => {
                        if (!dates) {
                          setFieldValue("workingHoursStart", null);
                          setFieldValue("workingHoursEnd", null);
                          return;
                        }

                        // Save back as String "HH:mm:ss" to keep Formik state consistent
                        setFieldValue(
                          "workingHoursStart",
                          dates[0] ? dates[0].format("HH:mm") : null
                        );
                        setFieldValue(
                          "workingHoursEnd",
                          dates[1] ? dates[1].format("HH:mm") : null
                        );
                      }}
                    />
                  </Col>
                  <Col span={24}>
                    <div className="relative w-full">
                      <Label text="Responsibility" required />
                      <TextArea
                        name="responsibility"
                        onChange={(e) =>
                          setFieldValue("responsibility", e.target.value)
                        }
                        onBlur={handleBlur}
                        value={values.responsibility}
                        required
                        status={
                          touched.responsibility && errors.responsibility
                            ? "error"
                            : undefined
                        }
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      {touched.responsibility && errors.responsibility && (
                        <span className="field-error">
                          {errors.responsibility}
                        </span>
                      )}
                    </div>
                  </Col>
                  <Col span={24}>
                    <Label text="Remarks" />
                    <TextArea
                      name="remarks"
                      onChange={(e) => setFieldValue("remarks", e.target.value)}
                      onBlur={handleBlur}
                      value={values.remarks}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </Col>

                  <Col span={12} className="flex items-center gap-2 mt-4">
                    <Label text="Status" />
                    <Switch
                      checked={values.status === "active"}
                      onChange={(checked) =>
                        setFieldValue("status", checked ? "active" : "inactive")
                      }
                      size="small"
                      checkedChildren="Active"
                      unCheckedChildren="Inactive"
                    />
                  </Col>
                  
                  <Col span={12} className="flex items-center gap-2 mt-4">
                    <Label text="Unsubscribe (Emails)" />
                    <Switch
                      checked={values.unsubscribe}
                      onChange={(checked) => setFieldValue("unsubscribe", checked)}
                      checkedChildren="Yes"
                      size="small"
                      unCheckedChildren="No"
                    />
                  </Col>

                  {requireHelthcareId && (
                    <Col span={12}>
                      {hcoUUID ? (
                        <div>
                          <Label text="Healthcare" required />
                          <Tag color="blue">
                            <Typography.Text color="" type="secondary">
                              {hcoName}
                            </Typography.Text>
                          </Tag>
                        </div>
                      ) : (
                        <CustomSelect
                          name="hcoUUID"
                          label="Healthcare Name"
                          options={hcoList.map((hco) => ({
                            value: hco.hcoUUID,
                            label: hco.hcoName,
                          }))}
                          loading={hcoList.length === 0}
                          showSearch={{
                            optionFilterProp: "label",
                          }}
                          required
                        />
                      )}
                    </Col>
                  )}
                </Row>
                <Divider />
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    <Label text="Personality Traits" />
                  </div>
                  <Row gutter={[8, 8]}>
                    {personalityTraits.map((option) => (
                      <Col span={12} key={option.personalityTraitsUUID}>
                        <Checkbox
                          name={`personalityTraits.${option.personalityTraitsUUID}`}
                          checked={
                            values.personalityTraitUUID?.includes(
                              option.personalityTraitsUUID
                            ) || false
                          }
                          onChange={(e) => {
                            const currentTraits =
                              values.personalityTraitUUID || [];
                            const newTraits = e.target.checked
                              ? [...currentTraits, option.personalityTraitsUUID]
                              : currentTraits.filter(
                                  (uuid: string) =>
                                    uuid !== option.personalityTraitsUUID
                                );
                            setFieldValue("personalityTraitUUID", newTraits);
                          }}
                          className="dark:text-gray-300"
                        >
                          {option.personalityTraitsName}
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Form>
            </Drawer>
          );
        }}
      </Formik>
    );
  }
);

ContactModal.displayName = "ContactModal";

export default memo(ContactModal);
