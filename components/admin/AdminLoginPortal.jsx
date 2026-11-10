"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Mail, 
  KeyRound, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Smartphone, 
  RefreshCw, 
  X,
  Check
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { 
  checkRateLimit, 
  registerFailedAttempt, 
  resetRateLimit,
  requestForgotPassword,
  verifyResetOtp,
  resetAdminPassword
} from "@/lib/security";

export default function AdminLoginPortal() {
  const { loginAdmin, submitLoginOtp } = useAdmin();

  // Login form state
  const [email, setEmail] = useState("waruna.jajjja@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 2FA OTP state
  const [isOtpRequired, setIsOtpRequired] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [otpReason, setOtpReason] = useState("");
  const [otpStatusMsg, setOtpStatusMsg] = useState("");
  const [devOtpHint, setDevOtpHint] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Done
  const [forgotEmail, setForgotEmail] = useState("waruna.jajjja@gmail.com");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotTempToken, setForgotTempToken] = useState("");
  const [forgotResetToken, setForgotResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotDevOtp, setForgotDevOtp] = useState("");
  const [forgotResendCooldown, setForgotResendCooldown] = useState(0);

  // Cooldown timers
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    let timer;
    if (forgotResendCooldown > 0) {
      timer = setTimeout(() => setForgotResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [forgotResendCooldown]);

  // Handle Standard Login (Email + Password)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const rateCheck = checkRateLimit("admin_login");
    if (!rateCheck.allowed) {
      setErrorMessage(`Too many failed attempts! Login locked for ${rateCheck.remainingSecs} seconds.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginAdmin({ email, password });

      if (result.success) {
        if (result.requireOtp) {
          // Device untrusted or 3-day inactivity: switch to 2FA screen
          setIsOtpRequired(true);
          setTempToken(result.tempToken || "");
          setOtpReason(result.reason || "");
          setOtpStatusMsg(result.message || "A 6-digit verification code has been dispatched to your email.");
          if (result.devOtp) {
            setDevOtpHint(result.devOtp);
          }
          setResendCooldown(60);
          resetRateLimit("admin_login");
        } else {
          // Direct login success
          resetRateLimit("admin_login");
        }
      } else {
        const failRecord = registerFailedAttempt("admin_login");
        if (failRecord.locked) {
          setErrorMessage(`Account locked due to 5 consecutive failed attempts. Please wait ${failRecord.remainingSecs} seconds.`);
        } else {
          setErrorMessage(result.error || `Incorrect credentials. ${failRecord.remainingAttempts} attempts remaining.`);
        }
      }
    } catch (err) {
      setErrorMessage("Network error occurred during login. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle 2FA OTP Submission
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitLoginOtp({
        email,
        otp: otpCode.trim(),
        tempToken,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Incorrect verification code. Please try again.");
      }
    } catch (err) {
      setErrorMessage("Network error verifying code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend 2FA OTP
  const handleResendLoginOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const result = await loginAdmin({ email, password });
      if (result.success && result.requireOtp) {
        setTempToken(result.tempToken || "");
        if (result.devOtp) setDevOtpHint(result.devOtp);
        setResendCooldown(60);
        setOtpStatusMsg("A fresh 6-digit verification code has been dispatched to your email.");
      }
    } catch (err) {
      setErrorMessage("Failed to resend code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- FORGOT PASSWORD WORKFLOW ---
  const openForgotPasswordModal = () => {
    setShowForgotModal(true);
    setForgotStep(1);
    setForgotError("");
    setForgotEmail(email || "waruna.jajjja@gmail.com");
    setForgotOtp("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const closeForgotPasswordModal = () => {
    setShowForgotModal(false);
    setForgotError("");
    setForgotOtp("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Step 1: Send Reset OTP
  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    setForgotError("");
    setIsForgotLoading(true);

    try {
      const res = await requestForgotPassword({ email: forgotEmail });
      if (res.success) {
        setForgotTempToken(res.tempToken || "");
        if (res.devOtp) setForgotDevOtp(res.devOtp);
        setForgotResendCooldown(60);
        setForgotStep(2);
      } else {
        setForgotError(res.error || "Unable to send password reset code.");
      }
    } catch (err) {
      setForgotError("Failed to dispatch reset code. Please check your network.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Step 2: Verify Reset OTP
  const handleForgotVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotError("");

    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      setForgotError("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsForgotLoading(true);
    try {
      const res = await verifyResetOtp({
        email: forgotEmail,
        otp: forgotOtp.trim(),
        tempToken: forgotTempToken,
      });

      if (res.success) {
        setForgotResetToken(res.resetToken);
        setForgotStep(3);
      } else {
        setForgotError(res.error || "Invalid verification code.");
      }
    } catch (err) {
      setForgotError("Error verifying code. Please try again.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Step 3: Submit New Password
  const handleForgotResetPassword = async (e) => {
    e.preventDefault();
    setForgotError("");

    if (newPassword.length < 8) {
      setForgotError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError("Passwords do not match. Please re-type carefully.");
      return;
    }

    setIsForgotLoading(true);
    try {
      const res = await resetAdminPassword({
        email: forgotEmail,
        resetToken: forgotResetToken,
        newPassword,
      });

      if (res.success) {
        setForgotStep(4);
        setPassword(newPassword); // Pre-fill login password
      } else {
        setForgotError(res.error || "Failed to update password.");
      }
    } catch (err) {
      setForgotError("Service error updating password. Please try again.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 pt-28 pb-20 bg-[#07090e] relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#e6007e]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0c1017]/95 border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          
          {/* Top Logo / Icon */}
          <div className="text-center mb-6">
            <div className="relative inline-block mb-3">
              <Image 
                src="/images/rotaract-sltc-clean-logo.png" 
                alt="Rotaract SLTC" 
                width={180} 
                height={65} 
                className="h-10 w-auto mx-auto object-contain drop-shadow-[0_0_15px_rgba(230,0,126,0.4)]"
                priority
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6007e]/15 border border-[#e6007e]/30 text-[#e6007e] text-[10px] font-bold tracking-widest uppercase mb-2">
              <ShieldCheck size={12} />
              <span>Admin Security Portal</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isOtpRequired ? "Two-Factor Verification" : "Administrator Sign In"}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              {isOtpRequired 
                ? "Enter the 6-digit OTP code dispatched to your registered email to verify this device."
                : "Enter your registered credentials to access the administrative dashboard."}
            </p>
          </div>

          {/* Global Error Banner */}
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-semibold leading-relaxed flex items-start gap-2.5"
            >
              <AlertTriangle size={18} className="shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 1: NORMAL LOGIN (EMAIL + PASSWORD)                                  */}
          {/* ========================================================================= */}
          {!isOtpRequired ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="waruna.jajjja@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-[#e6007e] focus:ring-1 focus:ring-[#e6007e] text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={openForgotPasswordModal}
                    className="text-[11px] font-semibold text-[#e6007e] hover:text-[#ff4081] hover:underline transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-[#e6007e] focus:ring-1 focus:ring-[#e6007e] text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(230,0,126,0.35)] hover:shadow-[0_0_30px_rgba(230,0,126,0.5)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>Sign In to Admin Portal</span>
                  </>
                )}
              </button>

              {/* Security Footnote */}
              <div className="pt-3 border-t border-slate-800/60 text-center">
                <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                  <Smartphone size={13} className="text-[#e6007e]" />
                  <span>Adaptive 2FA &bull; 3-Day Inactivity Protected</span>
                </p>
              </div>
            </form>
          ) : (
            /* ========================================================================= */
            /* VIEW 2: 2FA OTP CHALLENGE SCREEN                                         */
            /* ========================================================================= */
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              {/* Reason Badge */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-[#e6007e] mb-1">
                  <Smartphone size={15} />
                  <span>
                    {otpReason === "inactivity_3_days" 
                      ? "3-Day Session Renewal Challenge" 
                      : "New Device Authorization Challenge"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {otpStatusMsg}
                </p>
                <div className="mt-2 text-[11px] font-mono text-slate-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-800/80 inline-block">
                  📧 {email}
                </div>
              </div>

              {/* Developer Test Helper */}
              {devOtpHint && (
                <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono text-center">
                  💡 Dev OTP Code: <strong className="text-white text-sm">{devOtpHint}</strong>
                </div>
              )}

              {/* 6-Digit OTP Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 text-center mb-2">
                  Enter 6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  autoFocus
                  required
                  className="w-full py-3.5 px-4 text-center text-2xl font-black font-mono tracking-[0.4em] rounded-xl bg-slate-900 border border-[#e6007e]/60 focus:border-[#e6007e] focus:ring-2 focus:ring-[#e6007e]/40 text-white placeholder-slate-700 outline-none transition-all"
                />
                <span className="block text-center text-[10px] text-slate-400 mt-1.5">
                  Code expires in 10 minutes &bull; Single-use only
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  type="submit"
                  disabled={isSubmitting || otpCode.length !== 6}
                  className="w-full py-3.5 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(230,0,126,0.35)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Authorizing Device...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Verify & Authorize Device</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpRequired(false);
                      setOtpCode("");
                      setErrorMessage("");
                    }}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>Back to Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendLoginOtp}
                    disabled={resendCooldown > 0 || isSubmitting}
                    className="text-[#e6007e] hover:text-[#ff4081] disabled:text-slate-500 transition-colors font-medium cursor-pointer"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend OTP Code"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* POPUP MODAL: FORGOT PASSWORD (MULTI-STEP)                                 */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md rounded-3xl bg-[#0c1017] border border-slate-800 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden relative"
            >
              {/* Gradient Accent Bar */}
              <div className="h-1.5 bg-gradient-to-r from-[#e6007e] via-pink-400 to-[#e6007e]" />

              {/* Close Button */}
              <button
                type="button"
                onClick={closeForgotPasswordModal}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer z-10"
              >
                <X size={18} />
              </button>

              <div className="p-7 sm:p-8">
                {/* Steps Breadcrumb */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {[1, 2, 3].map((stepNum) => (
                    <div key={stepNum} className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                          forgotStep === stepNum
                            ? "bg-[#e6007e] text-white shadow-[0_0_12px_rgba(230,0,126,0.6)]"
                            : forgotStep > stepNum
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {forgotStep > stepNum ? <Check size={13} /> : stepNum}
                      </div>
                      {stepNum < 3 && (
                        <div
                          className={`w-6 sm:w-8 h-0.5 ${
                            forgotStep > stepNum ? "bg-emerald-500/50" : "bg-slate-800"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Modal Error Alert */}
                {forgotError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-semibold leading-relaxed flex items-start gap-2">
                    <AlertTriangle size={16} className="shrink-0 text-rose-400 mt-0.5" />
                    <span>{forgotError}</span>
                  </div>
                )}

                {/* Developer Hint in Modal */}
                {forgotDevOtp && forgotStep === 2 && (
                  <div className="mb-4 p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono text-center">
                    💡 Reset OTP Code: <strong className="text-white text-sm">{forgotDevOtp}</strong>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* STEP 1: ENTER ADMIN EMAIL                                      */}
                {/* ------------------------------------------------------------- */}
                {forgotStep === 1 && (
                  <form onSubmit={handleForgotSendOtp} className="space-y-4">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-[#e6007e]/20 text-[#e6007e] mx-auto flex items-center justify-center border border-[#e6007e]/40 mb-3">
                        <KeyRound size={22} />
                      </div>
                      <h2 className="text-lg font-bold text-white">Reset Admin Password</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Enter your registered administrator email. A single-use verification code will be dispatched.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Administrator Email
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          required
                          placeholder="waruna.jajjja@gmail.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-[#e6007e] text-sm text-white font-mono outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isForgotLoading}
                      className="w-full py-3 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#e6007e]/25"
                    >
                      {isForgotLoading ? (
                        <>
                          <RefreshCw size={15} className="animate-spin" />
                          <span>Dispatching Code...</span>
                        </>
                      ) : (
                        <>
                          <Mail size={15} />
                          <span>Send Verification OTP</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* ------------------------------------------------------------- */}
                {/* STEP 2: ENTER OTP                                              */}
                {/* ------------------------------------------------------------- */}
                {forgotStep === 2 && (
                  <form onSubmit={handleForgotVerifyOtp} className="space-y-4">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center border border-blue-500/40 mb-3">
                        <Smartphone size={22} />
                      </div>
                      <h2 className="text-lg font-bold text-white">Verify Security Code</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Enter the 6-digit verification code dispatched to <span className="text-white font-mono">{forgotEmail}</span>
                      </p>
                    </div>

                    <div>
                      <input
                        type="text"
                        maxLength={6}
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••••"
                        autoFocus
                        required
                        className="w-full py-3 px-4 text-center text-2xl font-black font-mono tracking-[0.4em] rounded-xl bg-slate-900 border border-[#e6007e]/60 focus:border-[#e6007e] text-white outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isForgotLoading || forgotOtp.length !== 6}
                      className="w-full py-3 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#e6007e]/25"
                    >
                      {isForgotLoading ? (
                        <>
                          <RefreshCw size={15} className="animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} />
                          <span>Verify Reset Code</span>
                        </>
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={handleForgotSendOtp}
                        disabled={forgotResendCooldown > 0 || isForgotLoading}
                        className="text-xs text-[#e6007e] hover:text-[#ff4081] disabled:text-slate-500 transition-colors font-medium cursor-pointer"
                      >
                        {forgotResendCooldown > 0 ? `Resend code in ${forgotResendCooldown}s` : "Resend Code"}
                      </button>
                    </div>
                  </form>
                )}

                {/* ------------------------------------------------------------- */}
                {/* STEP 3: CREATE NEW PASSWORD                                    */}
                {/* ------------------------------------------------------------- */}
                {forgotStep === 3 && (
                  <form onSubmit={handleForgotResetPassword} className="space-y-4">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40 mb-3">
                        <Lock size={22} />
                      </div>
                      <h2 className="text-lg font-bold text-white">Create New Password</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Choose a strong password to protect your administrator portal.
                      </p>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          placeholder="At least 8 characters"
                          className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-[#e6007e] text-sm text-white font-mono outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          placeholder="Re-enter password"
                          className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-[#e6007e] text-sm text-white font-mono outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Validation Indicators */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 text-[11px]">
                      <div className={`flex items-center gap-1.5 ${newPassword.length >= 8 ? "text-emerald-400" : "text-slate-500"}`}>
                        <Check size={13} />
                        <span>Minimum 8 characters length</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${newPassword && newPassword === confirmPassword ? "text-emerald-400" : "text-slate-500"}`}>
                        <Check size={13} />
                        <span>Passwords match</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isForgotLoading || newPassword.length < 8 || newPassword !== confirmPassword}
                      className="w-full py-3 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#e6007e]/25"
                    >
                      {isForgotLoading ? (
                        <>
                          <RefreshCw size={15} className="animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Save & Secure Account</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* ------------------------------------------------------------- */}
                {/* STEP 4: SUCCESS CONFIRMATION                                   */}
                {/* ------------------------------------------------------------- */}
                {forgotStep === 4 && (
                  <div className="text-center py-4 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                      <CheckCircle2 size={32} />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-white">Password Updated!</h2>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        Your administrator password has been successfully updated. All previous active sessions and trusted devices have been invalidated.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={closeForgotPasswordModal}
                      className="w-full py-3 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#e6007e]/25 cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
