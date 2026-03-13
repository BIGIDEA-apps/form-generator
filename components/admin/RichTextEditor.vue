<template>
  <div class="RichTextEditor">
    <div v-if="editor" class="RichTextEditor__toolbar">
      <button
        type="button"
        class="RichTextEditor__btn"
        :class="{ 'RichTextEditor__btn--active': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <UIcon name="i-heroicons-bold" />
      </button>
      <button
        type="button"
        class="RichTextEditor__btn"
        :class="{ 'RichTextEditor__btn--active': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <UIcon name="i-heroicons-italic" />
      </button>
      <button
        type="button"
        class="RichTextEditor__btn"
        :class="{ 'RichTextEditor__btn--active': editor.isActive('underline') }"
        @click="editor.chain().focus().toggleUnderline().run()"
      >
        <UIcon name="i-heroicons-underline" />
      </button>
      <button
        type="button"
        class="RichTextEditor__btn"
        :class="{ 'RichTextEditor__btn--active': editor.isActive('strike') }"
        @click="editor.chain().focus().toggleStrike().run()"
      >
        <UIcon name="i-heroicons-strikethrough" />
      </button>

      <span class="RichTextEditor__separator" />

      <button
        type="button"
        class="RichTextEditor__btn"
        :class="{ 'RichTextEditor__btn--active': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <UIcon name="i-heroicons-list-bullet" />
      </button>
      <button
        type="button"
        class="RichTextEditor__btn"
        :class="{ 'RichTextEditor__btn--active': editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <UIcon name="i-heroicons-numbered-list" />
      </button>

      <span class="RichTextEditor__separator" />

      <button
        type="button"
        class="RichTextEditor__btn"
        :class="{ 'RichTextEditor__btn--active': editor.isActive({ textAlign: 'right' }) }"
        @click="editor.chain().focus().setTextAlign('right').run()"
      >
        <UIcon name="i-heroicons-bars-3-bottom-right" />
      </button>
      <button
        type="button"
        class="RichTextEditor__btn"
        :class="{ 'RichTextEditor__btn--active': editor.isActive({ textAlign: 'center' }) }"
        @click="editor.chain().focus().setTextAlign('center').run()"
      >
        <UIcon name="i-heroicons-bars-3" />
      </button>
      <button
        type="button"
        class="RichTextEditor__btn"
        :class="{ 'RichTextEditor__btn--active': editor.isActive({ textAlign: 'left' }) }"
        @click="editor.chain().focus().setTextAlign('left').run()"
      >
        <UIcon name="i-heroicons-bars-3-bottom-left" />
      </button>
    </div>

    <EditorContent :editor="editor" class="RichTextEditor__content" dir="rtl" />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      defaultAlignment: 'right',
    }),
  ],
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val, false)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
.RichTextEditor {
  border: 1px solid var(--ui-border);
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--ui-bg);
}

.RichTextEditor__toolbar {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  padding: 0.375rem;
  border-bottom: 1px solid var(--ui-border);
  flex-wrap: wrap;
}

.RichTextEditor__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.25rem;
  background: transparent;
  color: var(--ui-text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  font-size: 1rem;
}

.RichTextEditor__btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--ui-text);
}

.RichTextEditor__btn--active {
  background: rgba(0, 205, 255, 0.15);
  color: #00CDFF;
}

.RichTextEditor__separator {
  width: 1px;
  height: 1.25rem;
  background: var(--ui-border);
  margin: 0 0.25rem;
}

.RichTextEditor__content .tiptap {
  padding: 0.75rem 1rem;
  min-height: 6rem;
  outline: none;
  color: var(--ui-text);
  font-size: 0.875rem;
  line-height: 1.6;
  direction: rtl;
}

.RichTextEditor__content .tiptap p {
  margin: 0 0 0.5rem;
}

.RichTextEditor__content .tiptap p:last-child {
  margin-bottom: 0;
}

.RichTextEditor__content .tiptap ul,
.RichTextEditor__content .tiptap ol {
  padding-inline-start: 1.5rem;
  margin: 0.25rem 0;
}

.RichTextEditor__content .tiptap li {
  margin-bottom: 0.25rem;
}

.RichTextEditor__content .tiptap ul {
  list-style-type: disc;
}

.RichTextEditor__content .tiptap ol {
  list-style-type: decimal;
}
</style>
