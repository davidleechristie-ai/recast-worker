/*!
 * Recast graph view — an interactive, collapsible visual tree for exploring
 * JSON structure, rendered as plain SVG with no external graphing library.
 * Not a force-directed physics graph (that's a much bigger build for
 * uncertain payoff over a clean hierarchical layout) — a left-to-right node
 * tree you can collapse/expand, which covers the actual job people hire a
 * "JSON graph" for: understanding an unfamiliar or deeply nested structure
 * faster than scrolling raw text.
 */
(function (root) {
  'use strict';

  const V_SPACING = 34;
  const H_SPACING = 190;
  const NODE_PAD_X = 10;
  const NODE_H = 22;

  function typeOf(v) {
    if (v === null) return 'null';
    if (Array.isArray(v)) return 'array';
    return typeof v;
  }

  function buildTree(value, key, path) {
    const node = { key, path, type: typeOf(value) };
    if (node.type === 'null') {
      node.display = 'null';
    } else if (node.type === 'array') {
      node.display = `[${value.length}]`;
      node.children = value.map((v, i) => buildTree(v, String(i), path + '.' + i));
    } else if (node.type === 'object') {
      const keys = Object.keys(value);
      node.display = `{${keys.length}}`;
      node.children = keys.map(k => buildTree(value[k], k, path + '.' + k));
    } else if (node.type === 'string') {
      node.display = value.length > 40 ? JSON.stringify(value.slice(0, 40) + '\u2026') : JSON.stringify(value);
    } else {
      node.display = String(value);
    }
    return node;
  }

  // Simple sequential-leaf tree layout: every visible leaf gets the next
  // free row; every parent centers vertically on the vertical span of its
  // (already laid-out) visible children. No overlap possible by construction.
  function layout(node, depth, collapsedPaths, yCounter) {
    node.depth = depth;
    node.x = depth * H_SPACING;
    const isCollapsed = collapsedPaths.has(node.path);
    const hasChildren = node.children && node.children.length > 0;
    if (!hasChildren || isCollapsed) {
      node.y = yCounter.v * V_SPACING;
      yCounter.v += 1;
      node.visibleChildren = null;
    } else {
      node.children.forEach(c => layout(c, depth + 1, collapsedPaths, yCounter));
      node.y = (node.children[0].y + node.children[node.children.length - 1].y) / 2;
      node.visibleChildren = node.children;
    }
    node.collapsedButHasChildren = hasChildren && isCollapsed;
    return node;
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  const TYPE_COLORS = { string: '#3AA2FC', number: '#A855F7', integer: '#A855F7', boolean: '#C99FE8', null: '#F2846B', object: '#8FCBEB', array: '#8FCBEB' };

  function collectVisible(node, out) {
    out.push(node);
    if (node.visibleChildren) node.visibleChildren.forEach(c => collectVisible(c, out));
  }

  function renderSVG(root, maxY) {
    const nodes = [];
    collectVisible(root, nodes);
    const maxX = Math.max(...nodes.map(n => n.x)) + H_SPACING;
    const height = (maxY.v + 1) * V_SPACING;

    let edges = '';
    let nodeEls = '';
    nodes.forEach(n => {
      if (n.visibleChildren) {
        n.visibleChildren.forEach(c => {
          const x1 = n.x + NODE_PAD_X + 4, y1 = n.y + NODE_H / 2;
          const x2 = c.x, y2 = c.y + NODE_H / 2;
          const midX = (x1 + x2) / 2;
          edges += `<path d="M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}" fill="none" stroke="rgba(120,110,180,0.35)" stroke-width="1.5"/>`;
        });
      }
      const label = (n.key !== null ? esc(n.key) + ': ' : '') + esc(n.display);
      const color = TYPE_COLORS[n.type] || '#EDF3F8';
      const clickable = (n.children && n.children.length > 0);
      const width = Math.min(H_SPACING - 16, 10 + label.length * 6.4);
      nodeEls += `<g class="graph-node${clickable ? ' clickable' : ''}" data-path="${esc(n.path)}" transform="translate(${n.x},${n.y})">` +
        `<rect width="${width}" height="${NODE_H}" rx="3" fill="#131A33" stroke="${clickable ? '#A855F7' : 'rgba(120,110,180,0.32)'}" stroke-width="1.2"/>` +
        (clickable ? `<text x="6" y="${NODE_H / 2 + 4}" font-size="10" fill="#A855F7" font-family="monospace">${n.collapsedButHasChildren ? '\u25b8' : '\u25be'}</text>` : '') +
        `<text x="${clickable ? 16 : 8}" y="${NODE_H / 2 + 4}" font-size="11.5" fill="${color}" font-family="'IBM Plex Mono', monospace">${label}</text>` +
        `</g>`;
    });

    return `<svg width="${maxX}" height="${height}" xmlns="http://www.w3.org/2000/svg">${edges}${nodeEls}</svg>`;
  }

  const collapsedByContainer = new WeakMap();

  function svgElementFor(containerEl) { return containerEl.querySelector('svg'); }

  function triggerDownload(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }

  function exportSVG(containerEl, filenameBase) {
    const svg = svgElementFor(containerEl);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob(['<?xml version="1.0" standalone="no"?>\r\n' + svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, (filenameBase || 'recast-graph') + '.svg');
    URL.revokeObjectURL(url);
  }

  function exportPNG(containerEl, filenameBase) {
    const svg = svgElementFor(containerEl);
    if (!svg) return;
    const width = parseInt(svg.getAttribute('width'), 10) || svg.clientWidth || 400;
    const height = parseInt(svg.getAttribute('height'), 10) || svg.clientHeight || 200;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = function () {
      const scale = 2; // export at 2x so text stays crisp
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0A0E1F'; // match the site background instead of a transparent PNG
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob(function (blob) {
        const pngUrl = URL.createObjectURL(blob);
        triggerDownload(pngUrl, (filenameBase || 'recast-graph') + '.png');
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');
    };
    img.src = url;
  }

  function injectExportButtons(containerEl) {
    const bar = document.createElement('div');
    bar.className = 'graph-export-bar';
    bar.innerHTML = '<button type="button" data-export="svg" title="Download as SVG">SVG</button><button type="button" data-export="png" title="Download as PNG">PNG</button>';
    bar.querySelector('[data-export="svg"]').addEventListener('click', (e) => { e.stopPropagation(); exportSVG(containerEl); });
    bar.querySelector('[data-export="png"]').addEventListener('click', (e) => { e.stopPropagation(); exportPNG(containerEl); });
    containerEl.insertBefore(bar, containerEl.firstChild);
  }

  function render(containerEl, jsonText, opts) {
    opts = opts || {};
    let data;
    try { data = JSON.parse(jsonText); }
    catch (e) {
      containerEl.innerHTML = '<div class="graph-empty">Not valid JSON \u2014 fix the input to see the graph.</div>';
      return;
    }
    if (!collapsedByContainer.has(containerEl)) collapsedByContainer.set(containerEl, new Set());
    const collapsedPaths = collapsedByContainer.get(containerEl);

    const tree = buildTree(data, null, 'root');
    const yCounter = { v: 0 };
    layout(tree, 0, collapsedPaths, yCounter);
    containerEl.innerHTML = renderSVG(tree, yCounter);
    injectExportButtons(containerEl);

    containerEl.querySelectorAll('.graph-node.clickable').forEach(g => {
      g.addEventListener('click', () => {
        const path = g.dataset.path;
        if (collapsedPaths.has(path)) collapsedPaths.delete(path); else collapsedPaths.add(path);
        render(containerEl, jsonText, opts);
      });
    });
  }

  function resetCollapse(containerEl) { collapsedByContainer.delete(containerEl); }

  const api = { render, resetCollapse };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RecastGraph = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
