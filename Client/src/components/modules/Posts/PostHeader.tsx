"use client";

import { Button } from "@heroui/react";
import { Plus } from "lucide-react";

interface PostHeaderProps {
  onCreatePost: () => void;
  title?: string;
  subtitle?: string;
  showCreateButton?: boolean;
}

export default function PostHeader({
  onCreatePost,
  title = "Crime Reports",
  subtitle = "Community-verified crime reports and safety alerts",
  showCreateButton = true,
}: PostHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
      </div>
      {showCreateButton && (
        <Button
          className="bg-brand-gradient text-white font-medium shadow-lg hover:shadow-xl transition-all"
          startContent={<Plus size={18} />}
          onClick={onCreatePost}
        >
          Create Report
        </Button>
      )}
    </div>
  );
}
