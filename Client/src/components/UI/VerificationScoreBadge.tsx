"use client";

import React from "react";
import { Chip } from "@heroui/react";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

interface VerificationScoreBadgeProps {
  score: number;
  reportCount?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function VerificationScoreBadge({
  score,
  reportCount = 0,
  size = "md",
  showLabel = true,
}: VerificationScoreBadgeProps) {
  const getScoreColor = () => {
    if (score >= 60) return "success";
    if (score >= 40) return "primary";
    if (score >= 20) return "warning";

    return "danger";
  };

  const getScoreIcon = () => {
    if (score >= 60) return <ShieldCheck size={size === "sm" ? 14 : 16} />;
    if (score >= 40) return <ShieldCheck size={size === "sm" ? 14 : 16} />;
    if (score >= 20) return <ShieldAlert size={size === "sm" ? 14 : 16} />;

    return <ShieldX size={size === "sm" ? 14 : 16} />;
  };

  const getLabel = () => {
    if (score >= 60) return "Highly Verified";
    if (score >= 40) return "Verified";
    if (score >= 20) return "Low Verification";

    return "Unverified";
  };

  return (
    <div className="flex items-center gap-2">
      <Chip
        classNames={{
          base: "gap-1",
        }}
        color={getScoreColor()}
        size={size}
        startContent={getScoreIcon()}
        variant="flat"
      >
        {showLabel ? getLabel() : `Score: ${score.toFixed(1)}`}
      </Chip>
      {reportCount > 0 && (
        <Chip
          classNames={{
            base: "gap-1",
          }}
          color="danger"
          size={size}
          variant="flat"
        >
          {reportCount} {reportCount === 1 ? "Report" : "Reports"}
        </Chip>
      )}
    </div>
  );
}
