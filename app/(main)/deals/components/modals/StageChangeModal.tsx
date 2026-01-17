"use client";

import AppScrollbar from "@/components/AppScrollBar";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import FileUploader from "@/components/Fileuploader/Fileuploader";
import Label from "@/components/Label/Label";
import { ContactPersonReview, stageValues } from "@/context/store/dealsStore";
import {
  useDropdownDealStages,
  useDropdownLossReasons,
} from "@/services/dropdowns/dropdowns.hooks";
import { APIPATH } from "@/shared/constants/url";
import { Button, Empty, Input, Modal, Rate, Steps, Typography } from "antd";
import { StepsProps } from "antd/lib";
import { ErrorMessage, Field, FieldArray, Form, Formik } from "formik";
import {
  Check,
  DollarSign,
  MessageCircle,
  RefreshCw,
  Search,
  Trophy,
  XCircle,
} from "lucide-react";
import { cloneElement, useMemo, useState } from "react";
import * as Yup from "yup";
import {
  useDealContacts,
  useUpdateDealStage,
} from "../../services/deals.hooks";
import { Deal, UpdateDealStagePayload } from "../../services/deals.types";

const { TextArea } = Input;
const { Title } = Typography;

const getStageProperties = (stageName: string) => {
  const normalizedStage = stageName?.toLowerCase() || "";

  if (normalizedStage.includes("discussion")) {
    return {
      icon: <MessageCircle size={20} />,
      color: "#06b6d4",
      bgColor: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
    };
  } else if (normalizedStage.includes("negotiation")) {
    return {
      icon: <DollarSign size={20} />,
      color: "#f59e0b",
      bgColor: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    };
  } else if (normalizedStage.includes("closed won")) {
    return {
      icon: <Trophy size={20} />,
      color: "#10b981",
      bgColor: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    };
  } else if (normalizedStage.includes("closed lost")) {
    return {
      icon: <XCircle size={20} />,
      color: "#ef4444",
      bgColor: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    };
  } else {
    return {
      icon: <Search size={20} />,
      color: "#6b7280",
      bgColor: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
    };
  }
};

const StageChangeModal = ({ dealDetails }: { dealDetails: Deal }) => {
  const [open, setOpen] = useState(false);
  const [selectedStageFromPill, setSelectedStageFromPill] = useState<
    string | null
  >(dealDetails.dealStage);

  const { data: dealStages = [] } = useDropdownDealStages();
  const currentStageUUID = dealDetails.dealStage;

  // Derive current stage name for logic
  const currentStageName = useMemo(() => {
    return (
      dealStages.find((s) => s.dealStageUUID === currentStageUUID)
        ?.dealStageName || ""
    );
  }, [dealStages, currentStageUUID]);
  const isClosedWon = (stageUUID: string | null) => {
    if (!stageUUID) return false;
    const stage = dealStages.find((s) => s.dealStageUUID === stageUUID);
    return stage?.dealStageName === "Closed Won";
  };

  const isClosedLost = (stageUUID: string | null) => {
    if (!stageUUID) return false;
    const stage = dealStages.find((s) => s.dealStageUUID === stageUUID);
    return stage?.dealStageName === "Closed Lost";
  };

  // Check if current stage is closed (Closed Won or Closed Lost)
  const isCurrentStageClosed = useMemo(() => {
    return isClosedWon(currentStageUUID) || isClosedLost(currentStageUUID);
  }, [currentStageUUID, dealStages]);

  const {
    data: contactPersons = [],
    refetch,
    isLoading,
    isFetching
  } = useDealContacts(dealDetails.dealUUID,open&&(isClosedWon(selectedStageFromPill)||isClosedLost(selectedStageFromPill)));

  const selectedStageName = useMemo(() => {
    return (
      dealStages.find((s) => s.dealStageUUID === selectedStageFromPill)
        ?.dealStageName || ""
    );
  }, [dealStages, selectedStageFromPill]);

  const { data: lossReasons = [] } = useDropdownLossReasons({
    enabled: open && selectedStageName === "Closed Lost",
  });

  const openForStage = (stageValue: string) => {
    // Prevent opening modal if current stage is closed
    if (isCurrentStageClosed) {
      return;
    }
    if (stageValue === currentStageUUID) {
      return;
    }
    setSelectedStageFromPill(stageValue);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setSelectedStageFromPill(null);
  };



  const validationSchema = Yup.object().shape({
    dealStage: Yup.string()
      .required("Please select a stage")
      .test(
        "different",
        "Please select a different stage",
        (val) => val !== currentStageUUID
      ),
    reason: Yup.string().required("Reason is required"),
    lossReason: Yup.string().when("dealStage", {
      is: (val: string) => isClosedLost(val),
      then: (schema: Yup.StringSchema) => schema.required("Reason is required"),
      otherwise: (schema: Yup.StringSchema) => schema,
    }),
    proof: Yup.array()
      .of(Yup.mixed<File>().required("File is required"))
      .when("dealStage", {
        is: (val: string) => isClosedWon(val),
        then: (schema) =>
          schema
            .min(1, "At least one file is required")
            .required("Proof is required")
            .max(3, "You can upload a maximum of 3 files"),
        otherwise: (schema) => schema.notRequired(),
      }),
    contactPersonReviews: Yup.array()
      .of(
        Yup.object().shape({
          contactPersonUUID: Yup.string(),
          rating: Yup.number().min(0).max(5),
          comment: Yup.string(),
        })
      )
      .notRequired(),
  });

  const { mutate: updateDealStage, isPending: isUpdating } = useUpdateDealStage(
    dealDetails.dealUUID
  );

  const handleSubmit = (values: stageValues) => {
    const targetStage = selectedStageFromPill || values.dealStage;

    const payload: UpdateDealStagePayload = {
      stageUUID: targetStage,
      reasonForChange: values.reason,
      lossReasonUUID: isClosedLost(values.dealStage)
        ? values.lossReason
        : undefined,
      documents:
        isClosedWon(values.dealStage) && values.proof
          ? values.proof.map((file: any) => {
              const response = file.response;
              return {
                filename: response?.originalFileName || file.name,
                url: response?.fileUrl || "",
                filePath: response?.filePath || "",
                size: response?.fileSize || file.size || 0,
                mimeType:
                  response?.fileType || file.type || "application/octet-stream",
              };
            })
          : undefined,
      contactPersonReviews:
        (isClosedWon(values.dealStage) || isClosedLost(values.dealStage)) &&
        values.contactPersonReviews
          ? values.contactPersonReviews.map((review) => ({
              contactPersonUUID: review.hcoContactUUID || "", // Ensure UUID is present
              rating: review.rating,
              comment: review.comment,
            }))
          : undefined,
    };

    updateDealStage(payload, {
      onSuccess: () => {
        closeModal();
      },
    });
  };

  const computeInitialValues = (): stageValues => {
    // If a stage is selected from the pill steps, use it. Otherwise use the current deal stage.
    // The modal opens when a pill is clicked, so selectedStageFromPill should be set.
    const stageToUse = selectedStageFromPill || currentStageUUID;

    return {
      dealStage: stageToUse,
      reason: "",
      proof: [],
      lossReason: undefined,
      contactPersonReviews: contactPersons.map((contact) => ({
        hcoContactUUID: contact.hcoContactUUID,
        fullName: contact.fullName,
        role: contact.role,
        rating: 0,
        comment: "",
      })),
    };
  };

  // Convert stages to steps format with enhanced styling
  const currentStepIndex = dealStages.findIndex(
    (s) => s.dealStageUUID === currentStageUUID
  );

  const stepsItems: StepsProps["items"] = dealStages.map((s, index) => {
    const isCurrent = s.dealStageUUID === currentStageUUID;
    const isCompleted = index < currentStepIndex;
    const stageProps = getStageProperties(s.dealStageName);

    // Custom icon with check for completed stages
    const StepIcon = () => {
      if (isCompleted) {
        return (
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full"
            style={{ background: stageProps.bgColor }}
          >
            <Check color="white" size={20} strokeWidth={3} />
          </div>
        );
      }

      return (
        <div
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300"
          style={{
            background: isCurrent ? stageProps.bgColor : "#f3f4f6",
            boxShadow: isCurrent ? `0 0 0 4px ${stageProps.color}20` : "none",
          }}
        >
          {cloneElement(stageProps.icon, {
            color: isCurrent ? "white" : "#9ca3af",
            size: 20,
          })}
        </div>
      );
    };

    return {
      title: (
        <div className="flex flex-col items-center">
          <span
            className={`text-sm font-medium transition-colors ${
              isCurrent ? "font-bold" : ""
            }`}
            style={{
              color: isCurrent
                ? stageProps.color
                : isCompleted
                ? "#374151"
                : "#9ca3af",
            }}
          >
            {s.dealStageName}
          </span>
        </div>
      ),
      icon: <StepIcon />,
    };
  });

  return (
    <>
      <style>{`
        /* Panel type specific styling */
        .ant-steps-item {
          cursor: pointer;
        }

        .ant-steps-item-container {
          transition: all 0.3s ease;
        }

        .ant-steps-item:hover .ant-steps-item-container {
          transform: translateY(-2px);
        }

        .ant-steps-item-icon {
          width: auto !important;
          height: auto !important;
          line-height: 1 !important;
          border: none !important;
          background: transparent !important;
          margin-inline-end: 0 !important;
        }

        .ant-steps-item-content {
          margin-top: 8px !important;
        }

        .ant-steps-item-title {
          line-height: 1.4 !important;
          font-size: 14px !important;
        }

        /* Panel backgrounds */
        .ant-steps-item-wait .ant-steps-item-container {
          background: #f9fafb !important;
          border: 1px solid #e5e7eb !important;
        }

        .ant-steps-item-finish .ant-steps-item-container {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important;
          border: 1px solid #86efac !important;
        }

        .ant-steps-item-process .ant-steps-item-container {
          border: 2px solid currentColor !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>

        {isCurrentStageClosed && (
          <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  Deal is Closed
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This deal is in <strong>{currentStageName}</strong> stage. Stage changes are not allowed for closed deals.
                </p>
              </div>
            </div>
          </div>
        )}
      <div className="bg-white dark:bg-gray-800 rounded-lg">
        
        <Steps
          type="navigation"
          current={currentStepIndex}
          items={stepsItems}
          onChange={(current) => {
            if (!isCurrentStageClosed) {
              openForStage(dealStages[current].dealStageUUID);
            }
          }}
          className={`mb-6 ${isCurrentStageClosed ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
      </div>

      <Modal
        title={
          <div className="flex items-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
              style={{
                background: selectedStageName
                  ? getStageProperties(selectedStageName).bgColor
                  : "#f3f4f6",
              }}
            >
              {selectedStageName && (
                <div style={{ color: "white" }}>
                  {getStageProperties(selectedStageName).icon}
                </div>
              )}
            </div>
            <Title level={5} className="m-0">
              Change Stage to <strong>{selectedStageName}</strong>
            </Title>
          </div>
        }
        open={open}
        onCancel={closeModal}
        footer={null}
        width={1000}
        maskClosable={false}
        destroyOnHidden
      >
        <Formik
          enableReinitialize
          initialValues={computeInitialValues()}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, errors, handleSubmit }) => {
            return (
              <Form onSubmit={handleSubmit}>
                {isClosedLost(values.dealStage) && (
                  <div className="mb-4">
                    <Label text="Loss Reason" required />
                    <CustomSelect
                      name="lossReason"
                      showSearch={{
                        optionFilterProp: "label",
                      }}
                      options={lossReasons.map((reason) => ({
                        label: reason.lossReasonName,
                        value: reason.lossReasonUUID,
                      }))}
                    />
                  </div>
                )}
                {isClosedWon(values.dealStage) && (
                  <div className="mb-4 relative">
                    <Label text="Attach A Proof" required />
                    <FileUploader
                      uploadUrl={APIPATH.FILEUPLOAD}
                      data={{
                        moduleName: "dealProof",
                      }}
                      maxCount={3}
                      multiple
                      onChange={(files) => {
                        // Fix: Ensure we pass an array of files to Formik
                        const fileArray = Array.isArray(files)
                          ? files
                          : [files];
                        setFieldValue("proof", fileArray);
                      }}
                    />
                    {errors.proof && (
                      <div className="field-error !left-0">
                        {errors.proof as string}
                      </div>
                    )}
                  </div>
                )}

                {/* Contact Person Reviews Section for Closed Won or Closed Lost */}
                {(isClosedWon(values.dealStage) ||
                  isClosedLost(values.dealStage)) && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label
                        text={`Contact Person Reviews (${values.contactPersonReviews?.length} Contacts)`}
                      />
                      <Button
                        type="default"
                        onClick={() => refetch()}
                        disabled={isLoading||isFetching}
                        size="small"
                        icon={
                          <RefreshCw
                            size={16}
                            className={isLoading||isFetching ? "animate-spin" : ""}
                          />
                        }
                      >Refresh</Button>
                    </div>

                    {values.contactPersonReviews &&
                    values.contactPersonReviews.length > 0 ? (
                      <AppScrollbar className="bg-gray-50 dark:bg-gray-900 rounded-lg h-[300px] overflow-y-auto">
                        <FieldArray name="contactPersonReviews">
                          {() => (
                            <div className="space-y-4">
                              {values.contactPersonReviews?.map(
                                (
                                  review: ContactPersonReview,
                                  index: number
                                ) => (
                                  <div
                                    key={`contact-review-${review.hcoContactUUID}-${index}`}
                                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                          {review.fullName}
                                        </h4>
                                        {review.role && (
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {review.role}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <div className="mb-3">
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Rating
                                      </label>
                                      <Field
                                        name={`contactPersonReviews.${index}.rating`}
                                      >
                                        {({ field, form }: any) => (
                                          <Rate
                                            count={5}
                                            value={field.value || 0}
                                            onChange={(value) => {
                                              form.setFieldValue(
                                                field.name,
                                                value
                                              );
                                            }}
                                            className="text-2xl"
                                          />
                                        )}
                                      </Field>
                                      <ErrorMessage
                                        name={`contactPersonReviews.${index}.rating`}
                                      >
                                        {(msg) => (
                                          <div className="text-red-500 text-xs mt-1">
                                            {msg}
                                          </div>
                                        )}
                                      </ErrorMessage>
                                    </div>

                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Comment
                                      </label>
                                      <Field
                                        name={`contactPersonReviews.${index}.comment`}
                                      >
                                        {({ field, meta }: any) => (
                                          <>
                                            <TextArea
                                              {...field}
                                              rows={3}
                                              maxLength={500}
                                              showCount
                                              placeholder={`Share your feedback about ${review.fullName}...`}
                                              className="w-full"
                                            />
                                            {meta.error && meta.touched && (
                                              <span className="field-error">
                                                {meta.error}
                                              </span>
                                            )}
                                          </>
                                        )}
                                      </Field>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </FieldArray>
                      </AppScrollbar>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
                        <Empty
                          description="No contact persons founded For this deal"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="relative">
                  <Label text="Reason For change" required />
                  <Field name="reason">
                    {({ field, meta }: any) => (
                      <>
                        <TextArea
                          {...field}
                          rows={4}
                          placeholder="Explain why you're changing the stage..."
                        />
                        {meta.error && meta.touched && (
                          <span className="field-error">{meta.error}</span>
                        )}
                      </>
                    )}
                  </Field>
                </div>

                <div className="flex justify-end gap-2 mt-8">
                  <Button onClick={closeModal}>Cancel</Button>
                  <Button type="primary" htmlType="submit" loading={isUpdating}>
                    Update Stage
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </Modal>
    </>
  );
};

export default StageChangeModal;
