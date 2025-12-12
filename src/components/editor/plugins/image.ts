import Image from '@tiptap/extension-image';
import type { Command, Editor, RawCommands } from '@tiptap/core';

/**
 * Reusable image node extension with insertImage command.
 * Attributes: src (required), alt/title (optional).
 * Usage: editor.chain().focus().insertImage({ src, alt?, title? }).run()
 */

export type ImageAttrs = {
  src: string;
  alt?: string;
  title?: string;
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    insertImage: (attrs: ImageAttrs) => ReturnType;
  }
}

export const ImagePlugin = Image.extend({
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },

  addCommands() {
    return {
      insertImage:
        (attrs: ImageAttrs): Command =>
        ({ commands }) => {
          if (!attrs?.src) {
            return false;
          }
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    } as unknown as Partial<RawCommands>;
  },
});

export function insertImage(editor: Editor | null, attrs: ImageAttrs): boolean {
  if (!editor) {
    return false;
  }
  return editor.chain().focus().command(({ commands }) => commands.insertContent({ type: ImagePlugin.name, attrs })).run();
}

