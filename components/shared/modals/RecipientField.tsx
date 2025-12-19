'use client';
import { HCOContactPerson } from '@/components/AddNewContactModal/AddNewContactModal';
import CustomSelect from '@/components/CustomSelect/CustomSelect';
import Label from '@/components/Label/Label';
import ContactOptionsRender from '../ContactOptionsRender';
import { CloseOutlined } from '@ant-design/icons';
import { Button } from 'antd';

interface RecipientFieldProps {
  show: boolean;
  onClose: () => void;
  name: string;
  label: string;
  contactPersons: HCOContactPerson[];
  colorScheme: 'blue' | 'purple';
}

const colorSchemes = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/10',
    border: 'border-blue-200 dark:border-blue-800',
    hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/10',
    border: 'border-purple-200 dark:border-purple-800',
    hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
  }
};

export const RecipientField: React.FC<RecipientFieldProps> = ({
  show,
  onClose,
  name,
  label,
  contactPersons,
  colorScheme
}) => {
  if (!show) return null;

  const colors = colorSchemes[colorScheme];

  return (
    <div className={`${colors.bg} p-4 rounded-lg border ${colors.border}`}>
      <div className="flex items-center justify-between mb-2">
        <Label text={label} />
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={onClose}
          className={colors.hoverBg}
        />
      </div>
      <CustomSelect
        hideSelected
        name={name}
        mode="multiple"
        className="w-full"
        optionLabelProp="label"
        showSearch={{
          optionFilterProp: "label"
        }}
        options={contactPersons
          .filter(contact => contact.email)
          .map(contact => ({
            value: contact.hcoContactUUID,
            label: contact.email,
            contact,
          }))}
        optionRender={(option) => <ContactOptionsRender option={option} />}
      />
    </div>
  );
};

export default RecipientField;
