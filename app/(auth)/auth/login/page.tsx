'use client'
import { toast } from "@/components/AppToaster/AppToaster";
import Label from "@/components/Label/Label";
import { useLoading } from "@/hooks/useLoading";
import { signInAction } from "@/lib/actions/signIn";
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Button, Input } from "antd";
import { Lock, User2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useLoading();
  const router = useRouter()
  const { update } = useSession()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signInAction({ email: credentials.username, password: credentials.password });


    if (res?.success) {
      setTimeout(() => {
        toast.success("Login successful");
        setLoading(false);
        update()
        router.push("/dashboard");
      }, 500)
    } else {
      toast.error(res?.error);
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center dark:bg-black w-full max-w-1/2">
      <div className="mb-5">
        <Image
          className="w-auto"
          src={'/market-access/images/logo.png'}
          height={100}
          width={300}
          alt="logo"
        />
      </div>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold mb-1 text-center dark:text-white">
          Sign In
        </h1>
        <span className="text-gray-500 text-base dark:text-gray-400">
          Sign in to your account
        </span>
      </div>
      <form
        className="w-full"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col mb-2">
          <div className="mb-2">
            <Label text="Email/Username" className="dark:text-gray-200" />
            <Input
              prefix={<User2 size={18} className="dark:text-gray-400" />}
              size="large"
              placeholder="Enter Your Email/Username"
              onChange={(e: any) => setCredentials({ ...credentials, username: e.target.value })}
              name="username"
              type="text"
              value={credentials.username}
            />
          </div>
          <Label text="Password" className="dark:text-gray-200" />
          <Input.Password
            prefix={<Lock size={18} className="dark:text-gray-400" />}
            required
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            size="large"
            value={credentials.password}
            placeholder="Enter Your Password"
            onChange={(e: any) => setCredentials({ ...credentials, password: e.target.value })}
            name="password"
          />
        </div>
        <div className="flex justify-between items-center">
          {/* <div className="flex items-center gap-2">
            <Checkbox className="dark:border-gray-600">
              <span className="font-semibold dark:text-gray-200">Remember for 30 days</span>
            </Checkbox>
          </div> */}
          {/* <Link 
            href="/auth/forget-password" 
            className="text-primary font-semibold dark:text-blue-400 hover:dark:text-blue-300"
          >
            Forgot Password?
          </Link> */}
        </div>
        <div className="mt-3">
          <Button
            size="large"
            color="primary"
            variant="solid"
            disabled={loading || !credentials.username || !credentials.password}
            loading={loading}
            htmlType="submit"
            className="w-full dark:bg-blue-600 dark:hover:bg-blue-700 dark:border-blue-600"
          >
            Sign In
          </Button>
        </div>
        {/* <div className="flex items-center justify-center mt-3">
          <span className="text-gray-500 text-base dark:text-gray-400">
            Don't have an account? 
            <Link 
              href="/auth/signup" 
              className="text-primary font-semibold dark:text-blue-400 hover:dark:text-blue-300 ml-1"
            >
              Sign Up
            </Link>
          </span>
        </div> */}
      </form>
    </div>
  );
};

export default Login;