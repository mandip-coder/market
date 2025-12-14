import { Input, InputNumber } from "antd";
import type { InputProps } from "antd/es/input";
import type { InputNumberProps } from "antd/es/input-number";
import { useField } from "formik";
import React, { useCallback, useEffect, useState } from "react";
import Label from "../Label/Label";

type InputBoxProps = {
  label?: string;
  withNullFlavour?: string[];
} & (
    ({ type?: "number" } & InputNumberProps) |
    ({ type?: string } & InputProps)
  );

export const nullVariants = {
  hidden: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

function InputBox({ label, type, name, ...rest }: InputBoxProps) {
  const [field, meta, helpers] = useField(name as string);
  const [localValue, setLocalValue] = useState(field.value);

  useEffect(() => {
    setLocalValue(field.value);
  }, [field.value]);


  const handleBlur = useCallback(() => {
    helpers.setValue(localValue).then(() => helpers.setTouched(true));
  }, [helpers, localValue]);

  const error = meta.touched && meta.error;
  const status = error ? "error" : undefined;

  return (
    <div className="relative w-full">

      {label && <Label htmlFor={name} text={label} required={rest.required} />}
      {type === "number" ? (
        <InputNumber
          {...rest as InputNumberProps}
          className="!w-full"
          value={localValue}
          status={status}
          onChange={(val) => setLocalValue(val)}
          onBlur={handleBlur}
          onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault() }}
        />
      ) :
        <Input
          {...rest as InputProps}
          value={localValue}
          status={status}
          className="!w-full"
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault() }}
        />
        }

      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export default React.memo(InputBox);