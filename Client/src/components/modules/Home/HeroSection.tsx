"use client";

import { Button } from "@heroui/button";
import Image from "next/image";
import Link from "next/link";

import { useUser } from "@/src/context/user.provider";
import backgroundBanner from "@/src/assets/backgroundBanner.jpg";

interface HeroSectionProps {
  onRegisterClick: () => void;
}

export default function HeroSection({ onRegisterClick }: HeroSectionProps) {
  const { user } = useUser();

  return (
    <div className="relative h-[400px] rounded-xl overflow-hidden mb-6">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          fill
          priority
          alt="Crime reporting background"
          className="object-cover"
          quality={90}
          src={backgroundBanner}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Stay Informed, Stay Safe
          </h1>
          <p className=" md:text-lg text-white/90 mb-6 drop-shadow-md">
            Join our community to report, verify, and stay updated on local
            crime incidents.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Button
                  className="bg-brand-primary hover:bg-brand-secondary text-white font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                  onClick={onRegisterClick}
                >
                  Register Now
                </Button>
                <Button
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-3 text-lg transition-all"
                  size="lg"
                  variant="bordered"
                >
                  <Link href="/posts">Learn More</Link>
                </Button>
              </>
            ) : (
              <Button
                className="bg-brand-primary hover:bg-brand-secondary text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                <Link href="/posts">View All Reports</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
