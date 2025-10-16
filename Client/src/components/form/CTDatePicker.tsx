import { Controller } from "react-hook-form";
import { DatePicker } from "@heroui/react";
import {
  now,
  getLocalTimeZone,
  CalendarDateTime,
} from "@internationalized/date";

import { IInput } from "@/src/types";

interface IProps extends IInput {}

// Convert plain calendar object to proper DateValue
const convertToDateValue = (val: any) => {
  if (!val) return now(getLocalTimeZone());

  // If it's already a DateValue (has toDate method), return it
  if (val && typeof val.toDate === "function") return val;

  // If it's a plain object with calendar fields, construct CalendarDateTime
  if (val.year && val.month && val.day) {
    try {
      return new CalendarDateTime(
        Number(val.year),
        Number(val.month),
        Number(val.day),
        Number(val.hour ?? 0),
        Number(val.minute ?? 0),
        Number(val.second ?? 0)
      );
    } catch (e) {
      console.warn("Failed to create CalendarDateTime:", e);
      
      return now(getLocalTimeZone());
    }
  }

  return now(getLocalTimeZone());
};

export default function CTDatePicker({
  label,
  name,
  variant = "bordered",
  defaultValue,
}: IProps) {
  return (
    <Controller
      name={name}
      render={({ field: { value, onChange, ...fields } }) => {
        const dateValue = convertToDateValue(value ?? defaultValue);

        return (
          <DatePicker
            hideTimeZone
            showMonthAndYearPickers
            className="min-w-full sm:min-w-[225px]"
            defaultValue={dateValue}
            onChange={onChange}
            granularity="minute"
            label={label}
            timeInputProps={{}}
            variant={variant}
            {...fields}
          />
        );
      }}
    />
  );
}
