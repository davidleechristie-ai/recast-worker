/*!
 * Recast tree-diff compare — a filterable, searchable table view over an
 * engine.deepDiff() result (used for XML and JSON diffs, since both go
 * through deepDiff rather than csvDiff's row-matched comparison).
 *
 * Deliberately parallel to csv-compare.js rather than a shared module:
 * deepDiff's flat {path, type, oldVal, newVal} shape has no natural
 * "row" or "column" concept the way CSV does, and no meaningful
 * "unchanged" count (deepDiff only ever returns actual changes, not
 * every unchanged leaf of an arbitrarily nested tree) — trying to force
 * both into one shared table renderer would make neither one clearer.
 *
 * Pure string-building / data functions here — no DOM access — so every
 * piece is directly testable in Node. app.js wires these into the
 * actual page (click handlers, live re-render on filter/search change).
 */
(function (root) {
  'use strict';

  function esc(s) {
    if (s === undefined || s === null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmtVal(v) {
    if (v === null) return 'null';
    if (v === undefined) return '';
    return typeof v === 'string' ? v : JSON.stringify(v);
  }

  /**
   * Filters the flat changes list by status and a free-text search
   * (matches the path or either value). Pure — no rendering, so the
   * table-building and CSV/HTML export can share one filtered list.
   */
  function filterChanges(changes, statusFilter, searchText) {
    let rows = changes;
    if (statusFilter && statusFilter !== 'all') {
      rows = rows.filter(function (c) { return c.type === statusFilter; });
    }
    if (searchText) {
      const needle = searchText.toLowerCase();
      rows = rows.filter(function (c) {
        return c.path.toLowerCase().indexOf(needle) !== -1 ||
          fmtVal(c.oldVal).toLowerCase().indexOf(needle) !== -1 ||
          fmtVal(c.newVal).toLowerCase().indexOf(needle) !== -1;
      });
    }
    return rows;
  }

  function buildTableHtml(changes, opts) {
    opts = opts || {};
    const rows = filterChanges(changes, opts.statusFilter, opts.searchText);
    if (!rows.length) return '<div class="diff-empty">No changes match the current filter.</div>';

    const body = rows.map(function (c) {
      const badgeText = c.type === 'added' ? 'ADD' : c.type === 'removed' ? 'DEL' : 'CHG';
      let valueCell;
      if (c.type === 'added') {
        valueCell = '<span class="cell-new">' + esc(fmtVal(c.newVal)) + '</span>';
      } else if (c.type === 'removed') {
        valueCell = '<span class="cell-old">' + esc(fmtVal(c.oldVal)) + '</span>';
      } else {
        valueCell = '<span class="cell-old">' + esc(fmtVal(c.oldVal)) + '</span> \u2192 <span class="cell-new">' + esc(fmtVal(c.newVal)) + '</span>';
      }
      return '<tr class="row-' + c.type + '" data-path="' + esc(c.path) + '" data-status="' + c.type + '">' +
        '<td class="col-status"><span class="row-badge">' + badgeText + '</span></td>' +
        '<td class="col-path">' + esc(c.path) + '</td>' +
        '<td class="col-value">' + valueCell + '</td></tr>';
    }).join('');

    return '<div class="diff-table-wrap"><table class="diff-table">' +
      '<thead><tr><th class="col-status">Status</th><th>Path</th><th>Value</th></tr></thead>' +
      '<tbody>' + body + '</tbody></table></div>';
  }

  function toReportCsv(changes) {
    function csvCell(v) {
      const s = v === undefined || v === null ? '' : String(v);
      if (/["\n,]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    }
    const lines = ['status,path,old,new'];
    changes.forEach(function (c) {
      lines.push([c.type, c.path, fmtVal(c.oldVal), fmtVal(c.newVal)].map(csvCell).join(','));
    });
    return lines.join('\n');
  }

  /**
   * Standalone HTML report: a self-contained file (inline styles, no
   * external assets) so it can be emailed/shared and opened by someone
   * without the tool, and still shows the full colored comparison. Same
   * shape and styling as csv-compare's report, for a consistent feel
   * across every diff tool's exported reports.
   */
  function toReportHtml(changes, opts) {
    opts = opts || {};
    const title = opts.title || 'Structural Comparison Report';
    const added = changes.filter(function (c) { return c.type === 'added'; }).length;
    const removed = changes.filter(function (c) { return c.type === 'removed'; }).length;
    const changedCount = changes.filter(function (c) { return c.type === 'changed'; }).length;
    const summary = added + ' added \u00b7 ' + removed + ' removed \u00b7 ' + changedCount + ' changed';
    const table = buildTableHtml(changes, {});
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + esc(title) + '</title><style>' +
      'body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#0A0E1F;color:#EDF3F8;padding:24px;margin:0;}' +
      'h1{font-size:20px;margin:0 0 6px;}' +
      '.summary{color:#B9CBDA;font-size:13px;margin-bottom:18px;}' +
      '.diff-table-wrap{overflow-x:auto;border:1px solid rgba(120,110,180,0.32);border-radius:4px;}' +
      '.diff-table{border-collapse:collapse;width:100%;font-family:ui-monospace,Menlo,monospace;font-size:12.5px;}' +
      '.diff-table th,.diff-table td{padding:7px 10px;border-bottom:1px solid rgba(120,110,180,0.16);text-align:left;}' +
      '.diff-table th{background:#131A33;position:sticky;top:0;}' +
      '.col-status{width:70px;}' +
      '.row-badge{font-size:10px;text-transform:uppercase;padding:2px 7px;border-radius:2px;display:inline-block;}' +
      '.row-added .row-badge{background:#3AA2FC;color:#0A0E1F;} .row-added{background:rgba(58,162,252,0.06);}' +
      '.row-removed .row-badge{background:#F2846B;color:#0A0E1F;} .row-removed{background:rgba(242,132,107,0.06);}' +
      '.row-changed .row-badge{background:#A855F7;color:#0A0E1F;} .row-changed{background:rgba(168,85,247,0.06);}' +
      '.cell-old{color:#F2846B;text-decoration:line-through;opacity:.8;font-size:11px;}' +
      '.cell-new{color:#3AA2FC;}' +
      '</style></head><body><h1>' + esc(title) + '</h1><div class="summary">' + esc(summary) + '</div>' + table + '</body></html>';
  }

  const api = { filterChanges: filterChanges, buildTableHtml: buildTableHtml, toReportCsv: toReportCsv, toReportHtml: toReportHtml };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RecastTreeCompare = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
