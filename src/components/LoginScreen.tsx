"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Role } from "./RoleSelectionScreen";

interface LoginScreenProps {
  role: Role;
  onBack: () => void;
  onLoginSuccess: (formData: Record<string, string>) => void;
}

export function LoginScreen({ role, onBack, onLoginSuccess }: LoginScreenProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // Generic login form state (for admin only)
  const [genericFormData, setGenericFormData] = useState<Record<string, string>>({});

  const handleGenericInputChange = (field: string, value: string) => {
    setGenericFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Faculty-specific form state and validation
  const EMP_PATTERN = /^[a-zA-Z0-9]{4,20}$/;
  const FAC_EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@srmist\.edu\.in$/;
  const [facultyFormData, setFacultyFormData] = useState({
    empId: "",
    name: "",
    email: "",
    password: "",
  });
  const [facultyErrors, setFacultyErrors] = useState({
    empId: "",
    name: "",
    email: "",
    password: "",
  });

  const handleFacultyFieldChange = (field: string, value: string) => {
    setFacultyFormData((prev) => ({ ...prev, [field]: value }));
    const error = validateFacultyField(field, value);
    setFacultyErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateFacultyField = (field: string, value: string) => {
    switch (field) {
      case "empId":
        if (!value) return "Employee ID is required";
        if (!EMP_PATTERN.test(value)) return "Invalid employee ID";
        return "";
      case "name":
        if (!value) return "Full name is required";
        if (value.trim().length < 2) return "Please enter your full name";
        if (!/^[a-zA-Z\s.]+$/.test(value)) return "Name should contain letters only";
        return "";
      case "email":
        if (!value) return "Email is required";
        if (!FAC_EMAIL_PATTERN.test(value)) return "Must be a valid @srmist.edu.in email";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      default:
        return "";
    }
  };

  const isFacultyFormValid = () => {
    return (
      EMP_PATTERN.test(facultyFormData.empId) &&
      facultyFormData.name.trim().length >= 2 &&
      /^[a-zA-Z\s.]+$/.test(facultyFormData.name) &&
      FAC_EMAIL_PATTERN.test(facultyFormData.email) &&
      facultyFormData.password.length >= 6
    );
  };

  const handleFacultyLogin = () => {
    const empError = validateFacultyField("empId", facultyFormData.empId);
    const nameError = validateFacultyField("name", facultyFormData.name);
    const emailError = validateFacultyField("email", facultyFormData.email);
    const passwordError = validateFacultyField("password", facultyFormData.password);
    setFacultyErrors({ empId: empError, name: nameError, email: emailError, password: passwordError });
    if (empError || nameError || emailError || passwordError) return;

    const existing = localStorage.getItem("campusconnect_user");
    if (existing) {
      const parsed = JSON.parse(existing);
      if (parsed.role === "faculty" && parsed.profileComplete === true) {
        router.push("/faculty/dashboard");
        return;
      }
    }

    localStorage.setItem("campusconnect_user", JSON.stringify({
      role: "faculty",
      profileComplete: false,
      loggedIn: true,
      empId: facultyFormData.empId,
      name: facultyFormData.name,
      email: facultyFormData.email,
    }));

    router.push("/faculty/setup");
  };

  const handleGenericSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(genericFormData);
  };

  // Student-specific login form state and validation
  const [errors, setErrors] = useState({
    regNumber: "",
    email: "",
    password: ""
  });

  const [formData, setFormData] = useState({
    regNumber: "",
    email: "",
    password: ""
  });

  const REG_PATTERN = /^RA\d{13}$/;
  const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@srmist\.edu\.in$/;

  const validateField = (field: string, value: string) => {
    switch (field) {
      case "regNumber":
        if (!value) return "Registration number is required";
        if (!REG_PATTERN.test(value)) return "Invalid registration number";
        return "";
      
      case "email":
        if (!value) return "Email is required";
        if (!EMAIL_PATTERN.test(value)) return "Must be a valid @srmist.edu.in email address";
        return "";
      
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      
      default:
        return "";
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const isFormValid = () => {
    return (
      REG_PATTERN.test(formData.regNumber) &&
      EMAIL_PATTERN.test(formData.email) &&
      formData.password.length >= 6
    );
  };

  const handleStudentLogin = () => {
    // Validate all fields on submit
    const regError = validateField("regNumber", formData.regNumber);
    const emailError = validateField("email", formData.email);
    const passwordError = validateField("password", formData.password);

    setErrors({
      regNumber: regError,
      email: emailError,
      password: passwordError
    });

    // Stop if any error
    if (regError || emailError || passwordError) return;

    // Check localStorage for returning user
    const existing = localStorage.getItem("campusconnect_user");
    if (existing) {
      const parsed = JSON.parse(existing);
      if (parsed.profileComplete === true) {
        router.push("/student/feed");
        return;
      }
    }

    localStorage.setItem("campusconnect_user", JSON.stringify({
      role: "student",
      profileComplete: false,
      loggedIn: true
    }));

    router.push("/student/setup");
  };


  // Content configurations based on role
  const config = {
    student: {
      tagline: "Your academic journey, connected.",
      leftBgClass: "bg-sunset-gradient-student",
      label: "Student Login",
      fields: [
        {
          id: "registrationNumber",
          label: "Registration Number",
          type: "text",
          placeholder: "Enter your registration number",
        },
        {
          id: "srmEmail",
          label: "SRM Email ID",
          type: "email",
          placeholder: "yourname@srmist.edu.in",
        },
        {
          id: "password",
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      ],
      buttonBgClass: "bg-sunset-orange hover:bg-sunset-orange/95 text-sunset-violet shadow-glow-orange focus:ring-sunset-orange",
      leftPanelGradient: "from-sunset-violet via-sunset-rust to-sunset-orange/50",
    },
    faculty: {
      tagline: "Guide the next generation of innovators.",
      leftBgClass: "bg-sunset-gradient-faculty",
      label: "Faculty Login",
      fields: [
        {
          id: "empId",
          label: "Employee ID",
          type: "text",
          placeholder: "Enter employee ID",
        },
        {
          id: "name",
          label: "Full Name",
          type: "text",
          placeholder: "Your full name",
        },
        {
          id: "email",
          label: "SRM Email",
          type: "email",
          placeholder: "yourname@srmist.edu.in",
        },
        {
          id: "password",
          label: "Password",
          type: "password",
          placeholder: "Enter password",
        },
      ],
      buttonBgClass: "bg-sunset-amber hover:bg-sunset-amber/95 text-sunset-violet shadow-glow-amber focus:ring-sunset-amber",
      leftPanelGradient: "from-sunset-amber via-sunset-rust to-sunset-violet/50",
    },
    admin: {
      tagline: "Manage, monitor, and maintain CampusConnect.",
      leftBgClass: "bg-sunset-gradient-admin",
      label: "Admin Login",
      fields: [
        {
          id: "adminEmail",
          label: "Email Address",
          type: "email",
          placeholder: "Enter your admin email",
        },
        {
          id: "password",
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      ],
      buttonBgClass: "bg-sunset-rust hover:bg-sunset-rust/95 text-sunset-peach shadow-glow-rust focus:ring-sunset-rust",
      leftPanelGradient: "from-sunset-violet via-sunset-orange to-sunset-rust/50",
    },
  }[role];

  // Animated gradient logo helper
  const renderLogo = () => (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-20 h-20 flex items-center justify-center rounded-2xl bg-sunset-violet/50 border border-sunset-peach/20 shadow-glow-peach/30">
        {/* Glow backdrop inside logo */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-sunset-orange/20 to-sunset-amber/20 blur-md" />
        
        {/* Inline vector logo */}
        <svg
          className="relative w-12 h-12 text-sunset-peach"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
          <circle cx="12" cy="12" r="3" fill="currentColor" className="text-sunset-orange/40" />
        </svg>
      </div>
      <h1 className="font-playfair text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sunset-peach to-sunset-orange">
        CampusConnect
      </h1>
    </div>
  );

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row overflow-hidden bg-gradient-to-b from-[#2E1E38] to-[#120A17]">
      
      {/* Left panel: Brand and Tagline (45% width on desktop) */}
      <div className={`w-full md:w-[45%] p-8 md:p-16 flex flex-col justify-center items-center relative overflow-hidden min-h-[30vh] md:min-h-screen border-b md:border-b-0 md:border-r border-sunset-peach/10 bg-cover ${config.leftBgClass}`}>
        {/* Glowing orbs in left panel */}
        <div className="absolute inset-0 bg-black/30 z-0" />
        <div className="absolute top-[-20%] left-[-20%] w-[300px] h-[300px] rounded-full bg-sunset-orange/20 blur-[80px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[300px] h-[300px] rounded-full bg-sunset-violet/30 blur-[80px]" />

        <div className="relative z-10 text-center flex flex-col items-center gap-6 max-w-sm">
          {renderLogo()}
          <p className="font-inter text-base md:text-lg font-light text-sunset-peach/80 leading-relaxed px-4">
            {config.tagline}
          </p>
        </div>
      </div>

      {/* Right panel: Login Form (55% width on desktop) */}
      <div className="w-full md:w-[55%] p-6 md:p-16 flex flex-col justify-center items-center relative z-10 min-h-[70vh] md:min-h-screen">
        
        {/* Form Container Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
          className="w-full max-w-md p-8 rounded-2xl border border-sunset-peach/15 glass-card shadow-glow-violet/10 flex flex-col gap-6"
        >
          {/* Header */}
          <div className="flex flex-col gap-1 text-center md:text-left">
            <h2 className="font-playfair text-3xl font-bold text-[#FFC4B1]">
              {config.label}
            </h2>
            <p className="font-inter text-xs md:text-sm font-light text-sunset-peach/60">
              Provide credentials below to gain campus access.
            </p>
          </div>

          {/* Form */}
          {role === "student" ? (
            <form onSubmit={(e) => { e.preventDefault(); handleStudentLogin(); }} className="flex flex-col gap-5">
              {/* Field 1: Registration Number */}
              <div className="flex flex-col gap-2">
                <label 
                  htmlFor="registrationNumber" 
                  className="font-inter text-xs font-semibold text-sunset-peach/80 uppercase tracking-wider"
                >
                  Registration Number
                </label>
                <div className="flex flex-col gap-1">
                  <Input
                    id="registrationNumber"
                    type="text"
                    required
                    placeholder="Enter your registration number"
                    value={formData.regNumber}
                    onChange={(e) => handleFieldChange("regNumber", e.target.value.toUpperCase())}
                    maxLength={15}
                    className={
                      errors.regNumber 
                        ? "border-red-400 focus:ring-red-300" 
                        : "border-sunset-peach/20"
                    }
                  />
                  {errors.regNumber && (
                    <p className="text-xs font-semibold text-red-400 flex items-center gap-1.5 mt-1">
                      <span>⚠</span>
                      {errors.regNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Field 2: SRM Email ID */}
              <div className="flex flex-col gap-2">
                <label 
                  htmlFor="srmEmail" 
                  className="font-inter text-xs font-semibold text-sunset-peach/80 uppercase tracking-wider"
                >
                  SRM Email ID
                </label>
                
                <div className="flex flex-col gap-1">
                  <input
                    type="email"
                    id="srmEmail"
                    placeholder="yourname@srmist.edu.in"
                    value={formData.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    className={`w-full h-12 px-4 rounded-xl border transition-all text-sm font-medium glass-input
                      ${errors.email 
                        ? "border-red-400 focus:ring-red-300" 
                        : "border-sunset-peach/20 focus:ring-sunset-orange focus:border-sunset-orange focus:shadow-glow-orange"
                      }
                    `}
                  />
                  {errors.email && (
                    <p className="text-xs font-semibold text-red-400 flex items-center gap-1.5 mt-1">
                      <span>⚠</span>
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Field 3: Password */}
              <div className="flex flex-col gap-2">
                <label 
                  htmlFor="password" 
                  className="font-inter text-xs font-semibold text-sunset-peach/80 uppercase tracking-wider"
                >
                  Password
                </label>
                
                <div className="flex flex-col gap-1">
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleFieldChange("password", e.target.value)}
                      className={`pr-12 ${
                        errors.password ? "border-red-400 focus:ring-red-300" : "border-sunset-peach/20"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-sunset-peach/60 hover:text-sunset-orange hover:bg-sunset-peach/5 transition-colors cursor-pointer select-none"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs font-semibold text-red-400 flex items-center gap-1.5 mt-1">
                      <span>⚠</span>
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                onClick={handleStudentLogin}
                disabled={!isFormValid()}
                className={`w-full h-12 rounded-xl font-bold text-sm transition-all mt-2 ${
                  isFormValid()
                    ? "bg-[#F27F3D] text-white cursor-pointer hover:opacity-90 active:scale-95"
                    : "bg-[#F27F3D]/40 text-white/50 cursor-not-allowed"
                }`}
              >
                Login
              </button>

              {/* Back Button */}
              <div className="flex justify-center mt-2">
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-sunset-peach/60 hover:text-sunset-orange transition-all duration-200 group cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
                  <span>Back to role selection</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleGenericSubmit} className="flex flex-col gap-5">
              {config.fields.map((field) => {
                const isPassword = field.type === "password";
                const currentType = isPassword && showPassword ? "text" : field.type;

                return (
                  <div key={field.id} className="flex flex-col gap-2">
                    <label 
                      htmlFor={field.id} 
                      className="font-inter text-xs font-semibold text-sunset-peach/80 uppercase tracking-wider"
                    >
                      {field.label}
                    </label>
                    
                    <div className="relative">
                      <Input
                        id={field.id}
                        type={currentType}
                        required
                        placeholder={field.placeholder}
                        value={genericFormData[field.id] || ""}
                        onChange={(e) => handleGenericInputChange(field.id, e.target.value)}
                        className="pr-12"
                      />

                      {isPassword && (
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-sunset-peach/60 hover:text-sunset-orange hover:bg-sunset-peach/5 transition-colors cursor-pointer select-none"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Submit Button */}
              <Button
                type="submit"
                className={`w-full py-4 rounded-xl text-base font-bold transition-all duration-300 mt-2 flex items-center justify-center ${config.buttonBgClass}`}
              >
                Login
              </Button>

              {/* Back Button */}
              <div className="flex justify-center mt-2">
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-sunset-peach/60 hover:text-sunset-orange transition-all duration-200 group cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
                  <span>Back to role selection</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
