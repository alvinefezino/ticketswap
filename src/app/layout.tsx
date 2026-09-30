import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"], display: "swap", weight: ["400","500","600","700","800","900"] });
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#00C2A8",
};

export const metadata: Metadata = {
  title: "TicketSwap | Safe & fair ticket resale",
  description: "The safest way to buy and sell tickets with over 20.6 million fans. Prices capped at 20% above face value. Primary tickets from 6000+ partnered events. SecureSwap.",
  openGraph: {
  title: "TicketSwap | Safe & fair ticket resale",
  description: "Prices capped at 20% above face value. Primary tickets from 6000+ partnered events.",
  type: "website",
  },
};

function ThemeScript() {
  const code = `(function(){
  try{
  var k='theme';
  var s=localStorage.getItem(k);
  if(s==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark');if(!s)localStorage.setItem(k,'dark')}
  }catch(e){document.documentElement.classList.add('dark')}
})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
  <html lang="en" suppressHydrationWarning>
  <head><ThemeScript /></head>
  <body className={inter.className}>
  <AuthProvider>{children}</AuthProvider>
  </body>
  </html>
  );
}
