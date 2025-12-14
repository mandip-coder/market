'use client'
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { Button, Input, Checkbox, Form } from "antd";
import { Mail, User, Building } from "lucide-react";
import Label from "@/components/Label/Label";
import { Formik, FormikProps, Form as FormikForm, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "@/components/AppToaster/AppToaster";

const SignupSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  username: Yup.string()
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .min(2, "Name must be at least 2 characters")
    .required('Name is required'),
  healthcare: Yup.string()
    .required('healthcare is required'),
  acceptedTerms: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
});

interface FormValues {
  email: string;
  username: string;
  healthcare: string;
  acceptedTerms: boolean;
}

const Signup = () => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  
  const handleSubmit = async (values: FormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    setLoading(true);
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
        toast.success(`OTP has been sent to ${values.email}`);
      }, 1000);
    }).then(() => {
      router.push("/auth/otp-verification");
      setSubmitting(false);
      setLoading(false);
    });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Image className="w-auto max-w-[250px] mb-2" src={'/market-access/images/brand-logo.svg'} height={100} width={100} alt="logo" />
      <div className="mb-5">
        <h1 className="text-2xl font-semibold mb-1 text-center">Create Account</h1>
        <span className="text-gray-500 text-base">Please fill in the details to create your account</span>
      </div>
      
      <Formik
        initialValues={{
          email: '',
          username: '',
          healthcare: '',
          acceptedTerms: false
        }}
        validationSchema={SignupSchema}
        onSubmit={handleSubmit}
      >
        {({ 
          values, 
          errors, 
          touched, 
          handleChange, 
          handleBlur, 
          isValid, 
          dirty,
          setFieldValue
        }: FormikProps<FormValues>) => (
          <FormikForm className="sm:w-[480px] w-auto max-w-[480px]">
            <div className="flex flex-col">
              <div className="mb-2">
                <Label text="Email" required/>
                <Input 
                  prefix={<Mail size={18} />} 
                  size="large"  
                  placeholder="Enter Your Email" 
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  status={touched.email && errors.email ? "error" : ""}
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              
              <div className="mb-2">
                <Label text="Name" required/>
                <Input 
                  prefix={<User size={18} />} 
                  size="large"  
                  placeholder="Enter Your Name" 
                  name="username"
                  value={values.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  status={touched.username && errors.username ? "error" : ""}
                />
                <ErrorMessage name="username" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              
              <div className="mb-2">
                <Label text="healthcare" required/>
                <Input 
                  prefix={<Building size={18} />} 
                  size="large"  
                  placeholder="Enter Your healthcare" 
                  name="healthcare"
                  value={values.healthcare}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  status={touched.healthcare && errors.healthcare ? "error" : ""}
                />
                <ErrorMessage name="healthcare" component="div" className="text-red-500 text-sm mt-1" />
              </div>
            </div>
            
            {/* Terms and Policy Checkbox */}
            <div className="mt-4 mb-4">
              <Checkbox 
                checked={values.acceptedTerms}
                onChange={(e) => setFieldValue('acceptedTerms', e.target.checked)}
                className="text-sm"
              >
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </Checkbox>
              <ErrorMessage name="acceptedTerms" component="div" className="text-red-500 text-sm mt-1" />
            </div>
            
            <div className="mt-3">
              <Button 
                size="large" 
                color="primary" 
                variant="solid" 
                disabled={!(isValid && dirty) || loading} 
                loading={loading} 
                htmlType="submit" 
                className="w-full"
              >
                Create Account
              </Button>
            </div>
            
            <div className="mt-4 text-center">
              <span className="text-gray-500">Already have an account? </span>
              <Link href="/auth/login" className="text-primary font-semibold">Sign In</Link>
            </div>
          </FormikForm>
        )}
      </Formik>
    </div>
  );
};

export default Signup;