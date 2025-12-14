import { Healthcare } from "@/app/(main)/healthcares/lib/types";
import { useDropdownsStore } from "@/context/store/dropdownsStore";
import { useApi } from "@/hooks/useAPI";
import { useLoading } from "@/hooks/useLoading";
import { rowGutter } from "@/shared/constants/themeConfig";
import { APIPATH } from "@/shared/constants/url";
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Drawer,
  Row,
  Space,
  Tag,
  TimePicker,
  Typography
} from "antd";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";
import { Form, Formik, FormikHelpers } from "formik";
import {
  Brain,
  Building,
  Mail,
  Phone,
  User
} from "lucide-react";
import { memo, useCallback, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import CustomSelect from "../CustomSelect/CustomSelect";
import Input from "../Input/Input";
import Label from "../Label/Label";



export interface HCOContactPerson {
  fullName: string;
  role: string;
  email: string;
  phone: string;
  linkedin?: string;
  responsibility?: string;
  startTime?: string;
  endTime?: string;
  status: "active" | "inactive";
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
  healthcareOptions?: Healthcare[]
}

interface PersonalityTraits {
  personalityTraitsName: string;
  personalityTraitsUUID: string;
}



const ContactModal = memo(
  ({
    open,
    onClose,
    onSave,
    initialContact,
    hcoUUID,
    hcoName,
    showExtraFields = false,
    requireHelthcareId = false,
  }: ContactModalProps) => {
    const handleCloseModal = useCallback((values: any) => onClose(), [onClose]);
    const isEditMode = !!initialContact;
    const { hcoList, personalityTraits } = useDropdownsStore();
    const validationSchema = useMemo(
      () =>
        Yup.object().shape({
          fullName: Yup.string().required("Name is required"),
          role: Yup.string().required("Role is required"),
          email: Yup.string().email("Please enter a valid email"),
          phone: Yup.string().matches(
            /^\d{10}$/,
            "Please enter a valid 10-digit phone number"
          ),
          linkedin: Yup.string().url("Please enter a valid LinkedIn URL"),
          responsibility: Yup.string().required("Responsibility is required"),
          remarks: Yup.string(),
          hcoUUID: Yup.string().required("Healthcare is required"),
          status: Yup.string().required("Status is required"),
        }),
      []
    );

    const [loading, setLoading] = useLoading();

    const API = useApi();




    const initialValues: HCOContactPerson = useMemo(() => {
      if (initialContact) {
        return {
          ...initialContact,
        };
      }
      return {
        hcoContactUUID: "",
        fullName: "",
        role: "",
        email: "",
        phone: "",
        linkedin: "",
        responsibility: "",
        startTime: "",
        endTime: "",
        remarks: "",
        hcoUUID: hcoUUID || "",
        status: "active" as "active",
        createdAt: "",
        updatedAt: "",
        createdBy: "",
        updatedBy: "",
        personalityTrait: [],
        personalityTraitUUID: [],
      };
    }, [initialContact, hcoUUID]);

    const formikRef = useRef<any>(null);

    const handleSubmit = useCallback(
      async (values: HCOContactPerson, { setSubmitting, resetForm }: FormikHelpers<HCOContactPerson>) => {
        setSubmitting(true);
        setLoading(true);
        const addResponse = await API.post(APIPATH.CONTACT.CREATECONTACT, values);
        if (addResponse) {
          if (onSave) {
            onSave(addResponse.data);
          }
          toast.success("Contact Added Successfully");
          resetForm();
          handleCloseModal(values);
        }
        setSubmitting(false);
        setLoading(false);
      },
      [onSave, setLoading, handleCloseModal, isEditMode, initialContact]
    );

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
        onClose={() => handleCloseModal(null)}
        footer={null}
        destroyOnHidden
        maskClosable={false}
      >

        <Formik<HCOContactPerson>
          initialValues={initialValues}
          validationSchema={validationSchema}
          innerRef={formikRef}
          validateOnBlur
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({
            setFieldValue,
            isSubmitting,
            values,
            errors,
            touched,
            handleBlur,
          }) => {
            return (
              <Form>
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
                        prefix={
                          <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        }
                      />
                    </Col>
                  </>

                  {/* LinkedIn Field */}
                  <Col span={12}>
                    <Input label="LinkedIn" name="linkedin" />
                  </Col>
                  <Col span={12}>
                    <Label text="Working Hours" />
                    <TimePicker.RangePicker
                      format="hh:mm A"
                      className="w-full"
                      onChange={(value) => {
                        if (value && value.length === 2) {
                          const startTime = value[0]?.format("HH:mm:ss");
                          const endTime = value[1]?.format("HH:mm:ss");
                          setFieldValue("startTime", startTime);
                          setFieldValue("endTime", endTime);
                        } else {
                          setFieldValue("startTime", null);
                          setFieldValue("endTime", null);
                        }
                      }}
                      value={
                        values.startTime && values.endTime
                          ? [
                            values.startTime
                              ? dayjs(values.startTime, "HH:mm:ss")
                              : null,
                            values.endTime
                              ? dayjs(values.endTime, "HH:mm:ss")
                              : null,
                          ]
                          : null
                      }
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
                      onChange={(e) =>
                        setFieldValue("remarks", e.target.value)
                      }
                      onBlur={handleBlur}
                      value={values.remarks}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </Col>

                  {requireHelthcareId && (
                    <Col span={12}>
                      {hcoUUID ? (
                        <div>
                          <Label text="Healthcare" required />
                          <Tag>
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
                              ? [
                                ...currentTraits,
                                option.personalityTraitsUUID,
                              ]
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

                <div style={{ marginTop: 24, textAlign: "right" }}>
                  <Space>
                    <Button
                      className="rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      onClick={() => handleCloseModal(null)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      {isEditMode ? "Update" : "Save"}
                    </Button>
                  </Space>
                </div>
              </Form>
            );
          }}
        </Formik>
      </Drawer>
    );
  }
);

ContactModal.displayName = "ContactModal";

export default memo(ContactModal);
