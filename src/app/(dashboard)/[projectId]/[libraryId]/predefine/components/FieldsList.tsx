import type { FieldConfig } from '../types';
import { FieldItem } from './FieldItem';
import styles from './FieldsList.module.css';

interface FieldsListProps {
  fields: FieldConfig[];
  /** Update field directly when editing inline */
  onChangeField: (fieldId: string, data: Omit<FieldConfig, 'id'>) => void;
  onDeleteField: (fieldId: string) => void;
  disabled?: boolean;
  isFirstSection?: boolean;
}

export function FieldsList({ fields, onChangeField, onDeleteField, disabled, isFirstSection = false }: FieldsListProps) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <div className={styles.fieldsList}>
      {fields.map((field, index) => {
        // If this is the first field of the first section, and label is 'name', type is 'string', then it's a mandatory field
        const isMandatoryNameField = isFirstSection && index === 0 && field.label === 'name' && field.dataType === 'string';
        
        return (
          <FieldItem
            key={field.id}
            field={field}
            onChangeField={onChangeField}
            onDelete={onDeleteField}
            isFirst={index === 0}
            disabled={disabled}
            isMandatoryNameField={isMandatoryNameField}
          />
        );
      })}
    </div>
  );
}
