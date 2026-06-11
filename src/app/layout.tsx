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

const helveticaRoman = localFont({
  src: "../../helvetica-neue-55-cufonfonts/HelveticaNeue-Roman.otf",
  variable: "--font-helvetica-roman",
});

const helveticaMedium = localFont({
  src: "../../helvetica-neue-55-cufonfonts/HelveticaNeueMedium.ttf",
  variable: "--font-helvetica-medium",
});

const helveticaLight = localFont({
  src: "../../helvetica-neue-55-cufonfonts/HelveticaNeueLight.ttf",
  variable: "--font-helvetica-light",
});

const helveticaBoldCond = localFont({
  src: "../../helvetica-neue-55-cufonfonts/HelveticaNeueCondensedBold.ttf",
  variable: "--font-helvetica-bold-cond",
});

const helveticaHeavy = localFont({
  src: "../../helvetica-neue-55-cufonfonts/HelveticaNeue-Heavy.otf",
  variable: "--font-helvetica-heavy",
});

const helveticaExtBlackCond = localFont({
  src: "../../helvetica-neue-55-cufonfonts/HelveticaNeue-ExtBlackCond.otf",
  variable: "--font-helvetica-ext-black-cond",
});

const helveticaHeavyCond = localFont({
  src: "../../helvetica-neue-55-cufonfonts/HelveticaNeue-HeavyCond.otf",
  variable: "--font-helvetica-heavy-cond",
});

const helveticaMediumCond = localFont({
  src: "../../helvetica-neue-55-cufonfonts/HelveticaNeue-MediumCond.otf",
  variable: "--font-helvetica-medium-cond",
});

const helveticaThinCond = localFont({
  src: "../../helvetica-neue-55-cufonfonts/HelveticaNeue-ThinCond.otf",
  variable: "--font-helvetica-thin-cond",
});

const helveticaUltraLightCond = localFont({
  src: "../../helvetica-neue-55-cufonfonts/HelveticaNeue-UltraLigCond.otf",
  variable: "--font-helvetica-ultra-light-cond",
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
    <html lang="en" className={`${jost.variable} ${coolvetica.variable} ${helveticaRoman.variable} ${helveticaMedium.variable} ${helveticaLight.variable} ${helveticaBoldCond.variable} ${helveticaHeavy.variable} ${helveticaExtBlackCond.variable} ${helveticaHeavyCond.variable} ${helveticaMediumCond.variable} ${helveticaThinCond.variable} ${helveticaUltraLightCond.variable}`} suppressHydrationWarning>
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
