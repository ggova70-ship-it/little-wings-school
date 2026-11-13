import { createElement, useMemo } from 'react'
import DOMPurify from 'dompurify'

const allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'span', 'a', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote']
const allowedAttributes = ['style', 'href', 'target', 'rel']

function isRichHtml(value) {
  return /<[a-z][^>]*>/i.test(String(value || ''))
}

function sanitize(value, inline) {
  let html = DOMPurify.sanitize(String(value || ''), { ALLOWED_TAGS: allowedTags, ALLOWED_ATTR: allowedAttributes })
  if (inline) {
    const alignment = html.match(/<p\b[^>]*style=["'][^"']*text-align:\s*(left|center|right|justify)[^"']*["'][^>]*>/i)?.[1]
    html = html
      .replace(/<p\b[^>]*>/gi, '')
      .replace(/<\/p>/gi, '<br>')
      .replace(/<h[1-3]\b[^>]*>/gi, '')
      .replace(/<\/h[1-3]>/gi, '<br>')
      .replace(/<li\b[^>]*>/gi, '• ')
      .replace(/<\/li>/gi, '<br>')
      .replace(/<\/?(?:ul|ol|blockquote)\b[^>]*>/gi, '')
      .replace(/(?:<br>\s*)+$/i, '')
    if (alignment) html = `<span style="display:block;text-align:${alignment}">${html}</span>`
    html = DOMPurify.sanitize(html, { ALLOWED_TAGS: ['br', 'strong', 'b', 'em', 'i', 'u', 's', 'span', 'a'], ALLOWED_ATTR: allowedAttributes })
  }
  return html
}

export function RichText({ value, as = 'span', inline = true, className = '' }) {
  const rich = isRichHtml(value)
  const html = useMemo(() => rich ? sanitize(value, inline) : '', [inline, rich, value])
  const classes = `rich-copy${rich ? ' rich-copy-formatted' : ''}${className ? ` ${className}` : ''}`
  if (rich) return createElement(as, { className: classes, dangerouslySetInnerHTML: { __html: html } })
  return createElement(as, { className: classes }, String(value || ''))
}

export function plainText(value) {
  return DOMPurify.sanitize(String(value || ''), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}
