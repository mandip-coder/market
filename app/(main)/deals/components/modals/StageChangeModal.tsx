'use client';

import AddNewContactModal, { HCOContactPerson } from '@/components/AddNewContactModal/AddNewContactModal';
import CustomSelect from '@/components/CustomSelect/CustomSelect';
import FileUploader from '@/components/Fileuploader/Fileuploader';
import Label from '@/components/Label/Label';
import { Button, Input, Modal, Rate, Steps, Typography } from 'antd';
import { StepsProps } from 'antd/lib';
import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik';
import {
  Check,
  DollarSign,
  MessageCircle,
  Plus,
  Search,
  Trophy,
  XCircle
} from 'lucide-react';
import { cloneElement, useMemo, useRef, useState } from 'react';
import * as Yup from 'yup';
import { stageValues, useDealStore } from '@/context/store/dealsStore';
import { Stage, STAGE_LABELS, stages } from '@/lib/types';

const { TextArea } = Input;
const { Title } = Typography;

const lossReasons = [
  { value: 'price', label: 'Price / Budget' },
  { value: 'competitor', label: 'Competitor won' },
  { value: 'no-response', label: 'No response from client' },
  { value: 'internal', label: 'Internal decision / freeze' },
  { value: 'other', label: 'Other' },
];

const StageChangeModal = () => {
  const { dealStage: currentStage, setStage, contactPersons, setContactPersons, hcoDetails } = useDealStore();
  const [open, setOpen] = useState(false);
  const [selectedStageFromPill, setSelectedStageFromPill] = useState<stages | null>(currentStage);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const orderedStages: stages[] = useMemo(() => [Stage.DISCUSSION, Stage.NEGOTIATION, Stage.CLOSED_WON, Stage.CLOSED_LOST], []);
  const getStageProperties = (stage: stages) => {
    switch (stage) {
      case Stage.DISCUSSION:
        return {
          icon: <MessageCircle size={20} />,
          color: '#06b6d4',
          bgColor: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        };
      case Stage.NEGOTIATION:
        return {
          icon: <DollarSign size={20} />,
          color: '#f59e0b',
          bgColor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        };
      case Stage.CLOSED_WON:
        return {
          icon: <Trophy size={20} />,
          color: '#10b981',
          bgColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        };
      case Stage.CLOSED_LOST:
        return {
          icon: <XCircle size={20} />,
          color: '#ef4444',
          bgColor: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        };
      default:
        return {
          icon: <Search size={20} />,
          color: '#6b7280',
          bgColor: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
        };
    }
  };

  const openForStage = (stageValue: stages) => {
    if (stageValue === currentStage) {
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
    stage: Yup.string()
      .required('Please select a stage')
      .test('different', 'Please select a different stage', (val) => val !== currentStage),
    reason: Yup.string().required('Reason is required'),
    lossReason: Yup.string().when('stage', {
      is: Stage.CLOSED_LOST,
      then: (schema: Yup.StringSchema) => schema.required('Reason is required'),
      otherwise: (schema: Yup.StringSchema) => schema
    }),
   proof: Yup.array()
    .of(
      Yup.mixed<File>()
        .required('File is required')
    )
    .when('stage', {
      is: Stage.CLOSED_WON,
      then: (schema) =>
        schema.min(1, 'At least one file is required').required('Proof is required').max(3, 'You can upload a maximum of 3 files'),
      otherwise: (schema) => schema.notRequired(),
    }),
    contactPersonReviews: Yup.array().of(
      Yup.object().shape({
        contactPersonId: Yup.string(),
        rating: Yup.number().min(0).max(5),
        comment: Yup.string()
      })
    ).notRequired()
  });

  const handleSubmit = (values: stageValues) => {
    setStage(values);
    closeModal();
  };

  const formikRef = useRef<any>(null);

  const handleAddNewContact = async (contactData: HCOContactPerson) => {
    setContactPersons([...contactPersons, contactData]);
    
    // Update Formik field values immediately
    if (formikRef.current) {
      const currentReviews = formikRef.current.values.contactPersonReviews || [];
      const newReview = {
        contactPersonId: contactData.hcoContactUUID,
        contactPersonName: contactData.fullName,
        role: contactData.role,
        rating: 0,
        comment: ''
      };
      formikRef.current.setFieldValue('contactPersonReviews', [...currentReviews, newReview]);
    }
    
    setIsAddContactModalOpen(false);
  };

  const computeInitialValues = (): stageValues => {
    const stageToUse = selectedStageFromPill ?? currentStage;
    const { contactPersons } = useDealStore.getState();
    
    return {
      dealStage: stageToUse,
      reason: '',
      lossReason: undefined,
      contactPersonReviews: contactPersons.map(contact => ({
        contactPersonId: contact.hcoContactUUID,
        contactPersonName: contact.fullName,
        role: contact.role,
        rating: 0,
        comment: ''
      }))
    };
  };

  // Convert stages to steps format with enhanced styling
  const currentStepIndex = orderedStages.findIndex(s => s === currentStage);

  const stepsItems: StepsProps['items'] = orderedStages.map((s, index) => {
    const isCurrent = s === currentStage;
    const isCompleted = index < currentStepIndex;
    const stageProps = getStageProperties(s);

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
            background: isCurrent ? stageProps.bgColor : '#f3f4f6',
            boxShadow: isCurrent ? `0 0 0 4px ${stageProps.color}20` : 'none'
          }}
        >
          {cloneElement(stageProps.icon, {
            color: isCurrent ? 'white' : '#9ca3af',
            size: 20
          })}
        </div>
      );
    };

    return {
      title: (
        <div className="flex flex-col items-center">
          <span
            className={`text-sm font-medium transition-colors ${isCurrent ? 'font-bold' : ''
              }`}
            style={{
              color: isCurrent ? stageProps.color : isCompleted ? '#374151' : '#9ca3af'
            }}
          >
            {STAGE_LABELS[s]}
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

      <div className='bg-white dark:bg-gray-800 rounded-lg'>

        <Steps
          type='navigation'
          current={currentStepIndex}
          items={stepsItems}
          onChange={(current) => openForStage(orderedStages[current])}
          className="mb-6"
        />
      </div>

      <Modal
        title={
          <div className="flex items-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
              style={{ background: selectedStageFromPill ? getStageProperties(selectedStageFromPill).bgColor : '#f3f4f6' }}
            >
              {selectedStageFromPill && (
                <div style={{ color: 'white' }}>
                  {getStageProperties(selectedStageFromPill).icon}
                </div>
              )}
            </div>
            <Title level={5} className="m-0">
              Change Stage to <strong>{selectedStageFromPill && STAGE_LABELS[selectedStageFromPill]}</strong>
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
          innerRef={formikRef}
          enableReinitialize
          initialValues={computeInitialValues()}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, errors, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>

              {values.dealStage === Stage.CLOSED_LOST && (
                <div className="mb-4">
                  <Label text='Loss Reason' required />
                  <CustomSelect
                    name="lossReason"
                    options={lossReasons}
                  />
                </div>
              )}
              {values.dealStage === Stage.CLOSED_WON && (
                <div className="mb-4 relative">
                  <Label text='Attach A Proof' required />
                  <FileUploader 
                    maxCount={3} 
                    multiple 
                    onChange={(files) => {
                      // Fix: Ensure we pass an array of files to Formik
                      const fileArray = Array.isArray(files) ? files : [files];
                      setFieldValue('proof', fileArray);
                    }} 
                  />
                  {errors.proof && <div className="field-error !left-0">{errors.proof as string}</div>}
                </div>
              )}

              {/* Contact Person Reviews Section for Closed Won or Closed Lost */}
              {(values.dealStage === Stage.CLOSED_WON || values.dealStage === Stage.CLOSED_LOST) && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label text='Contact Person Reviews (Optional)' />
                    <Button 
                      type="dashed" 
                      size="small"
                      icon={<Plus size={16} />}
                      onClick={() => setIsAddContactModalOpen(true)}
                    >
                      Add Contact
                    </Button>
                  </div>
                  
                  {values.contactPersonReviews && values.contactPersonReviews.length > 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <FieldArray name="contactPersonReviews">
                        {() => (
                          <div className="space-y-4">
                            {values.contactPersonReviews?.map((review: any, index: number) => (
                              <div key={`contact-review-${review.contactPersonId}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                      {review.contactPersonName}
                                    </h4>
                                    {review.role && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400">{review.role}</p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="mb-3">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Rating
                                  </label>
                                  <Field name={`contactPersonReviews.${index}.rating`}>
                                    {({ field, form }: any) => (
                                      <Rate
                                        count={5}
                                        value={field.value || 0}
                                        onChange={(value) => {
                                          form.setFieldValue(field.name, value);
                                        }}
                                        className="text-2xl"
                                      />
                                    )}
                                  </Field>
                                  <ErrorMessage name={`contactPersonReviews.${index}.rating`}>
                                    {(msg) => <div className="text-red-500 text-xs mt-1">{msg}</div>}
                                  </ErrorMessage>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Comment
                                  </label>
                                  <Field name={`contactPersonReviews.${index}.comment`}>
                                    {({ field }: any) => (
                                      <TextArea
                                        {...field}
                                        rows={3}
                                        placeholder={`Share your feedback about ${review.contactPersonName}...`}
                                        className="w-full"
                                      />
                                    )}
                                  </Field>
                                  <ErrorMessage name={`contactPersonReviews.${index}.comment`}>
                                    {(msg) => <div className="text-red-500 text-xs mt-1">{msg}</div>}
                                  </ErrorMessage>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </FieldArray>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        No contact persons found for this deal.
                      </p>
                      <Button 
                        type="primary"
                        icon={<Plus size={16} />}
                        onClick={() => setIsAddContactModalOpen(true)}
                      >
                        Add Contact Person
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="relative">
                <Label text='Reason For change' required />
                <Field name="reason">
                  {({ field }: any) => <TextArea {...field} rows={4} placeholder="Explain why you're changing the stage..." />}
                </Field>
                <span className="field-error"><ErrorMessage name="reason" /></span>
              </div>

              <div className="flex justify-end gap-2 mt-8">
                <Button onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                >
                  Update Stage
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Add New Contact Modal */}
      <AddNewContactModal
        open={isAddContactModalOpen}
        onClose={() => setIsAddContactModalOpen(false)}
        onSave={handleAddNewContact}
        requireHelthcareId={true}
        hcoUUID={hcoDetails.hcoUUID}
        hcoName={hcoDetails.hcoName}
      />
    </>
  );
};

export default StageChangeModal;