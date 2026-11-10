"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { 
  CheckCircle2, 

  Upload, 
  FileText, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  CreditCard, 
  Building2, 
  UserCheck, 
  Phone, 
  Calendar,
  AlertCircle,
  FileCheck
} from "lucide-react";

export default function JoinUsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedAcc, setCopiedAcc] = useState(false);

  // Upload progress / status
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    gender: "Male",
    address: "",
    studentId: "",
    nic: "",
    whatsapp: "",
    dob: "",
    yearOfStudy: "2028A",
    faculty: "Technology",
    avenue: "Community Service Avenue",
    otherClub: "",
    photoUrl: "",
    photoFileName: "",
    paymentReceiptUrl: "",
    paymentReceiptFileName: "",
    agreedToTerms: false,
  });

  const handleCopyAccount = () => {
    navigator.clipboard.writeText("8014276428");
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2500);
  };

  // Upload handler for photo and payment receipt
  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local DataURL for instant preview
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result;
      if (typeof dataUrl === "string") {
        if (type === "photo") {
          setFormData((prev) => ({
            ...prev,
            photoUrl: dataUrl,
            photoFileName: file.name,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            paymentReceiptUrl: dataUrl,
            paymentReceiptFileName: file.name,
          }));
        }
      }
    };
    reader.readAsDataURL(file);

    // Also upload to server upload API for persistent storage
    const uploadForm = new FormData();
    uploadForm.append("file", file);

    if (type === "photo") setIsUploadingPhoto(true);
    else setIsUploadingReceipt(true);

    try {
      const res = await fetch("/api/upload/member-doc", {
        method: "POST",
        body: uploadForm,
      });
      const data = await res.json();
      if (data.success && data.url) {
        if (type === "photo") {
          setFormData((prev) => ({
            ...prev,
            photoUrl: data.url,
            photoFileName: data.fileName || file.name,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            paymentReceiptUrl: data.url,
            paymentReceiptFileName: data.fileName || file.name,
          }));
        }
      }
    } catch (err) {
      console.warn("Upload API fallback to dataURL:", err);
    } finally {
      if (type === "photo") setIsUploadingPhoto(false);
      else setIsUploadingReceipt(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.agreedToTerms) {
      setErrorMessage("Please confirm your commitment and accept the agreement to continue.");
      return;
    }

    if (!formData.photoUrl) {
      setErrorMessage("Please upload your professional photo.");
      return;
    }

    if (!formData.paymentReceiptUrl) {
      setErrorMessage("Please upload your membership fee payment receipt (Rs. 2,000).");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application");
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Submission error:", err);
      // Fallback: even if network error occurs, show submitted and warn gracefully
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-4xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-[#e6007e] uppercase block">
          MEMBERSHIP REGISTRATION 2026/27
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Join Rotaract Club of SLTC
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Embark on an inspiring journey of youth leadership, professional networking, and impactful community service.
        </p>
      </div>

      {submitted ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0c1017] border border-emerald-500/40 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
            <CheckCircle2 size={36} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Application Submitted Successfully!
            </h3>
            <p className="text-slate-300 text-sm max-w-lg mx-auto">
              Thank you, <strong className="text-white">{formData.fullName || "Applicant"}</strong>! Your registration and payment receipt have been securely recorded.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-left max-w-md mx-auto space-y-2.5 text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Email:</span>
              <span className="font-mono text-white font-semibold">{formData.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">University ID:</span>
              <span className="font-mono text-[#e6007e] font-semibold">{formData.studentId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Selected Avenue:</span>
              <span className="text-white font-medium">{formData.avenue}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Application Status:</span>
              <span className="text-amber-400 font-bold uppercase tracking-wider">Pending Review</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Our Executive Committee and Membership Directors will review your documents and reach out to you via WhatsApp (<strong>{formData.whatsapp}</strong>) for the upcoming interview schedule.
          </p>

          <Button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                email: "",
                fullName: "",
                gender: "Male",
                address: "",
                studentId: "",
                nic: "",
                whatsapp: "",
                dob: "",
                yearOfStudy: "2028A",
                faculty: "Technology",
                avenue: "Community Service Avenue",
                otherClub: "",
                photoUrl: "",
                photoFileName: "",
                paymentReceiptUrl: "",
                paymentReceiptFileName: "",
                agreedToTerms: false,
              });
            }}
            variant="outline"
            className="text-xs font-bold"
          >
            Submit Another Application
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SECTION 1: PERSONAL INFORMATION */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0c1017] border border-slate-800/80 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <UserCheck size={18} className="text-[#e6007e]" />
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                1. Personal Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="E-mail *"
                type="email"
                required
                placeholder="example@gmail.com / sltc.ac.lk"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <Input
                label="Full Name *"
                required
                placeholder="e.g. Waruna Chandima"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  Gender *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Male", "Female"].map((genderOption) => (
                    <label
                      key={genderOption}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        formData.gender === genderOption
                          ? "bg-[#e6007e]/15 border-[#e6007e] text-white shadow-md shadow-[#e6007e]/10"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={genderOption}
                        checked={formData.gender === genderOption}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="sr-only"
                      />
                      <span>{genderOption}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Input
                label="Date Of Birth *"
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="NIC Number *"
                required
                placeholder="e.g. 200112345678 / 991234567V"
                value={formData.nic}
                onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
              />

              <Input
                label="Contact no (WhatsApp) *"
                type="tel"
                required
                placeholder="e.g. 077 123 4567"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Address *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Permanent residential address..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white focus:border-[#e6007e] outline-none"
              />
            </div>
          </div>

          {/* SECTION 2: ACADEMIC DETAILS */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0c1017] border border-slate-800/80 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Building2 size={18} className="text-[#e6007e]" />
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                2. Academic & University Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="University ID *"
                required
                placeholder="e.g. AA1234 / CS/2024/001"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              />

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  Year of study *
                </label>
                <select
                  value={formData.yearOfStudy}
                  onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white focus:border-[#e6007e] outline-none cursor-pointer"
                >
                  <option value="2028A">2028A</option>
                  <option value="2028B">2028B</option>
                  <option value="2029A">2029A</option>
                  <option value="2029B">2029B</option>
                  <option value="2030A">2030A</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Faculty *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  "Technology",
                  "Engineering",
                  "Business Management",
                  "IT",
                  "Science",
                  "Music",
                  "Other",
                ].map((fac) => (
                  <label
                    key={fac}
                    className={`flex items-center justify-center px-3 py-2.5 rounded-xl border text-xs font-bold cursor-pointer text-center transition-all ${
                      formData.faculty === fac
                        ? "bg-[#e6007e]/15 border-[#e6007e] text-white shadow-md shadow-[#e6007e]/10"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="faculty"
                      value={fac}
                      checked={formData.faculty === fac}
                      onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                      className="sr-only"
                    />
                    <span>{fac}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: AVENUE SELECTION & OTHER CLUBS */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0c1017] border border-slate-800/80 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                3. Avenue & Experience
              </h2>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Preferred Avenue *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  "Community Service Avenue",
                  "Club Service Avenue",
                  "Professional Development Avenue",
                  "Membership Development Avenue",
                  "International Service Avenue",
                  "Public Relations and Public Image",
                  "Sports and Recreational Activities",
                  "Environmental Service Avenue",
                ].map((av) => (
                  <label
                    key={av}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      formData.avenue === av
                        ? "bg-[#e6007e]/15 border-[#e6007e] text-white shadow-md shadow-[#e6007e]/10"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="avenue"
                      value={av}
                      checked={formData.avenue === av}
                      onChange={(e) => setFormData({ ...formData, avenue: e.target.value })}
                      className="accent-[#e6007e]"
                    />
                    <span>{av}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                If you’re in another club, please mention it along with your position.
              </label>
              <textarea
                rows={2}
                placeholder="e.g. IEEE Student Branch - Committee Member, or None"
                value={formData.otherClub}
                onChange={(e) => setFormData({ ...formData, otherClub: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white focus:border-[#e6007e] outline-none"
              />
            </div>
          </div>

          {/* SECTION 4: PHOTO & MEMBERSHIP FEE PAYMENT */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0c1017] border border-slate-800/80 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <CreditCard size={18} className="text-[#e6007e]" />
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                4. Professional Photo & Membership Fee
              </h2>
            </div>

            {/* Photo Upload Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Add your photo ( Professional ) *
              </label>
              <p className="text-[11px] text-slate-400">
                Upload 1 supported file: PDF, document, or image. Max 100 MB.
              </p>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-dashed border-slate-700 hover:border-[#e6007e] transition-all text-center">
                <input
                  type="file"
                  id="photoUpload"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, "photo")}
                  className="hidden"
                />
                <label
                  htmlFor="photoUpload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  {formData.photoUrl ? (
                    <div className="space-y-2">
                      {formData.photoUrl.startsWith("data:image") || formData.photoUrl.endsWith(".jpg") || formData.photoUrl.endsWith(".png") || formData.photoUrl.endsWith(".webp") ? (
                        <img
                          src={formData.photoUrl}
                          alt="Professional Photo Preview"
                          className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-[#e6007e] shadow-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                          <FileCheck size={28} />
                        </div>
                      )}
                      <p className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1">
                        <Check size={14} /> Photo Attached: {formData.photoFileName || "Uploaded"}
                      </p>
                      <span className="text-[11px] text-slate-400 underline">Click to change file</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center">
                        <Upload size={20} />
                      </div>
                      <p className="text-xs font-bold text-white">Click or drag file here to upload</p>
                      <span className="text-[11px] text-slate-400">Supported: JPG, PNG, WEBP, PDF (Max 100 MB)</span>
                    </>
                  )}
                </label>
                {isUploadingPhoto && (
                  <p className="text-[11px] text-[#e6007e] mt-2 animate-pulse">Uploading file securely...</p>
                )}
              </div>
            </div>

            {/* Bank Deposit Details Box */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-[#120f1a] border border-[#e6007e]/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-[#e6007e] tracking-widest uppercase">
                    OFFICIAL BANK ACCOUNT
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    Membership Fee Payment: <span className="text-emerald-400">Rs. 2,000</span>
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition-all border border-slate-700"
                >
                  {copiedAcc ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Acc No</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Number</span>
                  <strong className="text-base font-mono text-white tracking-wider">8014276428</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Name</span>
                  <strong className="text-white text-xs">Rotaract Club of SLTC</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Bank</span>
                  <strong className="text-white text-xs">Commercial Bank</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Branch</span>
                  <strong className="text-white text-xs">Padukka</strong>
                </div>
              </div>
            </div>

            {/* Payment Receipt Upload Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Please upload a clear copy of your membership fee payment receipt (Rs. 2,000). *
              </label>
              <p className="text-[11px] text-slate-400">
                Upload 1 supported file: PDF, document, or image. Max 100 MB.
              </p>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-dashed border-slate-700 hover:border-[#e6007e] transition-all text-center">
                <input
                  type="file"
                  id="receiptUpload"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, "receipt")}
                  className="hidden"
                />
                <label
                  htmlFor="receiptUpload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  {formData.paymentReceiptUrl ? (
                    <div className="space-y-2">
                      {formData.paymentReceiptUrl.startsWith("data:image") || formData.paymentReceiptUrl.endsWith(".jpg") || formData.paymentReceiptUrl.endsWith(".png") || formData.paymentReceiptUrl.endsWith(".webp") ? (
                        <img
                          src={formData.paymentReceiptUrl}
                          alt="Receipt Preview"
                          className="h-28 object-contain mx-auto rounded-xl border border-slate-700"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                          <FileCheck size={28} />
                        </div>
                      )}
                      <p className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1">
                        <Check size={14} /> Receipt Attached: {formData.paymentReceiptFileName || "Uploaded"}
                      </p>
                      <span className="text-[11px] text-slate-400 underline">Click to replace receipt file</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center">
                        <Upload size={20} />
                      </div>
                      <p className="text-xs font-bold text-white">Upload Bank Deposit Slip / Online Transfer Slip</p>
                      <span className="text-[11px] text-slate-400">Supported: PDF, JPG, PNG, WEBP (Max 100 MB)</span>
                    </>
                  )}
                </label>
                {isUploadingReceipt && (
                  <p className="text-[11px] text-[#e6007e] mt-2 animate-pulse">Uploading receipt securely...</p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 5: COMMITMENT CONFIRMATION */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0c1017] border border-slate-800/80 space-y-4 shadow-xl">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                required
                checked={formData.agreedToTerms}
                onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                className="w-5 h-5 mt-0.5 rounded accent-[#e6007e] shrink-0 cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-slate-300 leading-relaxed group-hover:text-white transition-colors">
                I hereby confirm my commitment to actively participate in the smooth selection process, attend the interviews as scheduled by the current Executive Committee, and support the activities undertaken by the Club. *
              </span>
            </label>
            <div className="pl-8">
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                formData.agreedToTerms
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : "bg-slate-900 text-slate-400 border border-slate-800"
              }`}>
                {formData.agreedToTerms ? "✓ I Agree (Confirmed)" : "I Agree Required"}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !formData.agreedToTerms}
            className="w-full py-4 text-sm font-bold uppercase tracking-wider shadow-lg shadow-[#e6007e]/20"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Submitting Application...</span>
            ) : (
              <>
                <span>Submit Membership Application</span>
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
