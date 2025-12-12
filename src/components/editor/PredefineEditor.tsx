'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useSupabase } from "@/lib/SupabaseContext";
import styles from "./PredefineEditor.module.css";
import type { JSONContent } from "@tiptap/core";
import { getDocumentByDocId, createDocument, updateDocumentContent } from "@/lib/services/sharedDocumentService";
import type { SharedDocument } from "@/lib/types/shared-document";
import { ImagePlugin, insertImage } from "./plugins/image";
import { buildMissingBucketMessage, getAllowedTypes, getMaxSizeBytes, uploadImageFile, validateImageFile } from "@/lib/services/imageUploadService";

type PredefineEditorProps = {
  docId: string;
  ownerLabel?: string;
};

const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };
const SAVE_DEBOUNCE_MS = 600;

export function PredefineEditor({ docId, ownerLabel }: PredefineEditorProps) {
  const supabase = useSupabase();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const lastKnownUpdatedAt = useRef<string | null>(null);
  const isApplyingRemoteChange = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const allowedTypes = useMemo(() => getAllowedTypes(), []);
  const maxSizeText = useMemo(() => `${Math.round(getMaxSizeBytes() / (1024 * 1024))}MB`, []);

  const openFilePicker = useCallback(() => {
    if (uploading) return;
    fileInputRef.current?.click();
  }, [uploading]);

  const handleSlashCommand = useCallback(
    (view: any) => {
      const { from } = view.state.selection;
      const lookBehind = Math.max(0, from - 6);
      const textBefore = view.state.doc.textBetween(lookBehind, from, "\n", "\n");

      if (textBefore.endsWith("/image")) {
        const tr = view.state.tr.delete(from - 6, from);
        view.dispatch(tr);
        openFilePicker();
        return true;
      }

      return false;
    },
    [openFilePicker]
  );

  // Editor instance
  const editor = useEditor({
    extensions: [StarterKit, ImagePlugin],
    content: EMPTY_DOC,
    editorProps: {
      attributes: {
        class: styles.editorContent,
        spellCheck: "false",
      },
      handleKeyDown: (view, event) => {
        if (event.key === "Enter" || event.key === " ") {
          return handleSlashCommand(view);
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      // Only save if not applying remote change
      if (!isApplyingRemoteChange.current) {
        scheduleSave(editor.getJSON());
      }
    },
  });

  // Schedule save with debounce
  const scheduleSave = useMemo(
    () =>
      (content: JSONContent) => {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          void persist(content);
        }, SAVE_DEBOUNCE_MS);
      },
    []
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  // Load document on mount or docId change
  useEffect(() => {
    if (!editor || !docId) return;

    const load = async () => {
      setLoading(true);
      setStatus("Loading...");

      try {
        // Try to get existing document
        let document: SharedDocument | null = await getDocumentByDocId(supabase, docId);

        if (!document) {
          // If document doesn't exist, get current user and create it
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            setStatus("User not authenticated");
            setLoading(false);
            return;
          }

          document = await createDocument(supabase, docId, user.id, EMPTY_DOC);
        }

        if (document?.content) {
          editor.commands.setContent(document.content);
          lastKnownUpdatedAt.current = document.updated_at;
        } else {
          editor.commands.setContent(EMPTY_DOC);
          lastKnownUpdatedAt.current = document?.updated_at || new Date().toISOString();
        }

        setStatus(null);
      } catch (error: any) {
        console.error('Load error:', error);
        setStatus(error.message || "Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [docId, editor, supabase]);

  // Realtime subscription for document changes
  useEffect(() => {
    if (!editor || !docId) return;

    const channel = supabase
      .channel(`document:${docId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'shared_documents',
        filter: `doc_id=eq.${docId}`
      }, (payload) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Realtime event received:', payload);
        }

        const newData = payload.new as SharedDocument;
        applyRemoteChange(newData.content, newData.updated_at);
      })
      .subscribe((status) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Realtime subscription status:', status);
        }

        if (status === 'SUBSCRIBED') {
          setStatus("Connected");
          setTimeout(() => setStatus(null), 2000);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setStatus("Connection error");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [editor, docId, supabase]);

  // Apply remote changes with conflict resolution
  const applyRemoteChange = (remoteContent: JSONContent, remoteUpdatedAt: string) => {
    if (!editor) return;

    const localUpdatedAt = lastKnownUpdatedAt.current;

    // Only apply if remote is newer
    if (!localUpdatedAt || new Date(remoteUpdatedAt) > new Date(localUpdatedAt)) {
      const currentContent = editor.getJSON();

      // Avoid applying own changes (compare JSON strings)
      if (JSON.stringify(currentContent) !== JSON.stringify(remoteContent)) {
        isApplyingRemoteChange.current = true;
        try {
          editor.commands.setContent(remoteContent);
          lastKnownUpdatedAt.current = remoteUpdatedAt;
        } catch (error) {
          console.error('Error applying remote change:', error);
        } finally {
          isApplyingRemoteChange.current = false;
        }
      }
    }
  };

  // Persist content to database
  const persist = async (content: JSONContent) => {
    setStatus("Saving...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus("User not authenticated");
        return;
      }

      // Check if document exists, create if not
      let document = await getDocumentByDocId(supabase, docId);
      if (!document) {
        document = await createDocument(supabase, docId, user.id, content);
        lastKnownUpdatedAt.current = document.updated_at;
      } else {
        const result = await updateDocumentContent(supabase, docId, content);
        lastKnownUpdatedAt.current = result.updated_at;
      }

      setStatus("Saved");
    } catch (error: any) {
      console.error('Persist error:', error);
      setStatus(error.message || "Save failed");
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      event.target.value = "";

      setUploadError(null);

      const validation = validateImageFile(file);
      if (!validation.ok) {
        setUploadStatus(null);
        setUploadError(validation.error || "Invalid file. Please choose a JPEG, PNG, or WebP under 5MB.");
        return;
      }

      if (!file) return;

      try {
        setUploading(true);
        setUploadStatus("Uploading...");

        if (process.env.NODE_ENV === "development") {
          console.log("Uploading image", { name: file.name, size: file.size, type: file.type });
        }

        const result = await uploadImageFile(supabase, file);

        const inserted = insertImage(editor, { src: result.url, alt: file.name });
        if (!inserted) {
          throw new Error("Failed to insert image into editor.");
        }

        setUploadStatus("Uploaded");
        setTimeout(() => setUploadStatus(null), 1800);
      } catch (error: any) {
        const message = error?.message || buildMissingBucketMessage("tiptap-images");
        setUploadError(message);
        setUploadStatus(null);
        if (process.env.NODE_ENV === "development") {
          console.error("Image upload error", error);
        }
      } finally {
        setUploading(false);
      }
    },
    [editor, supabase]
  );

  const active = (name: string) => (editor?.isActive(name) ? styles.active : "");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>Pre-define property</div>
        <div className={styles.meta}>
          <span>{ownerLabel || "Current user"}</span>
          {status && <span className={styles.status}>{status}</span>}
        </div>
      </div>

      <div className={styles.toolbar}>
        <button
          type="button"
          className={`${styles.button} ${active("bold")}`}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          B
        </button>
        <button
          type="button"
          className={`${styles.button} ${active("italic")}`}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          I
        </button>
        <button
          type="button"
          className={`${styles.button} ${active("bulletList")}`}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          • List
        </button>
        <button
          type="button"
          className={`${styles.button} ${active("orderedList")}`}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          1.
        </button>
        <div className={styles.gap} />
        <button
          type="button"
          className={styles.button}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          Undo
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          Redo
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={openFilePicker}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Image (/image)"}
        </button>
        <div className={styles.placeholderNote}>
          {uploadStatus ? uploadStatus : "Type /image or use the Image button to upload"}
        </div>
      </div>

      {uploadError && <div className={styles.error}>{uploadError}</div>}
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(",")}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div className={styles.hintRow}>
        <span>Allowed: {allowedTypes.join(", ").replace(/image\//g, "")}</span>
        <span>Max size: {maxSizeText}</span>
      </div>

      <div className={styles.editorWrapper}>
        {loading && <div className={styles.overlay}>Loading...</div>}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
