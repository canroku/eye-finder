import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { ReferralCapture } from "@/components/ReferralCapture";
import { PwaRegister } from "@/components/PwaRegister";
import { AppChrome } from "@/components/layout/AppChrome";
import { AuthProvider } from "@/contexts/AuthProvider";
import "./globals.css";

const displayFont = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eye Finder — Küresel İlgi Analizi",
  description:
    "Profilin dünyanın hangi bölgelerinde daha yüksek ilgi oluşturabilir? Kültürel uyum ve tercih analizi.",
  applicationName: "Eye Finder",
  appleWebApp: {
    capable: true,
    title: "Eye Finder",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem("eye-finder-theme")||"amber";if(t!=="emerald"&&t!=="violet")t="amber";document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      data-theme="amber"
      className={`${displayFont.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          id="eye-finder-theme-init"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="min-h-full">
        <AuthProvider>
          <ReferralCapture />
          <PwaRegister />
          <AppChrome>{children}</AppChrome>
        </AuthProvider>
      </body>
    </html>
  );
}
