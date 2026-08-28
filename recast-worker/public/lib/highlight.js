/*!
 * Recast syntax highlighting — lightweight regex tokenizers, no dependency.
 * Deliberately tolerant of invalid/partial input (user is still typing),
 * since these run on raw pasted text, not a parsed AST.
 */
(function (root) {
  'use strict';

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // JSON: classic regex tokenizer — matches strings (incl. keys), numbers, booleans, null.
  function highlightJson(text) {
    const escaped = escapeHtml(text);
    return escaped.replace(
      /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false)\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
      function (match) {
        let cls = 'tok-num';
        if (/^"/.test(match)) cls = /:\s*$/.test(match) ? 'tok-key' : 'tok-str';
        else if (/^(true|false)$/.test(match)) cls = 'tok-bool';
        else if (match === 'null') cls = 'tok-null';
        return '<span class="' + cls + '">' + match + '</span>';
      }
    );
  }

  // XML: highlight tag names and attribute name/value pairs on already-escaped text.
  function highlightXml(text) {
    let escaped = escapeHtml(text);
    // attribute="value" or attribute='value'
    escaped = escaped.replace(
      /\b([a-zA-Z_:][\w:.-]*)(=)("[^"]*"|'[^']*')/g,
      function (m, name, eq, val) {
        return '<span class="tok-attr">' + name + '</span>' + eq + '<span class="tok-str">' + val + '</span>';
      }
    );
    // tag names right after &lt; or &lt;/
    escaped = escaped.replace(
      /(&lt;\/?)([a-zA-Z_][\w:.-]*)/g,
      function (m, bracket, name) {
        return bracket + '<span class="tok-tag">' + name + '</span>';
      }
    );
    return escaped;
  }

  // CSV: emphasize the header row and the delimiter character.
  function highlightCsv(text, delim) {
    delim = delim || ',';
    const escaped = escapeHtml(text);
    const lines = escaped.split('\n');
    const delimEsc = delim === '\t' ? '\t' : delim.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const delimRe = new RegExp(delimEsc, 'g');
    return lines.map(function (line, i) {
      const withDelims = line.replace(delimRe, '<span class="tok-punct">' + delim + '</span>');
      return i === 0 ? '<span class="tok-key">' + withDelims + '</span>' : withDelims;
    }).join('\n');
  }

  function highlightPlain(text) {
    return escapeHtml(text);
  }

  function highlightFor(kind, text, opts) {
    opts = opts || {};
    if (kind === 'json') return highlightJson(text);
    if (kind === 'xml') return highlightXml(text);
    if (kind === 'csv') return highlightCsv(text, opts.delimiter);
    return highlightPlain(text);
  }

  /**
   * Wire a textarea + backing <pre><code> overlay to stay in sync.
   * The textarea's own text is made transparent (see CSS .ta-wrap) so only
   * the highlighted overlay is visible, while the textarea still handles
   * all real editing, selection, and caret behavior natively.
   */
  function attachHighlight(textareaEl, layerEl, kindGetter, optsGetter) {
    function render() {
      const kind = kindGetter();
      const html = highlightFor(kind, textareaEl.value, optsGetter ? optsGetter() : {});
      // trailing newline needs a space so the overlay height matches the textarea
      layerEl.innerHTML = html + (textareaEl.value.slice(-1) === '\n' ? ' ' : '');
    }
    function syncScroll() {
      layerEl.scrollTop = textareaEl.scrollTop;
      layerEl.scrollLeft = textareaEl.scrollLeft;
    }
    textareaEl.addEventListener('input', render);
    textareaEl.addEventListener('scroll', syncScroll);
    render();
    return { render: render, syncScroll: syncScroll };
  }

  // Wraps specific lines of already-highlighted HTML in a diff-highlight
  // span, without touching the tokenizer at all. Safe because JSON tokens
  // never span multiple lines (no literal newlines inside a JSON string),
  // so splitting the finished HTML on '\n' always lands on a real line
  // boundary, never mid-span.
  //
  // lineClasses: { [lineIndex]: 'diff-added' | 'diff-removed' | 'diff-changed' }
  function applyDiffLineHighlights(html, lineClasses) {
    if (!lineClasses || !Object.keys(lineClasses).length) return html;
    const lines = html.split('\n');
    return lines.map(function (line, idx) {
      const cls = lineClasses[idx];
      if (!cls) return line;
      return '<span class="diff-line ' + cls + '" data-diff-line="' + idx + '">' + line + '</span>';
    }).join('\n');
  }

  const api = {
    escapeHtml: escapeHtml,
    highlightJson: highlightJson,
    highlightXml: highlightXml,
    highlightCsv: highlightCsv,
    highlightPlain: highlightPlain,
    highlightFor: highlightFor,
    attachHighlight: attachHighlight,
    applyDiffLineHighlights: applyDiffLineHighlights
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; // testable in Node
  root.RecastHighlight = api; // browser global
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
