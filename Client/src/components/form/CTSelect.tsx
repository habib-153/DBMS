import { useFormContext } from "react-hook-form";
import { Select, SelectItem } from "@heroui/react";

import { IInput } from "@/src/types";

interface IProps extends IInput {
  options: { key: string; label: string; value: string }[];
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export default function CTSelect({
  options,
  name,
  label,
  variant = "bordered",
  disabled,
}: IProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <Select
      {...register(name)}
      className="min-w-full sm:min-w-[225px]"
      isDisabled={disabled}
      label={label}
      variant={variant}
    >
      {options.map((option) => (
        <SelectItem key={option.key}>{option.label}</SelectItem>
      ))}
    </Select>
  );
}
