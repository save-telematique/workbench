import React from "react";
import { Link } from "@inertiajs/react";
import { cn } from "@/lib/utils";

interface LicensePlateProps {
  registration: string;
  href?: string;
  countryCode?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LicensePlate({
  registration,
  href,
  countryCode = "F",
  className,
  size = "md",
}: LicensePlateProps) {
  // Size-based styles
  const plateStyles = {
    sm: {
      container: "h-6",
      band: "min-w-5 py-[1px] px-[2px]",
      stars: "w-3",
      starSize: "w-[1.5px] h-[1.5px]",
      country: "text-[8px]",
      text: "text-[10px] px-1",
    },
    md: {
      container: "h-7",
      band: "min-w-6 py-[1px] px-1",
      stars: "w-4",
      starSize: "w-[2px] h-[2px]",
      country: "text-[10px]",
      text: "text-xs px-2",
    },
    lg: {
      container: "h-9",
      band: "min-w-8 py-1 px-1.5",
      stars: "w-5",
      starSize: "w-[2.5px] h-[2.5px]",
      country: "text-xs",
      text: "text-sm px-3",
    },
  };

  const styles = plateStyles[size];

  // Format registration based on common patterns (optional)
  const formatRegistration = (reg: string): string => {
    // For French plates: AB-123-CD pattern
    if (countryCode === "F" && reg.length >= 7 && !reg.includes("-")) {
      return `${reg.slice(0, 2)}-${reg.slice(2, 5)}-${reg.slice(5, 7)}`;
    }
    return reg;
  };

  const formattedRegistration = formatRegistration(registration);

  const LicensePlateContent = () => (
    <div className="inline-flex items-center">
      {/* Complete plate with shadow and border */}
      <div className={cn("flex rounded-[3px] overflow-hidden border relative", styles.container)}>
        {/* Reflective effect on entire plate */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none z-10"></div>
        
        {/* Blue EU band with stars and country code */}
        <div className={cn("bg-[#003399] text-white flex flex-col items-center justify-center", styles.band)}>
          {/* EU stars circle - only for lg size */}
          {size === "lg" && (
            <div className="flex justify-center mb-0.5">
              <div className={cn("flex flex-wrap justify-center", styles.stars)}>
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className={cn("bg-yellow-300 rounded-full m-[0.5px]", styles.starSize)}
                    style={{
                      transform: `rotate(${i * 30}deg) translateY(-5px)`,
                      transformOrigin: 'center center',
                      position: i === 0 ? 'relative' : 'absolute'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          {/* Country code */}
          <span className={cn("font-bold", styles.country)}>{countryCode}</span>
        </div>
        
        {/* White plate with registration */}
        <div className="bg-white flex items-center justify-center flex-1">
          <span className={cn("font-bold tracking-wider", styles.text)}>{formattedRegistration}</span>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={cn("hover:opacity-80 transition-opacity", className)}>
        <LicensePlateContent />
      </Link>
    );
  }

  return (
    <div className={className}>
      <LicensePlateContent />
    </div>
  );
} 