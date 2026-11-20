import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AmbientBackground from "../components/AmbientBackground";
import { AdminProvider } from "../context/AdminContext";
import LaunchGate from "../components/LaunchGate";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rotaractsltc.vercel.app";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rotaract Club of SLTC | Official Website",
    template: "%s | Rotaract Club of SLTC",
  },
  description:
    "Official website of the Rotaract Club of SLTC (Sri Lanka Technological Campus) Research University. Operating under Rotary International District 3220 (Zone 5), sponsored by Rotary Club of Colombo Centennial. Explore community service projects, youth leadership, professional development, and upcoming club events.",
  applicationName: "Rotaract Club of SLTC",
  keywords: [
    "Rotaract Club of SLTC",
    "Rotaract SLTC",
    "SLTC Rotaract",
    "RAC SLTC",
    "Rotaract District 3220",
    "SLTC Research University",
    "Rotary International District 3220",
    "Rotaract Club Padukka",
    "Rotary Club of Colombo Centennial",
    "SLTC Clubs and Societies",
    "Sri Lanka Rotaract",
    "Youth Leadership Sri Lanka",
  ],
  authors: [{ name: "Rotaract Club of SLTC", url: siteUrl }],
  creator: "Rotaract Club of SLTC",
  publisher: "Rotaract Club of SLTC",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    type: "website",
    locale: "en_LK",
    url: siteUrl,
    title: "Rotaract Club of SLTC | Official Website",
    description:
      "Official website of the Rotaract Club of SLTC Research University. Operating under Rotary International District 3220. Ignite Potential, Inspire Impact, Serve with Passion.",
    siteName: "Rotaract Club of SLTC",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rotaract Club of SLTC Official Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rotaract Club of SLTC | Official Website",
    description:
      "Official website of the Rotaract Club of SLTC Research University. Rotary International District 3220.",
    images: ["/images/og-image.png"],
    creator: "@rotaract_sltc",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "46rZdmT52qRuxdUL1DX5nQNroanLM_zwgpCVi35TeZg",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: "Rotaract Club of SLTC",
  alternateName: [
    "Rotaract SLTC",
    "RAC SLTC",
    "Rotaract Club of Sri Lanka Technological Campus",
    "Rotaract Club of SLTC Research University",
  ],
  url: siteUrl,
  logo: `${siteUrl}/images/rotaract-sltc-clean-logo.png`,
  image: `${siteUrl}/images/og-image.png`,
  description:
    "Official website of the Rotaract Club of SLTC (Sri Lanka Technological Campus) Research University. Operating under Rotary International District 3220, Zone 5.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Ingiriya Road, Meepe",
    addressLocality: "Padukka",
    addressRegion: "Western Province",
    postalCode: "10500",
    addressCountry: "LK",
  },
  parentOrganization: {
    "@type": "Organization",
    name: "Rotary International District 3220",
  },
  sponsor: {
    "@type": "Organization",
    name: "Rotary Club of Colombo Centennial",
  },
  sameAs: [
    "https://www.facebook.com/share/19mguwo9sP/",
    "https://www.instagram.com/rotaract_sltc",
    "https://sltc.ac.lk/campus-life/clubs-societies/",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="46rZdmT52qRuxdUL1DX5nQNroanLM_zwgpCVi35TeZg"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="bg-[#07090e] text-slate-100 min-h-screen flex flex-col antialiased relative selection:bg-[#e6007e]/30 selection:text-white"
        suppressHydrationWarning
      >
        <AdminProvider>
          <LaunchGate>
            <AmbientBackground />
            <Navbar />
            <main className="flex-grow relative">{children}</main>
            <Footer />
          </LaunchGate>
        </AdminProvider>
      </body>
    </html>
  );
}
