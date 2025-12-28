import React from "react";

/**
 * Formats post content by converting markdown-like syntax to React elements
 * Handles: **bold**, *italic*, __underline__, ~~strikethrough~~
 */
export function formatPostContent(content: string): React.ReactNode[] {
  if (!content) return [];

  // Split by markdown patterns while preserving delimiters
  const parts: React.ReactNode[] = [];
  let remaining = content;
  let key = 0;

  // Pattern to match markdown syntax
  const patterns = [
    { regex: /\*\*(.+?)\*\*/g, wrapper: (text: string, k: number) => React.createElement('strong', { key: k, className: 'font-semibold' }, text) },
    { regex: /\*(.+?)\*/g, wrapper: (text: string, k: number) => React.createElement('em', { key: k }, text) },
    { regex: /__(.+?)__/g, wrapper: (text: string, k: number) => React.createElement('u', { key: k }, text) },
    { regex: /~~(.+?)~~/g, wrapper: (text: string, k: number) => React.createElement('del', { key: k, className: 'text-muted-foreground' }, text) },
  ];

  // Process all patterns in sequence
  const processText = (text: string): React.ReactNode[] => {
    const nodes: React.ReactNode[] = [];
    let currentText = text;
    
    // Combined regex for all patterns
    const combinedRegex = /(\*\*.*?\*\*|\*[^*]+?\*|__.*?__|~~.*?~~)/g;
    
    let lastIndex = 0;
    let match;
    
    while ((match = combinedRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        nodes.push(text.slice(lastIndex, match.index));
      }
      
      const matchedText = match[0];
      
      // Determine which pattern matched and apply formatting
      if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
        const inner = matchedText.slice(2, -2);
        nodes.push(React.createElement('strong', { key: key++, className: 'font-semibold' }, inner));
      } else if (matchedText.startsWith('__') && matchedText.endsWith('__')) {
        const inner = matchedText.slice(2, -2);
        nodes.push(React.createElement('u', { key: key++ }, inner));
      } else if (matchedText.startsWith('~~') && matchedText.endsWith('~~')) {
        const inner = matchedText.slice(2, -2);
        nodes.push(React.createElement('del', { key: key++, className: 'text-muted-foreground' }, inner));
      } else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
        const inner = matchedText.slice(1, -1);
        nodes.push(React.createElement('em', { key: key++ }, inner));
      }
      
      lastIndex = match.index + matchedText.length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      nodes.push(text.slice(lastIndex));
    }
    
    return nodes.length > 0 ? nodes : [text];
  };

  return processText(content);
}

/**
 * Simple version that just removes markdown markers for plain text display
 */
export function stripMarkdown(content: string): string {
  if (!content) return "";
  return content
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/~~(.+?)~~/g, '$1');
}
