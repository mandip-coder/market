"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input as InputBox } from "antd";
import { Lock, Check, X, Eye, EyeOff, Shield } from "lucide-react";
import Label from "@/components/Label/Label";

const ResetPassword = () => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const [passwordMatch, setPasswordMatch] = useState(true);

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
    <div className="h-full flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-8">
        <Image
          className="w-auto max-w-[180px] mx-auto mb-4"
          src={'/market-access/images/brand-logo.svg'}
          height={100}
          width={100}
          alt="logo"
        />
        <h1 className="text-2xl font-semibold mb-1">Reset Password</h1>
        <span className="text-gray-500 text-base">Create a new password for your account</span>
      </div>

      <div className="w-full sm:min-w-100 p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <Label text="New Password" />
              <div className="relative mt-1">
                <InputBox
                  prefix={<Lock size={18} />}
                  size="large"
                  placeholder="Enter Your Password"
                  onChange={(e) => setNewPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  className="rounded-lg"
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />
              </div>

              {/* Password strength indicator - subtle design */}
              {newPassword && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600 flex items-center">
                      <Shield size={14} className="mr-1" />
                      Password strength
                    </span>
                    <span className={`text-xs font-medium ${strengthColor.replace('bg-', 'text-')}`}>
                      {passwordStrength}/5
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${strengthColor} transition-all duration-300`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {newPassword && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {validationCriteria.map((criterion) => (
                    <div
                      key={criterion.id}
                      className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${passwordErrors[criterion.id as keyof typeof passwordErrors]
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
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

            <div>
              <Label text="Confirm Password" />
              <div className="relative mt-1">
                <InputBox
                  prefix={<Lock size={18} />}
                  size="large"
                  placeholder="Confirm Your Password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  className="rounded-lg"
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />
              </div>

              {/* Password match validation - minimal design */}
              {confirmPassword && (
                <div className={`mt-1.5 flex items-center text-sm ${passwordMatch ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {passwordMatch ? (
                    <>
                      <Check size={16} className="mr-1" />
                      <span>Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X size={16} className="mr-1" />
                      <span>Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

              
              <div className="mt-3">
                <Button size="large"    disabled={!Object.values(passwordErrors).every(Boolean) || !passwordMatch} color="primary" variant="solid" htmlType="submit" className="w-full">Update Password</Button>
              </div>
            </div>

          <div className="flex justify-center mt-1">
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;