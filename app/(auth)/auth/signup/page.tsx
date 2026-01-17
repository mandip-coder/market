'use client'
import { toast } from "@/components/AppToaster/AppToaster";
import AuthLogo from "@/components/AuthLogo/AuthLogo";
import Label from "@/components/Label/Label";
import { Button, Checkbox, Input } from "antd";
import { ErrorMessage, Formik, Form as FormikForm, FormikProps } from "formik";
import { Building, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import * as Yup from "yup";

const SignupSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  username: Yup.string()
    .matches(/^[a-zA-Z\\s]+$/, 'Name can only contain letters and spaces')
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
    <div className="h-full flex flex-col items-center justify-center border border-white/20 shadow-2xl p-6 md:p-10 rounded-3xl w-full max-w-lg bg-white/70 dark:bg-black/60 backdrop-blur-xl">
      <div className="mb-4 text-center pb-1">
        <AuthLogo />
      </div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-1 text-gray-800 dark:text-white">Create Account</h1>
        <span className="text-gray-600 font-medium text-sm md:text-base dark:text-gray-300">Please fill in the details to create your account</span>
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
          <FormikForm className="w-full space-y-4">
            <div className="space-y-4">
              <div>
                <Label text="Email" className="!text-gray-700 dark:!text-gray-200 font-medium mb-1.5" required />
                <Input
                  prefix={<Mail size={18} className="text-gray-400 group-hover:text-primary transition-colors" />}
                  size="middle"
                  placeholder="Enter Your Email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoFocus
                  status={touched.email && errors.email ? "error" : ""}
                  className="rounded-xl py-2.5 dark:bg-gray-900/50 dark:border-gray-700 hover:border-primary focus:border-primary transition-all"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <Label text="Name" className="!text-gray-700 dark:!text-gray-200 font-medium mb-1.5" required />
                <Input
                  prefix={<User size={18} className="text-gray-400 group-hover:text-primary transition-colors" />}
                  size="middle"
                  placeholder="Enter Your Name"
                  name="username"
                  value={values.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  status={touched.username && errors.username ? "error" : ""}
                  className="rounded-xl py-2.5 dark:bg-gray-900/50 dark:border-gray-700 hover:border-primary focus:border-primary transition-all"
                />
                <ErrorMessage name="username" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <Label text="Healthcare" className="!text-gray-700 dark:!text-gray-200 font-medium mb-1.5" required />
                <Input
                  prefix={<Building size={18} className="text-gray-400 group-hover:text-primary transition-colors" />}
                  size="middle"
                  placeholder="Enter Your Healthcare"
                  name="healthcare"
                  value={values.healthcare}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  status={touched.healthcare && errors.healthcare ? "error" : ""}
                  className="rounded-xl py-2.5 dark:bg-gray-900/50 dark:border-gray-700 hover:border-primary focus:border-primary transition-all"
                />
                <ErrorMessage name="healthcare" component="div" className="text-red-500 text-sm mt-1" />
              </div>
            </div>

            {/* Terms and Policy Checkbox */}
            <div className="mt-4">
              <Checkbox
                checked={values.acceptedTerms}
                onChange={(e) => setFieldValue('acceptedTerms', e.target.checked)}
                className="text-sm dark:text-gray-300"
              >
                <span className="text-gray-700 dark:text-gray-300">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </span>
              </Checkbox>
              <ErrorMessage name="acceptedTerms" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <div className="pt-2">
              <Button
                size="middle"
                color="primary"
                variant="solid"
                disabled={!(isValid && dirty) || loading}
                loading={loading}
                htmlType="submit"
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:border-blue-600"
              >
                Create Account
              </Button>
            </div>

            <div className="flex justify-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
              <Link href="/auth/login" className="text-primary font-semibold hover:underline ml-1">Sign In</Link>
            </div>
          </FormikForm>
        )}
      </Formik>
    </div>
  );
};

export default Signup;