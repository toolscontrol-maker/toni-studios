import type { Metadata } from "next";
import { Jost } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { UIProvider } from "@/context/UIContext";
import { CartProvider } from "@/context/CartContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import ShippingBanner from "@/components/ShippingBanner";
import MenuDrawer from "@/components/MenuDrawer";
import CookieBanner from "@/components/CookieBanner";
import TransitionProvider from "@/components/TransitionProvider";

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
});

const coolvetica = localFont({
  src: "../../coolvetica/Coolvetica Rg.otf",
  variable: "--font-coolvetica",
});

export const metadata: Metadata = {
  title: "TONET",
  description: "TONET — Online Store",
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jost.variable} ${coolvetica.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <TransitionProvider>
        <LocaleProvider>
          <UIProvider>
            <CartProvider>
              <AuthProvider>
              <WishlistProvider>
                <ShippingBanner />
                <Navbar />
                <CartDrawer />
                <MenuDrawer />
                <main>{children}</main>
                <Footer />
                <CookieBanner />
                {/* <Analytics /> */}
              </WishlistProvider>
              </AuthProvider>
            </CartProvider>
          </UIProvider>
        </LocaleProvider>
        </TransitionProvider>
      </body>
    </html>
  );
}
