import type { ReactNode } from 'react';
import { EditableField } from './EditableField';

interface ProfileLinkFieldProps {
  icon: ReactNode;
  label: string;
  value: string;
  onSave: (value: string) => void;
}

export function ProfileLinkField({ icon, label, value, onSave }: ProfileLinkFieldProps) {
  return (
    <EditableField
      icon={icon}
      label={label}
      value={value}
      fieldKey="name"
      onSave={(_field, v) => onSave(v)}
    />
  );
}
