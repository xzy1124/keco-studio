'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/SupabaseContext';
import { listLibraries, Library } from '@/lib/services/libraryService';
import { NewLibraryModal } from '@/components/libraries/NewLibraryModal';

export default function ProjectLibrariesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const supabase = useSupabase();
  const router = useRouter();
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchLibraries = async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listLibraries(supabase, projectId);
      setLibraries(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load libraries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraries();
  }, [projectId]);

  const handleCreated = (libraryId: string) => {
    fetchLibraries();
    router.push(`/${projectId}/${libraryId}`);
  };

  const goToLibrary = (id: string) => {
    router.push(`/${projectId}/${id}`);
  };

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
       
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            background: '#4f46e5',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          New Library
        </button>
      </div>

      {loading && <div>Loading libraries...</div>}
      {error && <div style={{ color: '#dc2626' }}>{error}</div>}

      {!loading && libraries.length === 0 && (
        <div style={{ color: '#64748b' }}>No libraries yet. Create your first library.</div>
      )}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {libraries.map((lib) => (
          <div
            key={lib.id}
            onClick={() => goToLibrary(lib.id)}
            style={{
              padding: '12px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              cursor: 'pointer',
              background: 'white',
            }}
          >
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{lib.name}</div>
            {lib.description && (
              <div style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
                {lib.description}
              </div>
            )}
          </div>
        ))}
      </div>

      <NewLibraryModal
        open={showModal}
        onClose={() => setShowModal(false)}
        projectId={projectId}
        onCreated={handleCreated}
      />
    </div>
  );
}

