"use client";

import { Input } from "@heroui/input";
import { useFormContext } from "react-hook-form";

interface IProps {
  size?: "sm" | "md" | "lg";
  required?: boolean;
  type?: string;
  label: string;
  name: string;
  radius?: "sm" | "md" | "lg" | "none" | "full";
}

export default function FXInput({
  size = "md",
  required = false,
  type = "text",
  radius = "lg",
  label,
  name,
}: IProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <Input
      {...register(name)}
      className="focus-within:border-0"
      errorMessage={errors?.[name] ? (errors?.[name]?.message as string) : ""}
      isInvalid={!!errors[name]}
      label={label}
      radius={radius}
      required={required}
      size={size}
      type={type}
    />
  );
}