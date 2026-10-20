"use client";

import React, { useState, useEffect } from "react";
import { useAdmin } from "@/context/AdminContext";
import { getStoredSiteContent, saveStoredSiteContent } from "@/lib/siteStore";
import { getStoredStats, saveStoredStats } from "@/lib/statsStore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { X, Save, Edit3, Sparkles } from "lucide-react";

export default function GlobalAdminEditModal() {
  const { editModalConfig, closeEditModal, isSuperAdmin } = useAdmin();
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!editModalConfig) return;
    const { type } = editModalConfig;

    if (type === "hero" || type === "about" || type === "contact") {
      setFormData(getStoredSiteContent());
    } else if (type === "stats") {
      setFormData(getStoredStats());
    }
  }, [editModalConfig]);

  if (!editModalConfig || !isSuperAdmin) return null;

  const { type } = editModalConfig;

  const handleSave = (e) => {
    e.preventDefault();
    if (type === "hero" || type === "about" || type === "contact") {
      saveStoredSiteContent(formData);
    } else if (type === "stats") {
      saveStoredStats(formData);
    }
    alert("Section updated successfully!");
    closeEditModal();
    window.location.reload(); // Instantly refresh page to reflect changes live!
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={closeEditModal} />

      <form
        onSubmit={handleSave}
        className="relative w-full max-w-xl p-8 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-5 z-10 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Edit3 size={18} className="text-[#e6007e]" />
            <h3 className="text-xl font-bold text-white uppercase tracking-wide">
              Live In-Context Editor ({type})
            </h3>
          </div>
          <button
            type="button"
            onClick={closeEditModal}
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* HERO EDIT FORM */}
        {type === "hero" && (
          <div className="space-y-4">
            <Input
              label="Hero Subtitle / Tagline"
              value={formData.heroSubtitle || ""}
              onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
            />
            <Input
              label="District Badge"
              value={formData.districtBadge || ""}
              onChange={(e) => setFormData({ ...formData, districtBadge: e.target.value })}
            />
          </div>
        )}

        {/* ABOUT EDIT FORM */}
        {type === "about" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">About History Text</label>
              <textarea
                rows={4}
                value={formData.aboutHistory || ""}
                onChange={(e) => setFormData({ ...formData, aboutHistory: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
              />
            </div>
            <Input
              label="Mission Statement"
              value={formData.missionText || ""}
              onChange={(e) => setFormData({ ...formData, missionText: e.target.value })}
            />
            <Input
              label="Vision Statement"
              value={formData.visionText || ""}
              onChange={(e) => setFormData({ ...formData, visionText: e.target.value })}
            />
          </div>
        )}

        {/* CONTACT EDIT FORM */}
        {type === "contact" && (
          <div className="space-y-4">
            <Input
              label="Secretarial Address"
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <Input
              label="Email Address"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Phone Number"
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        )}

        {/* STATS EDIT FORM */}
        {type === "stats" && Array.isArray(formData) && (
          <div className="space-y-4">
            {formData.map((st, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <Input
                  label="Label"
                  value={st.label}
                  onChange={(e) => {
                    const copy = [...formData];
                    copy[idx].label = e.target.value;
                    setFormData(copy);
                  }}
                />
                <Input
                  label="Value"
                  value={st.value}
                  onChange={(e) => {
                    const copy = [...formData];
                    copy[idx].value = e.target.value;
                    setFormData(copy);
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={closeEditModal}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold uppercase"
          >
            Cancel
          </button>
          <Button type="submit" className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider">
            <Save size={14} />
            <span>Save Section</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
