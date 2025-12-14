'use client'
import React, { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input as InputBox} from "antd";
import { Mail } from "lucide-react";
import Label from "@/components/Label/Label";
const ForgetPassword = () => {
  const router = useRouter()
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/auth/otp-verification')
  }
  const [email, setEmail] = useState('')
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Image className="w-auto max-w-[250px] mb-5" src={'/market-access/images/brand-logo.svg'} height={100} width={100} alt="logo" />
      <div className="mb-10">
        <h1 className="text-2xl font-semibold mb-3 text-center">Forget Password</h1>
        <span className="text-gray-500 text-base">We'll send you a OTP to reset your password</span>
      </div>
      <form className="sm:w-[480px] w-auto max-w-[480px]" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label text="Email" />
          <InputBox prefix={<Mail size={18} />} value={email} size="large"  placeholder="Enter Your Email" onChange={(e:any) => setEmail(e.target.value)} name="email" type="email" required />
    
        </div>
        <div>
          <button className="w-full rounded-md p-2 cursor-pointer font-semibold bg-primary text-white mt-3">Send OTP</button>
        </div>
        <div className="flex items-center justify-center mt-3">
          <Link className="text-primary font-semibold" href="/auth/login">Back to Login</Link>
        </div>

      </form>
    </div>
  );
};

export default ForgetPassword;
