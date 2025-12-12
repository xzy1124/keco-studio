/**
 * Type definitions for shared documents
 * Used for collaborative Tiptap document editing
 */

import type { JSONContent } from '@tiptap/core';

/**
 * Shared document type matching the database schema
 */
export type SharedDocument = {
  id: string;           // UUID
  doc_id: string;       // Document identifier (shared across users)
  owner_id: string;     // UUID of creator
  content: JSONContent; // Tiptap JSON content
  updated_at: string;   // ISO timestamp
  created_at: string;   // ISO timestamp
};

/**
 * User profile type for validation
 */
export type UserProfile = {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
};

