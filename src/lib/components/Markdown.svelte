<script lang="ts">
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';

  interface Props {
    content: string;
  }

  let { content }: Props = $props();

  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  let html = $derived.by(() => {
    if (!content) return '';
    const rawHtml = marked.parse(content, { async: false }) as string;
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'em',
        'del',
        's',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'blockquote',
        'pre',
        'code',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'a',
        'hr',
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
  });
</script>

<div class="markdown-content">
  {@html html}
</div>
