import { Select, SelectProps, Tooltip } from "antd";
import { useField } from "formik";
import React from "react";
import Label from "../Label/Label";
import { Check, Inbox } from "lucide-react";

type CustomSelectProps = SelectProps & {
  label?: string;
  name: string;
  required?: boolean;
  hideSelected?: boolean;
  maxResponsive?: boolean
};

function CustomSelect({ label, name, options, hideSelected,maxResponsive, ...rest }: CustomSelectProps) {
  const [field, meta, helpers] = useField(name);
  const [filterOptions, setFilterOptions] = React.useState(options);

  React.useEffect(() => {
    if (hideSelected) {
      setFilterOptions(options?.filter((option) => !field.value?.includes(option.value)) || []);
    } else {
      setFilterOptions(options || []);
    }
  }, [options, field.value, hideSelected]);

  const maxTagResponsive = (): Partial<SelectProps>|undefined => {
    if (maxResponsive) {
      return {
        maxTagCount: 'responsive',
        maxTagPlaceholder: (omitted) => <Tooltip title={omitted.map((item) => item.label).join(', ')}>{`+${omitted.length} more`}</Tooltip>,
      }
    }
  }


  return (
    <div className="relative w-full">
      {label && <Label htmlFor={name} text={label} required={rest.required} />}

      <div className="flex gap-2 items-center w-full">
        <Select
          {...field}
          value={field.value || undefined}
          options={filterOptions}
          allowClear
          placeholder="Select..."
          onChange={(v) => helpers.setValue(v)}
          onBlur={() => helpers.setTouched(true)}
          className="w-full"
          showSearch
          status={meta.touched && meta.error ? "error" : ""}
          menuItemSelectedIcon={({ isSelected }) => {
            if (!isSelected) return null;
            return <Check className="h-4 w-4 text-white" />
          }}
          notFoundContent={
            <div
              className="flex flex-col items-center justify-center py-6 px-4 text-center"
              style={{ minHeight: '120px' }} // Ensure consistent height
            >
              <Inbox className="h-10 w-10 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-600 mb-1">
                No more <strong>{label}</strong>  display
              </p>
            </div>
          }
          {...maxTagResponsive()}
          {...rest}

        />

      </div>

      {meta.touched && meta.error && (
        <span className="field-error">{meta.error}</span>
      )}
    </div>
  );
}

export default CustomSelect;
