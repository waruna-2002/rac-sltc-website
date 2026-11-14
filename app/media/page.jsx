"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Download, 
  BookOpen, 
  Newspaper, 
  FileText, 
  Clock, 
  Calendar, 
  X, 
  ArrowRight,
  PenTool
} from "lucide-react";
import { getStoredMedia } from "@/lib/mediaStore";
import AnimatedPageHeader from "@/components/AnimatedPageHeader";

function MediaContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category"); // "blogs" | "articles" | "bulletins"

  const [mediaItems, setMediaItems] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [readingItem, setReadingItem] = useState(null);

  useEffect(() => {
    // Only load approved media for public viewing
    const all = getStoredMedia();
    setMediaItems(all.filter((m) => m.status === "approved" || !m.status));

    const handleUpdate = (e) => {
      if (Array.isArray(e.detail)) {
        setMediaItems(e.detail.filter((m) => m.status === "approved" || !m.status));
      }
    };
    window.addEventListener("rotaract_media_updated", handleUpdate);
    return () => window.removeEventListener("rotaract_media_updated", handleUpdate);
  }, []);

  useEffect(() => {
    if (categoryParam && ["blogs", "articles", "bulletins"].includes(categoryParam.toLowerCase())) {
      setActiveTab(categoryParam.toLowerCase());
    } else {
      setActiveTab("all");
    }
  }, [categoryParam]);

  const blogs = mediaItems.filter((m) => m.type === "blog");
  const articles = mediaItems.filter((m) => m.type === "article");
  const bulletins = mediaItems.filter((m) => m.type === "bulletin");

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      {/* Animated Drop-Down Header */}
      <AnimatedPageHeader
        badge="Rotaract SLTC Editorial & Publications"
        title="Media & Publications"
        highlightWord="Publications"
        subtitle="Explore student volunteer reflections, official editorial articles, and annual impact reports from Rotaract Club of SLTC."
      >
        {/* Action & Filter Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <div className="inline-flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All ({mediaItems.length})
            </button>

            <button
              onClick={() => setActiveTab("blogs")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "blogs"
                  ? "bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen size={14} />
              <span>Blogs ({blogs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("articles")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "articles"
                  ? "bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Newspaper size={14} />
              <span>Articles ({articles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("bulletins")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "bulletins"
                  ? "bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText size={14} />
              <span>Bulletins ({bulletins.length})</span>
            </button>
          </div>

          {/* Submit Story Button */}
          <Link
            href="/media/submit"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-[#e6007e] text-slate-200 text-xs font-bold transition-all flex items-center gap-2"
          >
            <PenTool size={13} className="text-[#e6007e]" />
            <span>Submit a Story</span>
          </Link>
        </div>
      </AnimatedPageHeader>

      {/* --- SECTION 1: BLOGS & STORIES --- */}
      {(activeTab === "all" || activeTab === "blogs") && blogs.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-[#e6007e]" />
              <h2 className="text-xl font-bold text-white tracking-wide">
                Member Blogs & Stories
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">{blogs.length} Stories</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                onClick={() => setReadingItem(blog)}
                className="group rounded-2xl bg-[#0c1017] border border-slate-800 hover:border-slate-700 transition-all duration-300 overflow-hidden shadow-lg flex flex-col justify-between cursor-pointer hover:-translate-y-1"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <Image
                      src={blog.image || "/images/projects/project1.jpg"}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-200 font-bold text-[10px] uppercase tracking-wider">
                      {blog.avenue}
                    </span>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Clock size={12} />
                      <span>{blog.readTime || "4 min read"}</span>
                      <span>•</span>
                      <span>{blog.date}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-[#e6007e] transition-colors line-clamp-2">
                      {blog.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {blog.summary}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-800/80 mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                      {(blog.author || "R").slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs text-slate-300 font-medium truncate max-w-[140px]">
                      {blog.author}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-[#e6007e] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Story <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- SECTION 2: ARTICLES & EDITORIALS --- */}
      {(activeTab === "all" || activeTab === "articles") && articles.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Newspaper size={18} className="text-[#e6007e]" />
              <h2 className="text-xl font-bold text-white tracking-wide">
                Special Articles & Editorial Opinions
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">{articles.length} Publications</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div
                key={article.id}
                onClick={() => setReadingItem(article)}
                className="group rounded-2xl bg-[#0c1017] border border-slate-800 hover:border-slate-700 transition-all duration-300 overflow-hidden shadow-lg flex flex-col justify-between cursor-pointer hover:-translate-y-1"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    {article.image ? (
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-[#0c1017] to-slate-950 p-4 text-center">
                        <Newspaper size={32} className="text-slate-700 mb-2" />
                        <span className="text-xs font-semibold text-slate-400">{article.avenue}</span>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-200 font-bold text-[10px] uppercase tracking-wider">
                      {article.avenue}
                    </span>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Clock size={12} />
                      <span>{article.readTime || "5 min read"}</span>
                      <span>•</span>
                      <span>{article.date}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-[#e6007e] transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-800/80 mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                      {(article.author || "E").slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs text-slate-300 font-medium truncate max-w-[140px]">
                      {article.author}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-[#e6007e] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- SECTION 3: BULLETINS & IMPACT REPORTS (DANATA TIYENA TIKA) --- */}
      {(activeTab === "all" || activeTab === "bulletins") && bulletins.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-[#e6007e]" />
              <h2 className="text-xl font-bold text-white tracking-wide">
                Official Bulletins & Impact Reports
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">{bulletins.length} Documents</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {bulletins.map((bulletin) => (
              <div
                key={bulletin.id}
                className="p-6 rounded-2xl bg-[#0c1017] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-lg"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-bold uppercase">
                      {bulletin.issue || "PDF Document"}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{bulletin.size}</span>
                  </div>

                  <h3 className="text-base font-bold text-white">{bulletin.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {bulletin.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400">{bulletin.date}</span>

                  <a
                    href={bulletin.fileUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-[#e6007e] hover:text-white text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <Download size={13} />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- EMPTY STATE WHEN NO PUBLICATIONS EXIST --- */}
      {blogs.length === 0 && articles.length === 0 && bulletins.length === 0 && (
        <div className="text-center py-20 px-6 rounded-3xl bg-[#0c1017]/60 border border-slate-800 max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#e6007e]/10 text-[#ff4d94] flex items-center justify-center mx-auto border border-[#e6007e]/30">
            <BookOpen size={26} />
          </div>
          <h3 className="text-lg font-bold text-white">No Publications Published Yet</h3>
          <p className="text-xs text-slate-400 font-light leading-relaxed">
            Articles, blogs, and official club bulletins for the current term will appear here once published by the Editorial &amp; Public Image team.
          </p>
        </div>
      )}

      {/* --- READER MODAL FOR BLOGS & ARTICLES --- */}
      {readingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setReadingItem(null)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#0c1017] border border-slate-800 overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col">
            {/* Header Cover Image */}
            <div className="relative h-60 sm:h-64 w-full bg-slate-900 shrink-0">
              <Image
                src={readingItem.image || "/images/projects/project1.jpg"}
                alt={readingItem.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c1017] via-[#0c1017]/70 to-transparent" />

              {/* Close Button */}
              <button
                onClick={() => setReadingItem(null)}
                aria-label="Close reader"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <span className="px-3 py-1 rounded-full bg-[#e6007e] text-white text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">
                  {readingItem.avenue} • {readingItem.type?.toUpperCase()}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  {readingItem.title}
                </h2>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              {/* Meta Info Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm">
                    {(readingItem.author || "R").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{readingItem.author}</h4>
                    <p className="text-[11px] text-[#e6007e]">{readingItem.authorRole || "Rotaractor"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> {readingItem.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> {readingItem.readTime || "4 min read"}
                  </span>
                </div>
              </div>

              {/* Story Body */}
              <div className="text-slate-300 text-sm sm:text-base leading-relaxed space-y-4 font-light whitespace-pre-line">
                {readingItem.content}
              </div>

              {/* Modal Footer */}
              <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Published by <strong>Rotaract Club of SLTC</strong>
                </span>
                <button
                  onClick={() => setReadingItem(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                >
                  Close Reader
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MediaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-32 text-center text-slate-400 text-sm">
          Loading Media & Publications...
        </div>
      }
    >
      <MediaContent />
    </Suspense>
  );
}
