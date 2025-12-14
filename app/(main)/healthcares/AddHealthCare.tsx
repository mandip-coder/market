'use client'
import ContactModal, { HCOContactPerson } from '@/components/AddNewContactModal/AddNewContactModal';
import { toast } from '@/components/AppToaster/AppToaster';
import { CardHeader } from '@/components/CardHeader/CardHeader';
import CustomSelect from '@/components/CustomSelect/CustomSelect';
import Input from '@/components/Input/Input';
import Label from '@/components/Label/Label';
import { useLoading } from '@/hooks/useLoading';
import { rowGutter } from '@/shared/constants/themeConfig';
import { Avatar, Button, Card, Col, Drawer, Modal, Row, Tooltip, Typography } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { City, Country, State } from 'country-state-city';
import { Form, Formik, FormikProps } from 'formik';
import { Building, Edit, Flag, Globe, Hash, Mail, MapPin, Phone, Plus, Save, Trash2, User, Users } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import * as Yup from "yup";

const HEALTHCARE_TYPES = ["NHS Trust", "Foundation Trust", "PCN"];

interface AddhealthcareDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function AddhealthcareDrawer({ open, onClose }: AddhealthcareDrawerProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<HCOContactPerson | null>(null);
  const [contactToDelete, setContactToDelete] = useState<HCOContactPerson | null>(null);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [noStatesAvailable, setNoStatesAvailable] = useState(false);
  const [noCitiesAvailable, setNoCitiesAvailable] = useState(false);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Healthcare name is required"),
    type: Yup.string().required("Healthcare type is required"),
    address: Yup.string().required("Address is required"),
    country: Yup.string().required("Country is required"),
    state: Yup.string().required("State/Province is required"),
    city: Yup.string().required("City is required"),
    phone1: Yup.number().typeError("Primary phone must be a number").required("Primary phone is required"),
    phone2: Yup.number().typeError("Secondary phone must be a number"),
    contacts: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required("HCOContactPerson name is required"),
        position: Yup.string().required("Position is required"),
      })
    ),
  });

  const [loading, setLoading] = useLoading();

  const handleSubmit = async (values: any, { resetForm }: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      resetForm();
      onClose();
      toast.success('Healthcare created successfully!');
    } catch (error) {
      console.error("Error creating Healthcare:", error);
      toast.error('Failed to create Healthcare. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setIsContactModalOpen(true);
  };

  const handleEditContact = (contact: HCOContactPerson) => {
    setEditingContact(contact);
    setIsContactModalOpen(true);
  };

  const handleDeleteContact = (contact: HCOContactPerson) => {
    setContactToDelete(contact);
  };

  const confirmDeleteContact = (values: any, setFieldValue: any) => {
    if (contactToDelete) {
      const updatedContacts = values.contacts.filter(
        (contact: HCOContactPerson) => contact.hcoContactUUID !== contactToDelete.hcoContactUUID
      );
      setFieldValue('contacts', updatedContacts);
      setContactToDelete(null);
      toast.success('HCOContactPerson deleted successfully!');
    }
  };

  const handleCountryChange = (value: string, setFieldValue: any) => {
    setSelectedCountry(value);
    setFieldValue('country', value);
    setFieldValue('state', '');
    setFieldValue('city', '');
    setSelectedState('');
    setNoCitiesAvailable(false);

    if (value) {
      const countryStates = State.getStatesOfCountry(value);
      setStates(countryStates);
      setCities([]);

      // Check if country has no states
      if (countryStates.length === 0) {
        setNoStatesAvailable(true);
        // Use country name as state and city
        const countryName = Country.getAllCountries().find(c => c.isoCode === value)?.name || '';
        setFieldValue('state', countryName);
        setFieldValue('city', countryName);
      } else {
        setNoStatesAvailable(false);
      }
    } else {
      setStates([]);
      setCities([]);
      setNoStatesAvailable(false);
    }
  };

  const handleStateChange = (value: string, setFieldValue: any) => {
    setSelectedState(value);
    setFieldValue('state', value);
    setFieldValue('city', '');

    if (value) {
      const stateCities = City.getCitiesOfState(selectedCountry, value);
      setCities(stateCities);

      // Check if state has no cities
      if (stateCities.length === 0) {
        setNoCitiesAvailable(true);
        // Use state name as city
        const stateName = states.find(s => s.isoCode === value)?.name || '';
        setFieldValue('city', stateName);
      } else {
        setNoCitiesAvailable(false);
      }
    } else {
      setCities([]);
      setNoCitiesAvailable(false);
    }
  };

  const addorgFormRef = useRef<FormikProps<any> | null>(null);

  return (
    <Drawer
      title={
        <span className=" font-semibold text-gray-800 dark:text-white">Add New Healthcare</span>
      }
      onClose={onClose}
      open={open}
      size={"large"}
      destroyOnHidden
      className="healthcare-drawer dark:bg-gray-800"
      footer={
        <Row justify="end">
          <Button
            type="primary"
            htmlType="submit"
            form='orgform'
            loading={loading}
            icon={<Save className="h-4 w-4" />}
          >
            Create Healthcare
          </Button>
        </Row>
      }
    >
      <Formik
        initialValues={{
          name: "",
          type: "",
          address: "",
          phone1: "",
          phone2: "",
          website: "",
          contacts: [],
          country: "",
          state: "",
          city: "",
          icbCode: "",
          healthcareCode: "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        innerRef={addorgFormRef}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => (
          <Form id='orgform'>
            <Row gutter={rowGutter}>
              <Row gutter={[16, 16]}>
                <Col xs={24}>
                  <Input
                    name="name"
                    label='Healthcare Name'
                    required
                    prefix={<Building className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                  />
                </Col>
                <Col xs={8}>
                  <CustomSelect
                    required
                    name="type"
                    label='Type'
                    placeholder="Select healthcare type"
                    options={HEALTHCARE_TYPES.map((type) => ({ label: type, value: type }))}
                  />
                </Col>
                <Col xs={8}>
                  <CustomSelect
                    required
                    name="country"
                    label='Country'
                    showSearch={
                      {
                        optionFilterProp: "label"
                      }
                    }
                    options={Country.getAllCountries().map(country => ({ label: country.name, value: country.isoCode }))}
                    value={selectedCountry}
                    onChange={(value) => handleCountryChange(value, setFieldValue)}
                    prefix={<Flag className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                  />
                </Col>
                <Col xs={8}>
                  <CustomSelect
                    required
                    name="state"
                    label='State/Province'
                    showSearch={
                      {
                        optionFilterProp: "label"
                      }
                    }
                    options={states.map(state => ({ label: state.name, value: state.isoCode }))}
                    onChange={(value) => handleStateChange(value, setFieldValue)}
                    disabled={!selectedCountry || noStatesAvailable}
                    prefix={<MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                  />
                </Col>
                <Col xs={8}>
                  {noCitiesAvailable ? (
                    <div className='relative'>
                      <Label text='City' required />
                      <Input
                        name="city"
                        value={values.city}
                        disabled
                        prefix={<MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                      />
                      <div className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                        Using state name as city (no cities available)
                      </div>
                    </div>
                  ) : (
                    <CustomSelect
                      required
                      name="city"
                      label='City'
                      options={cities.map(city => ({ label: city.name, value: city.name }))}
                      disabled={!selectedState}
                      prefix={<MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                    />
                  )}
                </Col>

                <Col xs={24}>
                  <div className='relative'>
                    <Label text='Address' required />
                    <TextArea
                      name="address"
                      rows={3}
                      required
                      onChange={handleChange}
                      onBlur={handleBlur}
                      status={touched.address && errors.address ? 'error' : undefined}
                      className="rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {touched.address && errors.address && <span className="field-error">{errors.address as any}</span>}
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <Input
                    name="icbCode"
                    label='ICB Code'
                    prefix={<Hash className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Input
                    name="healthcareCode"
                    label='Healthcare Code'
                    prefix={<Hash className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Input
                    name="phone1"
                    label='Primary Phone'
                    required
                    prefix={<Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Input
                    name="phone2"
                    label='Secondary Phone'
                    prefix={<Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                  />
                </Col>
                <Col xs={24}>
                  <Input
                    name="website"
                    label='Website'
                    placeholder="Enter website URL"
                    prefix={<Globe className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                  />
                </Col>
              </Row>

              <Col xs={24}>
                <Card
                  title={
                    <div className="flex justify-between items-center">
                      <CardHeader title="Contacts" />
                      <Button
                        type="primary"
                        size="small"
                        icon={<Plus className="h-4 w-4" />}
                        onClick={handleAddContact}
                        className="rounded-full px-4 dark:bg-blue-600 dark:hover:bg-blue-700"
                      >
                        Add HCOContactPerson
                      </Button>
                    </div>
                  }
                  size="small"
                  variant="borderless"
                >
                  {values.contacts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {values.contacts.map((contact: HCOContactPerson) => (
                        <div
                          key={contact.hcoContactUUID}
                          className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 dark:bg-gray-700 dark:border-gray-600"
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <Avatar
                                  size={40}
                                  icon={<User />}
                                  className="!bg-blue-100 !text-blue-600 dark:!bg-blue-900 dark:!text-blue-300"
                                />
                                <div>
                                  <Typography.Text strong className="text-base block dark:text-white">
                                    {contact.fullName}
                                  </Typography.Text>
                                  <div className="text-gray-500 text-sm dark:text-gray-400">
                                    {contact.role}
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Tooltip title="Edit">
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<Edit className="h-4 w-4" />}
                                    onClick={() => handleEditContact(contact)}
                                    className="text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/50 rounded-full p-2"
                                  />
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<Trash2 className="h-4 w-4" />}
                                    onClick={() => handleDeleteContact(contact)}
                                    className="text-gray-500 hover:text-red-500 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/50 rounded-full p-2"
                                  />
                                </Tooltip>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <Mail className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                                <Typography.Text className="text-sm dark:text-gray-300">
                                  {contact.email || <span className="text-gray-400 dark:text-gray-500">No email</span>}
                                </Typography.Text>
                              </div>
                              <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <Phone className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                                <Typography.Text className="text-sm dark:text-gray-300">
                                  {contact.phone || <span className="text-gray-400 dark:text-gray-500">No phone</span>}
                                </Typography.Text>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-400">
                      <div className="mb-2 p-2 bg-blue-100 rounded-full dark:bg-blue-900/50">
                        <Users className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                      </div>
                      <Typography.Text className="text-gray-600 mb-1 text-sm font-medium dark:text-gray-300">No contacts</Typography.Text>
                      <Typography.Text type="secondary" className="text-center text-xs mb-3 max-w-xs dark:text-gray-500">
                        Add contacts to this healthcare
                      </Typography.Text>
                      <Button
                        type="primary"
                        size="small"
                        icon={<Plus className="h-4 w-4" />}
                        onClick={handleAddContact}
                        className="rounded-full px-3 text-xs dark:bg-blue-600 dark:hover:bg-blue-700"
                      >
                        Add HCOContactPerson
                      </Button>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
            <ContactModal
              open={isContactModalOpen}
              onClose={() => setIsContactModalOpen(false)}
              onSave={(contact: any) => {
                if (editingContact) {
                  const updatedContacts = addorgFormRef.current?.values.contacts.map((c: HCOContactPerson) =>
                    c.hcoContactUUID === editingContact.hcoContactUUID ? { ...contact, id: editingContact.hcoContactUUID } : c
                  );
                  addorgFormRef.current?.setFieldValue("contacts", updatedContacts);
                } else {
                  const newContact = { ...contact, id: Date.now().toString() };
                  addorgFormRef.current?.setFieldValue("contacts", [
                    ...addorgFormRef.current?.values.contacts,
                    newContact,
                  ]);
                }
                setIsContactModalOpen(false);
                setEditingContact(null);
              }}
              initialContact={editingContact}
              requireHelthcareId={false}
            />

            <Modal
              title={
                <div className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-500 dark:text-red-400" />
                  <span className="dark:text-white">Confirm Delete</span>
                </div>
              }
              open={!!contactToDelete}
              onOk={() => confirmDeleteContact(values, setFieldValue)}
              onCancel={() => setContactToDelete(null)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              className="delete-confirm-modal dark:bg-gray-800 dark:text-white"
            >
              <p className="text-gray-700 dark:text-gray-300">Are you sure you want to delete the contact <span className="font-semibold dark:text-white">"{contactToDelete?.fullName}"</span>?</p>
              <p className="text-gray-500 text-sm mt-2 dark:text-gray-400">This action cannot be undone.</p>
            </Modal>
          </Form>
        )}
      </Formik>
    </Drawer>
  )
}