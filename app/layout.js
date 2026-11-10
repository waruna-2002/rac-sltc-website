import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminToolbar from "../components/AdminToolbar";
import GlobalAdminEditModal from "../components/GlobalAdminEditModal";
import AmbientBackground from "../components/AmbientBackground";
import { AdminProvider } from "../context/AdminContext";

export const metadata = {
  title: "Rotaract Club of SLTC",
  description: "Official Website of the Rotaract Club of SLTC Research University",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-[#07090e] text-slate-100 min-h-screen flex flex-col antialiased relative selection:bg-[#e6007e]/30 selection:text-white" suppressHydrationWarning>
        <AdminProvider>
          <AmbientBackground />
          <AdminToolbar />
          <Navbar />
          <main className="flex-grow relative z-10">
            {children}
          </main>
          <Footer />
          <GlobalAdminEditModal />
        </AdminProvider>
      </body>
    </html>
  );
}
