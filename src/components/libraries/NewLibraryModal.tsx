'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSupabase } from '@/lib/SupabaseContext';
import { createLibrary } from '@/lib/services/libraryService';
import styles from './NewLibraryModal.module.css';

type NewLibraryModalProps = {
  open: boolean;
  projectId: string;
  onClose: () => void;
  onCreated: (libraryId: string) => void;
};

export function NewLibraryModal({ open, projectId, onClose, onCreated }: NewLibraryModalProps) {
  const supabase = useSupabase();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!open) return null;
  if (!mounted) return null;

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Library name is required');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const libraryId = await createLibrary(supabase, {
        projectId,
        name: trimmed,
        description,
      });
      onCreated(libraryId);
      setName('');
      setDescription('');
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to create library');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.title}>New Library</div>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Library name *</label>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter library name"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description (optional)</label>
          <input
            className={styles.input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a short note"
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.footer}>
          <button className={`${styles.button} ${styles.secondary}`} onClick={onClose}>
            Cancel
          </button>
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  , document.body);
}

