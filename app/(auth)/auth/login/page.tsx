"use client";
import { toast } from "@/components/AppToaster/AppToaster";
import AuthLogo from "@/components/AuthLogo/AuthLogo";
import Label from "@/components/Label/Label";
import { useLoading } from "@/hooks/useLoading";
import { signInAction } from "@/lib/actions/signIn";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Button, Input } from "antd";
import { Lock, User2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

// Email validation helper
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useLoading();
  const router = useRouter();
  const { update } = useSession();

  // Save email to sessionStorage on blur if valid
  const handleEmailBlur = () => {
    if (credentials.username && isValidEmail(credentials.username)) {
      sessionStorage.setItem('loginEmail', credentials.username);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signInAction({
      email: credentials.username,
      password: credentials.password,
    });

    if (res?.success) {
      // Clear stored email on successful login
      sessionStorage.removeItem('loginEmail');
      setLoading(false);
      update();
      router.push("/dashboard");
    } else {
      toast.error(res?.error);
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center border border-white/20 shadow-2xl p-8 md:p-12 rounded-3xl w-full max-w-lg bg-white/70 dark:bg-black/60 backdrop-blur-xl">
      <div className="mb-6 text-center pb-2">
        <AuthLogo />
      </div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
          Welcome Back
        </h1>
        <span className="text-gray-600 font-medium text-sm md:text-base dark:text-gray-300">
          Sign in to access your dashboard
        </span>
      </div>
      <form className="w-full space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <Label text="Email/Username" className="!text-gray-700 dark:!text-gray-200 font-medium mb-1.5" />
            <Input
              autoFocus
              prefix={<User2 size={18} className="text-gray-400 group-hover:text-primary transition-colors" />}
              size="middle"
              placeholder="Enter Your Email/Username"
              onChange={(e) =>
                setCredentials({ ...credentials, username: e.target.value })
              }
              onBlur={handleEmailBlur}
              name="username"
              type="text"
              value={credentials.username}
              className="rounded-xl py-2.5 dark:bg-gray-900/50 dark:border-gray-700 hover:border-primary focus:border-primary transition-all"
            />
          </div>
          <div>
            <Label text="Password" className="!text-gray-700 dark:!text-gray-200 font-medium mb-1.5" />
            <Input.Password
              prefix={<Lock size={18} className="text-gray-400 group-hover:text-primary transition-colors" />}
              size="middle"
              placeholder="Enter Your Password"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              name="password"
              value={credentials.password}
              className="rounded-xl py-2.5 dark:bg-gray-900/50 dark:border-gray-700 hover:border-primary focus:border-primary transition-all"
            />
            <div className="flex justify-end mt-2">
              <Link
                href="/auth/forget-password"
                className="text-primary text-sm font-semibold dark:text-blue-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button
            size="middle"
            color="primary"
            variant="solid"
            disabled={loading || !credentials.username || !credentials.password}
            loading={loading}
            htmlType="submit"
            className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:border-blue-600"
          >
            Sign In
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Login;
