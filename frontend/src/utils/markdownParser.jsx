/**
 * Markdown Parser Utility - Pure Regex Implementation
 * Converts markdown text to React elements without external libraries
 */

import React from 'react';

/**
 * Parse markdown text to React elements
 * @param {string} text - Raw markdown text from AI
 * @returns {React.ReactElement[]} Array of React elements
 */
export function parseMarkdownToReact(text) {
  if (!text) return [];

  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let codeBlock = null;
  let codeLines = [];

  lines.forEach((line, index) => {
    // Code block detection (```language or ```)
    if (line.trim().startsWith('```')) {
      if (codeBlock === null) {
        // Start code block
        const language = line.trim().slice(3).trim() || 'text';
        codeBlock = language;
        codeLines = [];
      } else {
        // End code block
        elements.push(
          <pre key={`code-${index}`} className="markdown-code-block">
            <code className={`language-${codeBlock}`}>
              {codeLines.join('\n')}
            </code>
          </pre>
        );
        codeBlock = null;
        codeLines = [];
      }
      return;
    }

    // Inside code block
    if (codeBlock !== null) {
      codeLines.push(line);
      return;
    }

    // Flush list items if we're not in a list anymore
    if (!line.trim().match(/^[\*\-\+]\s/) && !line.trim().match(/^\d+\.\s/) && listItems.length > 0) {
      elements.push(
        <ul key={`list-${index}`} className="markdown-list">
          {listItems}
        </ul>
      );
      listItems = [];
    }

    // Heading detection (# to ######)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = parseInlineMarkdown(headingMatch[2]);
      const HeadingTag = `h${level}`;
      elements.push(
        React.createElement(
          HeadingTag,
          { key: `heading-${index}`, className: `markdown-heading markdown-h${level}` },
          content
        )
      );
      return;
    }

    // Unordered list detection (*, -, +)
    const unorderedListMatch = line.match(/^[\*\-\+]\s+(.+)$/);
    if (unorderedListMatch) {
      const content = parseInlineMarkdown(unorderedListMatch[1]);
      listItems.push(
        <li key={`li-${index}`} className="markdown-list-item">
          {content}
        </li>
      );
      return;
    }

    // Ordered list detection (1., 2., etc.)
    const orderedListMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedListMatch) {
      const content = parseInlineMarkdown(orderedListMatch[1]);
      listItems.push(
        <li key={`li-${index}`} className="markdown-list-item">
          {content}
        </li>
      );
      return;
    }

    // Blockquote detection (>)
    const blockquoteMatch = line.match(/^>\s+(.+)$/);
    if (blockquoteMatch) {
      const content = parseInlineMarkdown(blockquoteMatch[1]);
      elements.push(
        <blockquote key={`quote-${index}`} className="markdown-blockquote">
          {content}
        </blockquote>
      );
      return;
    }

    // Horizontal rule (---, ***, ___)
    if (line.trim().match(/^(\-{3,}|\*{3,}|_{3,})$/)) {
      elements.push(<hr key={`hr-${index}`} className="markdown-hr" />);
      return;
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<br key={`br-${index}`} />);
      return;
    }

    // Regular paragraph
    const content = parseInlineMarkdown(line);
    elements.push(
      <p key={`p-${index}`} className="markdown-paragraph">
        {content}
      </p>
    );
  });

  // Flush remaining list items
  if (listItems.length > 0) {
    elements.push(
      <ul key="list-final" className="markdown-list">
        {listItems}
      </ul>
    );
  }

  return elements;
}

/**
 * Parse inline markdown (bold, italic, code, links)
 * @param {string} text - Text with inline markdown
 * @returns {React.ReactElement[]} Array of React elements
 */
function parseInlineMarkdown(text) {
  const elements = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold (**text** or __text__)
    const boldMatch = remaining.match(/^(\*\*|__)(.+?)\1/);
    if (boldMatch) {
      elements.push(
        <strong key={`bold-${key++}`} className="markdown-bold">
          {boldMatch[2]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic (*text* or _text_)
    const italicMatch = remaining.match(/^(\*|_)(.+?)\1/);
    if (italicMatch) {
      elements.push(
        <em key={`italic-${key++}`} className="markdown-italic">
          {italicMatch[2]}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Inline code (`code`)
    const codeMatch = remaining.match(/^`(.+?)`/);
    if (codeMatch) {
      elements.push(
        <code key={`code-${key++}`} className="markdown-inline-code">
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Link ([text](url))
    const linkMatch = remaining.match(/^\[(.+?)\]\((.+?)\)/);
    if (linkMatch) {
      elements.push(
        <a
          key={`link-${key++}`}
          href={linkMatch[2]}
          className="markdown-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Strikethrough (~~text~~)
    const strikeMatch = remaining.match(/^~~(.+?)~~/);
    if (strikeMatch) {
      elements.push(
        <del key={`strike-${key++}`} className="markdown-strikethrough">
          {strikeMatch[1]}
        </del>
      );
      remaining = remaining.slice(strikeMatch[0].length);
      continue;
    }

    // No match - add plain text character
    elements.push(remaining[0]);
    remaining = remaining.slice(1);
  }

  return elements;
}

/**
 * Extract plain text from markdown (for titles, captions, etc.)
 * @param {string} text - Markdown text
 * @returns {string} Plain text without markdown syntax
 */
export function stripMarkdown(text) {
  if (!text) return '';

  return text
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove bold
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    // Remove italic
    .replace(/(\*|_)(.+?)\1/g, '$2')
    // Remove strikethrough
    .replace(/~~(.+?)~~/g, '$1')
    // Remove links
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // Remove headings
    .replace(/^#{1,6}\s+/gm, '')
    // Remove list markers
    .replace(/^[\*\-\+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^(\-{3,}|\*{3,}|_{3,})$/gm, '')
    .trim();
}
