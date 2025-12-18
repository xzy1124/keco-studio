import type { FieldConfig } from '../types';
import { FieldItem } from './FieldItem';
import styles from './FieldsList.module.css';

interface FieldsListProps {
  fields: FieldConfig[];
  /** 行内编辑时直接更新字段 */
  onChangeField: (fieldId: string, data: Omit<FieldConfig, 'id'>) => void;
  onDeleteField: (fieldId: string) => void;
  disabled?: boolean;
}

export function FieldsList({ fields, onChangeField, onDeleteField, disabled }: FieldsListProps) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <div className={styles.fieldsList}>
      {fields.map((field, index) => (
        <FieldItem
          key={field.id}
          field={field}
          onChangeField={onChangeField}
          onDelete={onDeleteField}
          isFirst={index === 0}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
