"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2, Loader2 } from "lucide-react";

export default function ImageUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [avenue, setAvenue] = useState("Community Service");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select an image first");

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("avenue", avenue);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Image uploaded and saved to MongoDB successfully!");
        setFile(null);
        setTitle("");
        if (onUploadSuccess) onUploadSuccess(data.data);
      } else {
        setMessage("Upload failed: " + data.error);
      }
    } catch (err) {
      setMessage("Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="p-6 rounded-2xl bg-[#0c1017] border border-slate-800 space-y-4 max-w-lg mx-auto">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <UploadCloud size={20} className="text-[#e6007e]" />
        Upload Project Image
      </h3>

      <div>
        <label className="text-xs text-slate-400 block mb-1">Image Title</label>
        <input
          type="text"
          required
          placeholder="e.g. Tree Plantation Drive 2026"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-[#e6007e] outline-none"
        />
      </div>

      <div>
        <label className="text-xs text-slate-400 block mb-1">Avenue</label>
        <select
          value={avenue}
          onChange={(e) => setAvenue(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-[#e6007e] outline-none"
        >
          <option value="Community Service">Community Service</option>
          <option value="Professional Development">Professional Development</option>
          <option value="Digital & IT">Digital & IT</option>
          <option value="Club Service">Club Service</option>
          <option value="International Service">International Service</option>
        </select>
      </div>

      <div>
        <label className="text-xs text-slate-400 block mb-1">Select File</label>
        <input
          type="file"
          accept="image/*"
          required
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#e6007e] file:text-white hover:file:bg-[#c4006c] cursor-pointer"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : "Upload to MongoDB"}
      </button>

      {message && (
        <p className="text-xs text-center text-slate-300 flex items-center justify-center gap-1 mt-2">
          <CheckCircle2 size={14} className="text-[#e6007e]" />
          {message}
        </p>
      )}
    </form>
  );
}