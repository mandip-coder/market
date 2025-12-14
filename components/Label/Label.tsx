import { Tooltip } from "antd";
import { InfoIcon } from "lucide-react";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  text: string;
  htmlFor?: string;
  required?: boolean;
  className?: string;
  info?: React.ReactNode
};

export default function Label({ text, htmlFor,info, required, className, ...props }: LabelProps) {
  return (
    <label title={text} className={className + ` mb-1 text-[12px] xl:text-sm  flex items-center gap-1 truncate`} htmlFor={htmlFor} {...props}>
      <span>{text}{required && <span className='text-red-500'> *</span>}</span>
     <span className="text-gray-400"> {info &&
     <Tooltip title={info}>
       <InfoIcon size={14}/>
     </Tooltip>
      }</span>
    </label>
  )
}
