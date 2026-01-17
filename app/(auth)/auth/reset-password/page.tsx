"use client";
import React, { useState, useEffect, useRef } from "react";


import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "antd";
import { Lock, Check, X, Eye, EyeOff, Shield } from "lucide-react";
import Label from "@/components/Label/Label";
import AuthLogo from "@/components/AuthLogo/AuthLogo";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { isValidEmail } from "@/Utils/helpers";

const ResetPassword = () => {
  const router = useRouter();
  const isMountedRef = useRef(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const [passwordMatch, setPasswordMatch] = useState(true);

  // Security check: Redirect to login if no valid email in sessionStorage
  useEffect(() => {
    const handleUnload = () => {
      sessionStorage.removeItem('loginEmail');
    };

    const storedEmail = sessionStorage.getItem('loginEmail') || '';
    if (!storedEmail || !isValidEmail(storedEmail)) {
      router.replace('/auth/login');
    }

    // Add event listener for hard refreshes/manual URL entry
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      sessionStorage.removeItem('loginEmail');
    };
  }, [router]);

  // Password validation criteria
  const validationCriteria = [
    { id: 'length', label: '8+ characters', test: (pwd: string) => pwd.length >= 8 },
    { id: 'uppercase', label: 'Uppercase', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { id: 'lowercase', label: 'Lowercase', test: (pwd: string) => /[a-z]/.test(pwd) },
    { id: 'number', label: 'Number', test: (pwd: string) => /[0-9]/.test(pwd) },
    { id: 'specialChar', label: 'Special char', test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd) },
  ];

  // Validate password and update state
  useEffect(() => {
    const errors = {
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      specialChar: /[^A-Za-z0-9]/.test(newPassword),
    };

    setPasswordErrors(errors);

    // Calculate password strength (0-5)
    const strength = Object.values(errors).filter(Boolean).length;
    setPasswordStrength(strength);

    // Check if passwords match
    if (confirmPassword) {
      setPasswordMatch(newPassword === confirmPassword);
    }
  }, [newPassword, confirmPassword]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if all validations pass
    const allValid = Object.values(passwordErrors).every(Boolean) && passwordMatch;

    if (allValid) {
      // Clear stored email after successful password reset
      sessionStorage.removeItem('loginEmail');
      router.replace("/auth/login");
    }
  };

  // Get strength color
  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    if (passwordStrength === 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const strengthColor = getStrengthColor();

  return (
    <div className="h-full flex flex-col items-center justify-center border border-white/20 shadow-2xl p-6 md:p-10 rounded-3xl w-full max-w-lg bg-white/70 dark:bg-black/60 backdrop-blur-xl">
      <div className={`text-center ${newPassword ? 'mb-2 pb-0' : 'mb-4 pb-1'}`}>
        <AuthLogo />
      </div>
      <div className={`text-center ${newPassword ? 'mb-3' : 'mb-6'}`}>
        <h1 className={`font-bold text-gray-800 dark:text-white ${newPassword ? 'text-xl mb-0.5' : 'text-2xl mb-1'}`}>Reset Password</h1>
        <span className="text-gray-600 font-medium text-sm md:text-base dark:text-gray-300">Create a new password for your account</span>
      </div>

      <div className="w-full">
        <form onSubmit={handleSubmit} className={newPassword ? 'space-y-2' : 'space-y-4'}>
          <div>
            <Label text="New Password" className="!text-gray-700 dark:!text-gray-200 font-medium mb-1.5" required />
            <div className="relative mt-1">
              <Input.Password
                prefix={<Lock size={18} className="text-gray-400 group-hover:text-primary transition-colors" />}
                size="middle"
                placeholder="Enter Your Password"
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword}
                className="rounded-xl py-2.5 dark:bg-gray-900/50 dark:border-gray-700 hover:border-primary focus:border-primary transition-all"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </div>

            {/* Password strength indicator - subtle design */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <Shield size={14} className="mr-1" />
                    Password strength
                  </span>
                  <span className={`text-xs font-bold ${strengthColor.replace('bg-', 'text-')}`}>
                    {passwordStrength}/5
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${strengthColor} transition-all duration-300`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {newPassword && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {validationCriteria.map((criterion) => (
                  <div
                    key={criterion.id}
                    className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${passwordErrors[criterion.id as keyof typeof passwordErrors]
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                  >
                    {passwordErrors[criterion.id as keyof typeof passwordErrors] ? (
                      <Check size={12} className="mr-1" />
                    ) : (
                      <X size={12} className="mr-1" />
                    )}
                    {criterion.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* <div className={passwordMatch && newPassword ? "mb-0" : "mb-4"}> */}
          <div>
            <Label text="Confirm Password" className="!text-gray-700 dark:!text-gray-200 font-medium mb-1.5" required />
            <div className="relative mt-1">
              <Input.Password
                prefix={<Lock size={18} className="text-gray-400 group-hover:text-primary transition-colors" />}
                size="middle"
                placeholder="Confirm Your Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                className="rounded-xl py-2.5 dark:bg-gray-900/50 dark:border-gray-700 hover:border-primary focus:border-primary transition-all"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </div>

            {/* Password match validation - minimal design */}
            {confirmPassword && (
              <div className={`mt-2 flex items-center text-sm font-medium ${passwordMatch ? 'text-green-600 dark:text-green-400 ' : 'text-red-600 dark:text-red-400'
                }`}>
                {passwordMatch ? (
                  <>
                    <Check size={16} className="mr-1.5" />
                    <span>Passwords match</span>
                  </>
                ) : (
                  <>
                    <X size={16} className="mr-1.5" />
                    <span>Passwords do not match</span>
                  </>
                )}
              </div>
            )}
          </div>


          <div className="pt-3">
            <Button
              size="middle"
              disabled={!Object.values(passwordErrors).every(Boolean) || !passwordMatch}
              color="primary"
              variant="solid"
              htmlType="submit"
              className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:border-blue-600"
            >
              Update Password
            </Button>
          </div>

          <div className={`flex justify-center border-gray-200 dark:border-gray-700 ${passwordMatch || newPassword ? "mt-2 pt-2" : "mt-4 pt-4 border-t"}`}>
            <Link
              href="/auth/login"
              className="text-primary font-semibold hover:underline flex items-center"
              onClick={() => sessionStorage.removeItem('loginEmail')}
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;