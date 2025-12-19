import React from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

import { DatePicker } from "antd";
import type { DatePickerProps } from "antd";
import { useField } from "formik";
import Label from "../Label/Label";

type CustomDatePickerProps = DatePickerProps & {
  label?: string;
  name: string;
  format?: string;
};

// NOTE: This component stores ISO strings in Formik state (e.g. "2023-01-30T00:00:00.000Z").
// You can change to another representation if you prefer — just keep conversions consistent.
function CustomDatePicker({ label, onBlur, format, ...props }: CustomDatePickerProps) {
  const [field, meta, helpers] = useField(props.name as string);
  const dateFormat = format || "DD-MM-YYYY";

  // Convert form value (string or null) -> dayjs object or null for DatePicker
  const pickerValue = field.value ? dayjs(field.value) : null;

  // When user picks a date from calendar, set ISO string in Formik
  const handleChange: DatePickerProps["onChange"] = (date, dateString) => {
    if (date) {
      // store an ISO string (or use date.toISOString())
      helpers.setValue(date);
    } else {
      helpers.setValue(null);
    }
  };

  // onBlur: handle free-text input parsing (DDMMYYYY or DD-MM-YYYY or the configured format)
  const handleBlur: DatePickerProps["onBlur"] = (e: any, info: any) => {
    helpers.setTouched(true);

    // When DatePicker's input was edited manually, e.target?.value holds the raw text
    const rawValue = e?.target?.value;

    if (rawValue) {
      // If already parsable by configured format strictly
      const strictParsed = dayjs(rawValue, dateFormat, true);
      if (strictParsed.isValid()) {
        helpers.setValue(strictParsed.toISOString());
      } else if (/^\d{8}$/.test(rawValue)) {
        // Try DDMMYYYY
        const parsed = dayjs(rawValue, "DDMMYYYY", true);
        if (parsed.isValid()) {
          helpers.setValue(parsed.toISOString());
        } else {
          helpers.setValue(null);
        }
      } else if (/^\d{2}-\d{2}-\d{4}$/.test(rawValue)) {
        const parsed = dayjs(rawValue, "DD-MM-YYYY", true);
        if (parsed.isValid()) {
          helpers.setValue(parsed.toISOString());
        } else {
          helpers.setValue(null);
        }
      } else {
        // Not a recognized format
        helpers.setValue(null);
      }
    }

    if (onBlur) {
      onBlur(e, info);
    }
  };

  const handleEnterKey = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const form = e.target.form;
      if (form) {
        const index = Array.prototype.indexOf.call(form, e.target);
        form.elements[index + 1]?.focus();
      }
    }
  };

  // Add disabledTime function to restrict time selection when maxDate is set
  const getDisabledTime = () => {
    if (!props.maxDate || !pickerValue) return {};
    
    const maxDate = dayjs(props.maxDate);
    const selectedDate = dayjs(pickerValue);
    
    // Only apply time restrictions if the selected date is the same as maxDate
    if (selectedDate.isSame(maxDate, 'day')) {
      const maxHour = maxDate.hour();
      const maxMinute = maxDate.minute();
      const maxSecond = maxDate.second();
      
      return {
        disabledHours: () => {
          const hours = [];
          for (let i = maxHour + 1; i < 24; i++) {
            hours.push(i);
          }
          return hours;
        },
        disabledMinutes: (selectedHour: number) => {
          if (selectedHour === maxHour) {
            const minutes = [];
            for (let i = maxMinute + 1; i < 60; i++) {
              minutes.push(i);
            }
            return minutes;
          }
          return [];
        },
        disabledSeconds: (selectedHour: number, selectedMinute: number) => {
          if (selectedHour === maxHour && selectedMinute === maxMinute) {
            const seconds = [];
            for (let i = maxSecond + 1; i < 60; i++) {
              seconds.push(i);
            }
            return seconds;
          }
          return [];
        },
      };
    }
    
    return {};
  };

  return (
    <div className="relative">
      {label && <Label text={label} htmlFor={props.name} required={props.required} />}
      <DatePicker
        className="w-full"
        value={pickerValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleEnterKey}
        placeholder={format}
        format={dateFormat}
        status={meta.touched && meta.error ? "error" : undefined}
        disabledTime={props.showTime ? getDisabledTime : undefined}
        {...props}
      />
      {meta.touched && meta.error && <span className="field-error">{meta.error}</span>}
    </div>
  );
}

export default React.memo(CustomDatePicker);
