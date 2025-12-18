import { useState } from 'react';
import { Button, Input } from 'antd';
import Image from 'next/image';
import type { FieldConfig } from '../types';
import { fieldSchema } from '../validation';
import { uid } from '../types';
import { FieldsList } from './FieldsList';
import { FieldForm } from './FieldForm';
import predefineLabelAddIcon from '@/app/assets/images/predefineLabelAddIcon.svg';
import predefineDragIcon from '@/app/assets/images/predefineDragIcon.svg';
import styles from './NewSectionForm.module.css';
import sectionHeaderStyles from './SectionHeader.module.css';
import predefineExpandIcon from '@/app/assets/images/predefineExpandIcon.svg';

interface NewSectionFormProps {
  onCancel: () => void;
  onSave: (section: { name: string; fields: FieldConfig[] }) => Promise<void>;
  saving?: boolean;
}

export function NewSectionForm({ onCancel, onSave, saving }: NewSectionFormProps) {
  const [sectionName, setSectionName] = useState('');
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleAddField = (fieldData: Omit<FieldConfig, 'id'>) => {
    const parsed = fieldSchema.safeParse(fieldData);
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((i) => i.message));
      return;
    }

    const field: FieldConfig = { id: uid(), ...parsed.data };
      setFields((prev) => [...prev, field]);
    setErrors([]);
  };

  const handleDeleteField = (fieldId: string) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
  };

  const handleChangeField = (fieldId: string, fieldData: Omit<FieldConfig, 'id'>) => {
    const parsed = fieldSchema.safeParse(fieldData);
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((i) => i.message));
      return;
    }

    setFields((prev) => prev.map((f) => (f.id === fieldId ? { ...f, ...parsed.data } : f)));
    setErrors([]);
  };

  const handleSave = async () => {
    const trimmedName = sectionName.trim();
    if (!trimmedName) {
      setErrors(['Section name is required']);
      return;
    }

    if (fields.length === 0) {
      setErrors(['At least one field is required']);
      return;
    }

    setErrors([]);
    await onSave({ name: trimmedName, fields });
  };

  return (
    <div>
      <div className={styles.newSectionContainer}>
        <div className={sectionHeaderStyles.generalSection}>
          <div>
            <div>
              <Image src={predefineExpandIcon} alt="expand" width={16} height={16} style={{ paddingTop: 3 }}/>
              <span className={sectionHeaderStyles.generalLabel}>General</span>
            </div>
            <div className={sectionHeaderStyles.lineSeparator}></div>
            <div className={sectionHeaderStyles.sectionNameContainer}>
              <div className={sectionHeaderStyles.dragHandle}>
                <Image src={predefineDragIcon} alt="Drag" width={16} height={16} />
              </div>
              <Input
                placeholder="Enter section name"
                value={sectionName}
                onChange={(e) => {
                  setSectionName(e.target.value);
                  setErrors([]);
                }}
                className={sectionHeaderStyles.sectionNameInput}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.newSectionContainer}>
        <div>
          <Image src={predefineExpandIcon} alt="expand" width={16} height={16} style={{ paddingTop: 3 }}/>
          <span className={styles.sectionTitle}>Pre-define property</span>
        </div>
        <div className={sectionHeaderStyles.lineSeparator}></div>
        <div className={styles.headerRow}>
          <div className={styles.headerLabel}>Label text</div>
          <div className={styles.headerDataType}>Data type</div>
          <div className={styles.headerActions} />
        </div>
        <FieldsList
          fields={fields}
          onChangeField={handleChangeField}
          onDeleteField={handleDeleteField}
          disabled={saving}
        />
        <FieldForm
          onSubmit={handleAddField}
          onCancel={onCancel}
          disabled={saving}
        />
      </div>

      {errors.length > 0 && (
        <div className={styles.errorsContainer}>
          {errors.map((err, idx) => (
            <div key={idx}>{err}</div>
          ))}
        </div>
      )}

      <div className={styles.newSectionActions}>
        <Button onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={handleSave}
          loading={saving}
          className={styles.saveButton}
        >
          {saving ? 'Saving...' : 'Save Schema'}
        </Button>
      </div>
    </div>
  );
}

