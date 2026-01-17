'use client'
import AuthLogo from "@/components/AuthLogo/AuthLogo";
import Label from "@/components/Label/Label";
import { isValidEmail } from "@/Utils/helpers";
import { Button, Input } from "antd";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

const ForgetPassword = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('')

  // Auto-fill email from sessionStorage
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('loginEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      router.push('/auth/otp-verification');
      if (email && isValidEmail(email)) {
        sessionStorage.setItem('loginEmail', email);
      }
    }, 1000);
  }

  return (
    <div className="h-full flex flex-col items-center justify-center border border-white/20 shadow-2xl p-8 md:p-12 rounded-3xl w-full max-w-lg bg-white/70 dark:bg-black/60 backdrop-blur-xl">
      <div className="mb-6 text-center pb-2">
        <AuthLogo />
      </div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Forget Password?</h1>
        <span className="text-gray-600 font-medium text-sm md:text-base dark:text-gray-300">We'll send you a OTP to reset your password</span>
      </div>
      <form className="w-full space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <Label text="Email" className="!text-gray-700 dark:!text-gray-200 font-medium mb-1.5" required />
            <Input
              prefix={<Mail size={18} className="text-gray-400 group-hover:text-primary transition-colors" />}
              value={email}
              size="middle"
              placeholder="Enter Your Email"
              onChange={(e: any) => setEmail(e.target.value)}
              name="email"
              type="email"
              autoFocus
              className="rounded-xl py-2.5 dark:bg-gray-900/50 dark:border-gray-700 hover:border-primary focus:border-primary transition-all"
            />
          </div>
        </div>
        <div className="pt-4">
          <Button
            size="middle"
            color="primary"
            variant="solid"
            loading={loading}
            htmlType="submit"
            className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:border-blue-600"
          >
            Send OTP
          </Button>
        </div>
        <div className="flex items-center justify-center mt-6">
          <Link className="text-primary font-semibold dark:text-blue-400 hover:underline flex items-center gap-1" href="/auth/login">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgetPassword;
