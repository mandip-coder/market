import { Rate } from "antd";
import { memo } from "react";
import { HCOContactPerson } from "../AddNewContactModal/AddNewContactModal";

function ContactOptionsRender({ option }: { option: any }) {
  const {fullName,email,rating,role} = option.data.contact as HCOContactPerson
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <div className="font-medium">{fullName} - {role}</div>
        <div className="text-xs text-gray-500">{email||"Email Not Provided"}</div>
      </div>
      {rating && <div className="flex items-center gap-2">
        <Rate disabled defaultValue={rating} style={{ fontSize: 12 }} />
        <span className="text-xs text-gray-500">{rating}/5</span>
      </div>} 
    </div>
  );
}
export default memo(ContactOptionsRender);