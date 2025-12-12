'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSupabase } from '@/lib/SupabaseContext';
import { getLibrary, Library } from '@/lib/services/libraryService';
import { PredefineEditor } from '@/components/editor/PredefineEditor';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function LibraryPage() {
  const { projectId, libraryId } = useParams<{ projectId: string; libraryId: string }>();
  const supabase = useSupabase();
  const { userProfile } = useAuth();
  const [library, setLibrary] = useState<Library | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLibrary = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getLibrary(supabase, libraryId, projectId);
        setLibrary(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load library');
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, [libraryId, supabase]);

  if (loading) {
    return <div style={{ padding: '1rem' }}>Loading library...</div>;
  }

  if (error) {
    return <div style={{ padding: '1rem', color: '#dc2626' }}>{error}</div>;
  }

  if (!library) {
    return <div style={{ padding: '1rem' }}>Library not found</div>;
  }

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {userProfile ? (
        <PredefineEditor
          docId={`${projectId}-${libraryId}`}
          ownerLabel={userProfile.username || userProfile.email}
        />
      ) : (
        <div style={{ color: '#dc2626' }}>Please sign in to edit.</div>
      )}
    </div>
  );
}

