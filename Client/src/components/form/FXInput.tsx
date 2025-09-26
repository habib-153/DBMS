"use client";

import { Input } from "@heroui/input";
import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface IProps {
  variant?: "flat" | "bordered" | "faded" | "underlined";
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  size?: "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  label?: string;
  placeholder?: string;
  description?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  type?: "text" | "email" | "url" | "password" | "tel" | "search" | "file";
  name: string;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  classNames?: Partial<
    Record<
      | "base"
      | "label"
      | "inputWrapper"
      | "innerWrapper"
      | "mainWrapper"
      | "input"
      | "clearButton"
      | "helperWrapper"
      | "description"
      | "errorMessage",
      string
    >
  >;
}

export default function FXInput({
  variant = "flat",
  color = "default",
  size = "md",
  radius = "lg",
  label,
  placeholder,
  description,
  isRequired = false,
  isDisabled = false,
  isReadOnly = false,
  type = "text",
  name,
  startContent,
  endContent,
  classNames,
}: IProps) {
  const [isVisible, setIsVisible] = useState(false);
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const hasError = !!errors[name];
  const errorMessage = errors?.[name]?.message as string;

  const toggleVisibility = () => setIsVisible(!isVisible);

  const finalEndContent =
    type === "password" ? (
      <button
        className="focus:outline-none"
        type="button"
        onClick={toggleVisibility}
      >
        {isVisible ? (
          <EyeOff className="w-5 h-5 text-inherit/60 hover:text-inherit/80 transition-colors" />
        ) : (
          <Eye className="w-5 h-5 text-inherit/60 hover:text-inherit/80 transition-colors" />
        )}
      </button>
    ) : (
      endContent
    );

  return (
    <Input
      {...register(name)}
      classNames={{
        base: "bg-transparent",
        mainWrapper: "bg-transparent border-gray-400",
        input:
          "placeholder:text-gray-500 border-0 focus:ring-0 focus-within:outline-none",
        inputWrapper:
          "bg-gray-50 dark:bg-gray-800 border-1 border-gray-200 dark:border-gray-700 hover:border-brand-primary/50 focus-within:border-brand-primary shadow-sm",
        innerWrapper: "bg-transparent",
        label: "text-gray-700 dark:text-gray-300 font-medium",
        errorMessage: "text-red-400 drop-shadow-sm",
        ...classNames,
      }}
      color={hasError ? "danger" : color}
      description={description}
      endContent={finalEndContent}
      errorMessage={errorMessage}
      isDisabled={isDisabled}
      isInvalid={hasError}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
      label={label}
      placeholder={placeholder}
      radius={radius}
      size={size}
      startContent={startContent}
      type={type === "password" ? (isVisible ? "text" : "password") : type}
      variant={variant}
    />
  );
}
