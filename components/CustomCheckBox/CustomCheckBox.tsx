import { Checkbox, CheckboxProps } from 'antd'
import React from 'react'
import Label from '../Label/Label'
import { useField } from 'formik';
function CustomCheckBox({ children, label, ...props }: { children: React.ReactNode, label?: string } & CheckboxProps) {
  const [field, meta, helpers] = useField(props.name as string);
  return (
    <> {label && <Label
      text={label}
      htmlFor={props.name}
    />}
      <Checkbox
        {...field}
        {...props}
        checked={field.value}
        onChange={(e) => helpers.setValue(e.target.checked)}
      >
        {children}
      </Checkbox></>
  )
}
export default React.memo(CustomCheckBox);