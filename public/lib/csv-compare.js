/*!
 * Recast CSV compare — builds a Beyond-Compare-style aligned side-by-side
 * view from an engine.csvDiff() result: filterable by status, searchable,
 * and exportable as a CSV report or a standalone HTML report.
 *
 * Pure string-building / data functions here — no DOM access — so every
 * piece is directly testable in Node. app.js wires these into the actual
 * page (click handlers, live re-render on filter/search change).
 */
(function (root) {
  'use strict';

  function esc(s) {
    if (s === undefined || s === null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /**
   * Filters the aligned rows by status and a free-text search (matches the
   * key or any cell value on either side). Pure — no rendering, so the
   * exact same logic drives both the on-screen table and any downstream
   * count/summary.
   */
  function filterRows(rows, statusFilter, searchText) {
    let out = rows;
    if (statusFilter && statusFilter !== 'all') {
      out = out.filter(function (r) { return r.status === statusFilter; });
    }
    const q = (searchText || '').trim().toLowerCase();
    if (q) {
      out = out.filter(function (r) {
        if (String(r.key).toLowerCase().indexOf(q) !== -1) return true;
        const cells = [];
        if (r.a) Object.keys(r.a).forEach(function (k) { cells.push(r.a[k]); });
        if (r.b) Object.keys(r.b).forEach(function (k) { cells.push(r.b[k]); });
        return cells.some(function (v) { return String(v).toLowerCase().indexOf(q) !== -1; });
      });
    }
    return out;
  }

  /** Builds the HTML for the aligned side-by-side table (the on-screen view). */
  function buildTableHtml(cd, opts) {
    opts = opts || {};
    const rows = filterRows(cd.rows, opts.statusFilter, opts.searchText);
    const headers = cd.headers;

    if (!rows.length) {
      return '<div class="diff-empty">No rows match the current filter.</div>';
    }

    const thead = '<thead><tr><th class="col-status">Status</th>' +
      headers.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead>';

    const body = rows.map(function (r) {
      const badgeText = r.status === 'unchanged' ? 'same' : (r.status === 'removed' ? 'del' : (r.status === 'added' ? 'add' : 'chg'));
      const cells = headers.map(function (col) {
        const isChanged = r.changedCols.indexOf(col) !== -1;
        if (isChanged) {
          const fromVal = r.a ? r.a[col] : undefined;
          const toVal = r.b ? r.b[col] : undefined;
          return '<td class="cell-changed"><div class="cell-old">' + esc(fromVal) + '</div><div class="cell-new">' + esc(toVal) + '</div></td>';
        }
        const val = r.status === 'removed' ? (r.a ? r.a[col] : '') : (r.b ? r.b[col] : (r.a ? r.a[col] : ''));
        return '<td>' + esc(val) + '</td>';
      }).join('');
      return '<tr class="row-' + r.status + '" data-key="' + esc(r.key) + '" data-status="' + r.status + '"><td class="col-status"><span class="row-badge">' + badgeText + '</span></td>' + cells + '</tr>';
    }).join('');

    return '<div class="diff-table-wrap"><table class="diff-table">' + thead + '<tbody>' + body + '</tbody></table></div>';
  }

  /**
   * Downloadable CSV report: one row per aligned row, a status column, and
   * changed cells encoded as "old -> new" so it stays a single flat file
   * that opens cleanly in a spreadsheet.
   */
  function toReportCsv(cd) {
    function csvCell(v) {
      const s = v === undefined || v === null ? '' : String(v);
      if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    }
    const headers = ['status'].concat(cd.headers);
    const lines = [headers.map(csvCell).join(',')];
    cd.rows.forEach(function (r) {
      const cells = [r.status];
      cd.headers.forEach(function (col) {
        if (r.changedCols.indexOf(col) !== -1) {
          const fromVal = r.a ? r.a[col] : '';
          const toVal = r.b ? r.b[col] : '';
          cells.push((fromVal === undefined ? '' : fromVal) + ' -> ' + (toVal === undefined ? '' : toVal));
        } else {
          const val = r.status === 'removed' ? (r.a ? r.a[col] : '') : (r.b ? r.b[col] : (r.a ? r.a[col] : ''));
          cells.push(val === undefined ? '' : val);
        }
      });
      lines.push(cells.map(csvCell).join(','));
    });
    return lines.join('\n');
  }

  /**
   * Standalone HTML report: a self-contained file (inline styles, no
   * external assets) so it can be emailed/shared and opened by someone
   * without the tool, and still shows the full colored comparison.
   */
  function toReportHtml(cd, opts) {
    opts = opts || {};
    const title = opts.title || 'CSV Comparison Report';
    const summary = cd.added.length + ' added \u00b7 ' + cd.removed.length + ' removed \u00b7 ' +
      cd.changed.length + ' changed \u00b7 ' + (cd.rows.length - cd.added.length - cd.removed.length - cd.changed.length) + ' unchanged';
    const table = buildTableHtml(cd, {});
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + esc(title) + '</title><style>' +
      'body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#0A0E1F;color:#EDF3F8;padding:24px;margin:0;}' +
      'h1{font-size:20px;margin:0 0 6px;}' +
      '.summary{color:#B9CBDA;font-size:13px;margin-bottom:18px;}' +
      '.diff-table-wrap{overflow-x:auto;border:1px solid rgba(120,110,180,0.32);border-radius:4px;}' +
      '.diff-table{border-collapse:collapse;width:100%;font-family:ui-monospace,Menlo,monospace;font-size:12.5px;}' +
      '.diff-table th,.diff-table td{padding:7px 10px;border-bottom:1px solid rgba(120,110,180,0.16);text-align:left;white-space:nowrap;}' +
      '.diff-table th{background:#131A33;position:sticky;top:0;}' +
      '.col-status{width:70px;}' +
      '.row-badge{font-size:10px;text-transform:uppercase;padding:2px 7px;border-radius:2px;display:inline-block;}' +
      '.row-added .row-badge{background:#3AA2FC;color:#0A0E1F;} .row-added{background:rgba(58,162,252,0.06);}' +
      '.row-removed .row-badge{background:#F2846B;color:#0A0E1F;} .row-removed{background:rgba(242,132,107,0.06);}' +
      '.row-changed .row-badge{background:#A855F7;color:#0A0E1F;} .row-changed{background:rgba(168,85,247,0.06);}' +
      '.row-unchanged .row-badge{background:rgba(120,110,180,0.32);color:#EDF3F8;}' +
      '.cell-changed{background:rgba(168,85,247,0.12);}' +
      '.cell-old{color:#F2846B;text-decoration:line-through;opacity:.8;font-size:11px;}' +
      '.cell-new{color:#3AA2FC;}' +
      '</style></head><body><h1>' + esc(title) + '</h1><div class="summary">' + esc(summary) +
      ' \u00b7 rows matched by <b>' + esc(cd.keyColumn) + '</b></div>' + table + '</body></html>';
  }

  const api = { filterRows: filterRows, buildTableHtml: buildTableHtml, toReportCsv: toReportCsv, toReportHtml: toReportHtml };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RecastCompare = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
