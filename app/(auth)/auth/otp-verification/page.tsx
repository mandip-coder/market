"use client";
import { toast } from "@/components/AppToaster/AppToaster";
import AuthLogo from "@/components/AuthLogo/AuthLogo";
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Button, Input, Result, Spin } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Helper function to obscure email
const obscureEmail = (email: string): string => {
  if (!email) return '';
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;

  // Show first 2 characters and last 1 character of local part
  const visibleStart = localPart.slice(0, 2);
  const visibleEnd = localPart.slice(-1);
  const obscuredPart = '*'.repeat(Math.max(3, localPart.length - 3));

  return `${visibleStart}${obscuredPart}${visibleEnd}@${domain}`;
};

const RESENDTIME = 5;
const VerifyOTP = () => {
  const [otp, setOtp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(RESENDTIME);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [email, setEmail] = useState<string>('');
  const router = useRouter();

  // Retrieve email from sessionStorage
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('loginEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleSubmit = useCallback(() => {
    if (!otp || otp.length < 6) {
      toast.error("Please enter a complete 6-digit OTP");
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate API call with random success/failure
    new Promise(() => {
      setTimeout(() => {
        // For testing: "123456" is always correct, others have 30% success rate
        const isSuccess = otp === "123456"
        if (isSuccess) {
          setIsVerified(true);
          setLoading(false);
          toast.success("OTP verified successfully!");

          setTimeout(() => {
            router.push('/auth/reset-password');
          }, 1000);
        } else {
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          setLoading(false);

          if (newAttempts >= 3) {
            setError("Too many failed attempts. Please request a new OTP.");
            setCanResend(true);
            setTimer(0);
          } else {
            setError(`Invalid OTP. ${3 - newAttempts} attempts remaining.`);
          }
          setOtp("");
        }
      }, 2000);
    });
  }, [otp, attempts, router]);

  useEffect(() => {
    if (otp.length === 6 && !loading && !isVerified) {
      handleSubmit();
    }
  }, [otp, loading, isVerified, handleSubmit]);

  const handleResend = () => {
    setResendLoading(true);
    setOtp("");
    setError(null);
    setAttempts(0);

    new Promise(() => {
      setTimeout(() => {
        toast.success("A new OTP has been sent to your email");
        setTimer(RESENDTIME);
        setCanResend(false);
        setResendLoading(false);
      }, 1500);
    });
  };

  // Format time to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col items-center justify-center border border-white/20 shadow-2xl p-8 md:p-12 rounded-3xl w-full max-w-lg bg-white/70 dark:bg-black/60 backdrop-blur-xl">
      {/* Header with logo */}
      <div className="mb-6 text-center pb-2">
        <AuthLogo />
      </div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">OTP Verification</h1>
        <span className="text-gray-600 font-medium text-sm md:text-base dark:text-gray-300">
          Enter the OTP sent to {email ? <span className="font-semibold text-primary">{obscureEmail(email)}</span> : 'your email'}
        </span>
      </div>

      {/* Main content */}
      <div className="w-full">
        {loading ? (
          <div className="py-10 flex flex-col items-center justify-center">
            <Spin size="large" />
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-6 animate-pulse">Verifying your OTP...</p>
          </div>
        ) : isVerified ? (
          <Result
            icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
            title={<span className="dark:text-white">OTP Verified</span>}
            subTitle={<span className="dark:text-gray-300">Redirecting to reset password...</span>}
          />
        ) : (
          <>
            <div className="mb-8 text-center flex flex-col items-center">
              <Input.OTP
                size="large"
                length={6}
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  if (error) setError(null);
                }}
                autoFocus
                disabled={loading || attempts >= 3}
                status={error ? "error" : ""}
                className="custom-otp-input mb-2 [&_input]:!rounded-lg"
              />

              {error && (
                <div className="mt-2 text-red-500 text-sm flex items-center justify-center">
                  <CloseCircleOutlined className="mr-1" />
                  {error}
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-3">Didn't receive the code?</p>

              {/* Timer progress */}
              {!canResend ? (
                <div className="mb-4">
                  <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <ClockCircleOutlined className="mr-1" />
                    <span>Resend available in: {formatTime(timer)}</span>
                  </div>
                </div>
              ) : null}

              <Button
                type="link"
                className={`p-0 h-auto font-semibold ${canResend ? 'text-primary' : 'text-gray-400'}`}
                onClick={handleResend}
                disabled={!canResend || resendLoading}
                loading={resendLoading}
              >
                Resend OTP
              </Button>
            </div>
          </>
        )}

        <div className="flex items-center justify-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            className="text-primary font-semibold flex items-center hover:underline transition-all"
            href="/auth/login"
            onClick={() => sessionStorage.removeItem('loginEmail')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;