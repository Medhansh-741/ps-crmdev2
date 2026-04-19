'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Animatedheader from "@/components/Animatedheader";
import FadedText from "@/components/Fadedtext";
import { MegaFooter } from "@/components/MegaFooter";
import { useTheme } from "@/components/ThemeProvider";

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface DocumentationClientProps {
  styleMarkup: string;
  bodyMarkup: string;
}

export default function DocumentationClient({ styleMarkup, bodyMarkup }: DocumentationClientProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const mainRef = useRef<HTMLElement>(null);

  const bgClass = isDark ? "bg-[#2a221c] text-[#e9ddce]" : "bg-[#ddd1c0] text-[#1c1612]";

  useGSAP(() => {
    // Initial entrance animation for the content
    gsap.fromTo(
      ".docs-aesthetic-wrapper",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.2 }
    );
  }, { scope: mainRef });

  return (
    <main ref={mainRef} className={`flex min-h-screen flex-col transition-colors duration-500 font-sans ${bgClass}`}>
      <Animatedheader />

      <style dangerouslySetInnerHTML={{ __html: styleMarkup }} />

      <section className="relative px-6 pt-32 pb-20 lg:px-20 flex flex-col items-center">
        <FadedText 
          text="DOCS" 
          className="absolute top-20 left-1/2 -translate-x-1/2 text-[10rem] md:text-[15rem] opacity-5 pointer-events-none font-bold select-none" 
        />
        
        <div className="mx-auto w-full max-w-5xl relative z-10 docs-aesthetic-wrapper">
          <div
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: bodyMarkup }}
          />
        </div>
      </section>

      <MegaFooter
        brandColor={isDark ? "#ffffff" : "#000000"}
        brandColorDark="#ffffff"
        brandName="Team 404"
        tagline="Designing delightful digital experiences."
        socialLinks={[
          { platform: "twitter", href: "https://twitter.com" },
          { platform: "github", href: "https://github.com/Medhansh-741/ps-crm" },
          { platform: "linkedin", href: "https://linkedin.com" },
        ]}
        showNewsletter={true}
        newsletterTitle="Stay updated"
      />
    </main>
  );
}
