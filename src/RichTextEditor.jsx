import { useEffect, useMemo } from 'react'
import DOMPurify from 'dompurify'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Color from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import { AlignCenter, AlignLeft, AlignRight, Bold, Eraser, Italic, List, ListOrdered, Strikethrough, Underline as UnderlineIcon } from 'lucide-react'

const allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'span', 'a', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote']
const allowedAttributes = ['style', 'href', 'target', 'rel']

const TextStyleWithFontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize || null,
        renderHTML: attributes => attributes.fontSize ? { style: `font-size: ${attributes.fontSize}` } : {},
      },
    }
  },
})

function isRichHtml(value) {
  return /<[a-z][^>]*>/i.test(String(value || ''))
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
}

function editorContent(value, title) {
  if (isRichHtml(value)) return DOMPurify.sanitize(String(value), { ALLOWED_TAGS: allowedTags, ALLOWED_ATTR: allowedAttributes })
  const lines = String(value || '').split('\n')
  const content = title && lines.length > 1
    ? `${escapeHtml(lines[0])}<br><em>${escapeHtml(lines.slice(1).join(' '))}</em>`
    : lines.map(escapeHtml).join('<br>')
  return `<p>${content}</p>`
}

export default function RichTextEditor({ value, onChange, title = false }) {
  const initialContent = useMemo(() => editorContent(value, title), [title, value])
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ underline: false }),
      TextStyleWithFontSize,
      Color,
      FontFamily,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: initialContent,
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
    immediatelyRender: false,
  })
  useEffect(() => {
    if (editor && editor.getHTML() !== initialContent) editor.commands.setContent(initialContent, { emitUpdate: false })
  }, [editor, initialContent])

  if (!editor) return <div className="rich-editor-loading">Opening formatting tools…</div>

  const action = (label, active, onClick, icon) => (
    <button type="button" className={active ? 'active' : ''} aria-label={label} title={label} onClick={onClick}>{icon}</button>
  )

  return <div className="rich-editor">
    <div className="rich-editor-toolbar" role="toolbar" aria-label="Text formatting">
      {action('Bold', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), <Bold size={15}/>)}
      {action('Italic', editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), <Italic size={15}/>)}
      {action('Underline', editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), <UnderlineIcon size={15}/>)}
      {action('Strikethrough', editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run(), <Strikethrough size={15}/>)}
      <label className="rich-editor-select"><span className="sr-only">Font family</span><select aria-label="Font family" defaultValue="DM Sans" onChange={event => editor.chain().focus().setFontFamily(event.target.value).run()}><option value="DM Sans">DM Sans</option><option value="Arial">Arial</option><option value="Georgia">Georgia</option><option value="serif">Serif</option></select></label>
      <label className="rich-editor-select"><span className="sr-only">Font size</span><select aria-label="Font size" defaultValue="" onChange={event => event.target.value && editor.chain().focus().setMark('textStyle', { fontSize: `${event.target.value}px` }).run()}><option value="" disabled>Size</option>{[12,14,16,18,24,32,40].map(size=><option key={size} value={size}>{size}px</option>)}</select></label>
      <label className="rich-editor-select"><span className="sr-only">Text color</span><select aria-label="Text color" defaultValue="" onChange={event => event.target.value && editor.chain().focus().setColor(event.target.value).run()}><option value="" disabled>Color</option><option value="#173363">Navy</option><option value="#1987c9">Blue</option><option value="#53a546">Green</option><option value="#e65b76">Coral</option><option value="#233852">Dark</option></select></label>
      {action('Align left', editor.isActive({ textAlign: 'left' }), () => editor.chain().focus().setTextAlign('left').run(), <AlignLeft size={15}/>)}
      {action('Align center', editor.isActive({ textAlign: 'center' }), () => editor.chain().focus().setTextAlign('center').run(), <AlignCenter size={15}/>)}
      {action('Align right', editor.isActive({ textAlign: 'right' }), () => editor.chain().focus().setTextAlign('right').run(), <AlignRight size={15}/>)}
      {action('Bulleted list', editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), <List size={15}/>)}
      {action('Numbered list', editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered size={15}/>)}
      {action('Clear formatting', false, () => editor.chain().focus().clearNodes().unsetAllMarks().run(), <Eraser size={15}/>)}
    </div>
    <EditorContent editor={editor} className="rich-editor-content"/>
  </div>
}
