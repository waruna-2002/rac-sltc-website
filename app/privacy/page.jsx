"use client";

import React from "react";
import AnimatedPageHeader from "@/components/AnimatedPageHeader";

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-28 pb-20 px-6 max-w-4xl mx-auto space-y-6 text-slate-300 text-sm leading-relaxed">
      <AnimatedPageHeader
        badge="Legal & Compliance"
        title="Privacy Policy"
        highlightWord="Policy"
        subtitle="Official data protection and privacy practices of the Rotaract Club of SLTC."
        align="left"
        showDivider={false}
      />
      <p>
        The Rotaract Club of SLTC is committed to protecting the privacy of its members, partners, and visitors. This policy outlines how we handle data collected through our website.
      </p>
      <h3 className="text-lg font-bold text-white pt-2">Data Collection</h3>
      <p>
        We only collect personal information submitted voluntarily via our membership recruitment form (`/join-us`), newsletter subscription, or contact form.
      </p>
      <h3 className="text-lg font-bold text-white pt-2">Use of Information</h3>
      <p>
        Submitted details are solely utilized for internal club communication, official registrations, and district reporting. We do not sell or distribute personal information to third parties.
      </p>
    </div>
  );
}