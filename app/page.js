"use client";

import React, { useState } from "react";
import HeroSection from "@/components/HeroSection";
import StatsCounter from "@/components/StatsCounter";
import AvenueCard from "@/components/AvenueCard";
import ProjectModal from "@/components/ProjectModal";
import avenuesData from "@/data/avenues.json";
import projectsData from "@/data/projects.json";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Eye, Target, Sparkles, Rocket, Calendar } from "lucide-react";

export default function HomePage() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div className="space-y-20 pb-20 bg-[#07090e] overflow-hidden">
      {/* 1. Hero Banner */}
      <HeroSection />

      {/* 2. Key Live Stats */}
      <StatsCounter />

      {/* 3. Who We Are Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        {/* Subtle Ambient Background Light */}
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-[#e6007e]/10 blur-[130px] rounded-full pointer-events-none -z-0" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6007e]/10 border border-[#e6007e]/30 text-[11px] font-bold tracking-widest text-[#e6007e] uppercase mb-3">
              <Sparkles size={12} />
              <span>WHO WE ARE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-5 tracking-tight">
              Empowering Leaders, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e6007e] via-[#ff4d94] to-cyan-300">
                Transforming Communities.
              </span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 font-light">
              The Rotaract Club of SLTC brings together passionate undergraduates dedicated to leadership, tech innovation, and humanitarian service. Based at SLTC Research University, we empower students to lead meaningful community initiatives and cultivate high-impact skills.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div
                whileHover={{ y: -4 }}
                className="p-5 rounded-2xl bg-[#0c1017]/80 border border-slate-800/80 hover:border-[#e6007e]/50 backdrop-blur-xl transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-[#e6007e] mb-3">
                  <Target size={20} />
                </div>
                <h4 className="text-white font-bold text-sm">Our Mission</h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  To foster responsible youth leadership through impactful service above self.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="p-5 rounded-2xl bg-[#0c1017]/80 border border-slate-800/80 hover:border-[#e6007e]/50 backdrop-blur-xl transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-cyan-400 mb-3">
                  <Eye size={20} />
                </div>
                <h4 className="text-white font-bold text-sm">Our Vision</h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Building an inspired university community dedicated to social impact.
                </p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#e6007e] to-cyan-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-500" />
            <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900">
              <Image
                src="/images/hero.jpg"
                alt="SLTC Rotaract Youth Leaders"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs font-bold tracking-widest text-[#ff4d94] uppercase bg-[#0c1017]/80 backdrop-blur-md px-3 py-1 rounded-full border border-[#e6007e]/40">
                  SLTC Research University Chapter
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. Our Avenues of Service */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6007e]/10 border border-[#e6007e]/30 text-[11px] font-bold tracking-widest text-[#e6007e] uppercase mb-3">
            <Rocket size={12} />
            <span>OUR AVENUES OF SERVICE</span>
          </div>
          <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Areas of Impact
          </h3>
          <p className="text-slate-400 text-sm sm:text-base mt-3 font-light">
            Explore the core avenues through which our members drive positive transformation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {avenuesData.map((ave) => (
            <AvenueCard key={ave.id} {...ave} />
          ))}
        </div>
      </section>

      {/* 5. Featured Projects */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6007e]/10 border border-[#e6007e]/30 text-[11px] font-bold tracking-widest text-[#e6007e] uppercase mb-3">
              <Sparkles size={12} />
              <span>PORTFOLIO</span>
            </div>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Featured Projects
            </h3>
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#e6007e] hover:text-white transition-colors uppercase tracking-widest bg-slate-900 border border-slate-800 hover:border-[#e6007e] px-4 py-2.5 rounded-xl self-start sm:self-auto"
          >
            <span>View All Projects</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projectsData.map((proj, idx) => (
            <motion.div
              key={proj.id}
              onClick={() => setSelectedProject(proj)}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="rounded-2xl bg-[#0c1017]/80 border border-slate-800/90 overflow-hidden hover:border-[#e6007e]/60 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-[0_0_30px_rgba(230,0,126,0.2)] backdrop-blur-xl cursor-pointer"
            >
              <div className="relative h-48 sm:h-52 bg-slate-900 overflow-hidden">
                <Image
                  src={proj.image}
                  alt={proj.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1017] via-transparent to-transparent opacity-90" />
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#ff4d94] bg-[#0c1017]/90 px-3 py-1 rounded-full border border-[#e6007e]/40 backdrop-blur-md">
                    {proj.avenue}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2 font-medium">
                    <Calendar size={13} className="text-[#e6007e]" />
                    <span>{proj.date}</span>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-[#ff4d94] transition-colors leading-snug">
                    {proj.title}
                  </h4>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6 font-light">
                    {proj.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-400 text-[11px] tracking-wide">{proj.impact}</span>
                  <span
                    className="text-[#e6007e] font-bold hover:text-white transition-colors flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>View Details</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Project Details Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}