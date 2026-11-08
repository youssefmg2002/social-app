/**
 * Inserts `text` at the textarea's cursor position (replacing any selection),
 * moves the cursor after the inserted text and returns the new value.
 */
export function insertAtCursor(textarea: HTMLTextAreaElement | HTMLInputElement, text: string): string {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const value = textarea.value.slice(0, start) + text + textarea.value.slice(end);
  textarea.value = value;

  const cursor = start + text.length;
  textarea.focus();
  textarea.setSelectionRange(cursor, cursor);
  return value;
}

