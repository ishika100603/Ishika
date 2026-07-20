(function () {
  const { nodes, links } = GRAPH_DATA;

  const width = window.innerWidth;
  const height = window.innerHeight;

  const svg = d3.select('#graph-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('touch-action', 'none');

  const rootG = svg.append('g');
  const defs = svg.append('defs');

  // ---------- colour helpers ----------
  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  }
  function lighten(hex, amt) {
    const { r, g, b } = hexToRgb(hex);
    const L = v => Math.min(255, Math.round(v + (255 - v) * amt));
    return `rgb(${L(r)},${L(g)},${L(b)})`;
  }
  function darken(hex, amt) {
    const { r, g, b } = hexToRgb(hex);
    const D = v => Math.max(0, Math.round(v * (1 - amt)));
    return `rgb(${D(r)},${D(g)},${D(b)})`;
  }

  const categoryColor = {
    Studio: '#e05c8a', Collection: '#c9436b', Artwork: '#ff5f8f',
    Inspiration: '#9d5fd0', Material: '#7f8fd4', Technique: '#5fa8d0',
    Texture: '#6bbf9e', Colour: '#c2255c', Concept: '#d0a05f',
    Process: '#a89f92', Exhibition: '#ffd166'
  };

  nodes.forEach(d => { if (!d.color) d.color = categoryColor[d.category] || '#a06'; });

  // ---------- radial gradient per unique colour (paint-bubble look) ----------
  const uniqueColors = [...new Set(nodes.map(d => d.color))];
  const gradLookup = {};
  uniqueColors.forEach((c, i) => {
    const gid = 'grad-' + i;
    const g = defs.append('radialGradient')
      .attr('id', gid)
      .attr('cx', '35%').attr('cy', '30%').attr('r', '75%');
    g.append('stop').attr('offset', '0%').attr('stop-color', lighten(c, 0.55));
    g.append('stop').attr('offset', '35%').attr('stop-color', lighten(c, 0.15));
    g.append('stop').attr('offset', '75%').attr('stop-color', c);
    g.append('stop').attr('offset', '100%').attr('stop-color', darken(c, 0.35));
    gradLookup[c] = gid;
  });

  // ---------- goo filter, region explicitly bounded for performance ----------
  const goo = defs.append('filter')
    .attr('id', 'goo')
    .attr('x', '-40%').attr('y', '-40%')
    .attr('width', '180%').attr('height', '180%');
  goo.append('feGaussianBlur')
    .attr('in', 'SourceGraphic')
    .attr('stdDeviation', 6)
    .attr('result', 'blur');
  goo.append('feColorMatrix')
    .attr('in', 'blur')
    .attr('mode', 'matrix')
    .attr('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9')
    .attr('result', 'goo');

  const glowFilter = defs.append('filter')
    .attr('id', 'glow')
    .attr('x', '-80%').attr('y', '-80%')
    .attr('width', '260%').attr('height', '260%');
  glowFilter.append('feGaussianBlur').attr('stdDeviation', 5).attr('result', 'b');
  const merge = glowFilter.append('feMerge');
  merge.append('feMergeNode').attr('in', 'b');
  merge.append('feMergeNode').attr('in', 'SourceGraphic');

  // ---------- ZOOM (fixed: ignore drags that start on a node) ----------
  const zoomLayer = rootG.append('g').attr('class', 'zoom-layer');

  const zoomBehavior = d3.zoom()
    .scaleExtent([0.25, 5])
    .filter((event) => {
      if (event.type === 'wheel') return true;
      return !event.target.classList || !event.target.classList.contains('node-circle');
    })
    .on('zoom', (event) => {
      zoomLayer.attr('transform', event.transform);
    });

  svg.call(zoomBehavior)
     .on('dblclick.zoom', null);

  // ---------- zoom control buttons ----------
  const zoomControls = d3.select('body').append('div')
    .attr('id', 'zoom-controls')
    .style('position', 'fixed').style('bottom', '30px').style('right', '260px')
    .style('z-index', 20).style('display', 'flex').style('gap', '8px');

  function zoomBtn(label, onClick) {
    zoomControls.append('div')
      .text(label)
      .style('width', '30px').style('height', '30px')
      .style('display', 'flex').style('align-items', 'center').style('justify-content', 'center')
      .style('border-radius', '50%')
      .style('background', 'rgba(255,255,255,0.06)')
      .style('border', '1px solid rgba(255,255,255,0.15)')
      .style('color', '#f2e6e6').style('font-size', '14px').style('cursor', 'pointer')
      .style('user-select', 'none')
      .on('click', onClick);
  }
  zoomBtn('+', () => svg.transition().duration(300).call(zoomBehavior.scaleBy, 1.4));
  zoomBtn('–', () => svg.transition().duration(300).call(zoomBehavior.scaleBy, 0.7));
  zoomBtn('⟲', () => svg.transition().duration(500).call(zoomBehavior.transform, d3.zoomIdentity));

  // ---------- layers ----------
  const gooLayer = zoomLayer.append('g').attr('filter', 'url(#goo)');
  const linkLayer = gooLayer.append('g');
  const nodeBlobLayer = gooLayer.append('g');
  const labelLayer = zoomLayer.append('g'); // crisp, not gooey

  const link = linkLayer.selectAll('path')
    .data(links)
    .join('path')
    .attr('stroke', 'none')
    .attr('fill', 'rgba(255,255,255,0.85)');

  const node = nodeBlobLayer.selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('class', 'node-circle')
    .attr('r', d => d.size)
    .attr('fill', d => `url(#${gradLookup[d.color]})`)
    .style('cursor', 'grab')
    .call(drag());

  const ring = labelLayer.selectAll('circle.ring')
    .data(nodes)
    .join('circle')
    .attr('class', 'ring')
    .attr('r', d => d.size + 2)
    .attr('fill', 'none')
    .attr('stroke', 'rgba(255,255,255,0)')
    .attr('stroke-width', 1.5)
    .attr('pointer-events', 'none');

  const labels = labelLayer.selectAll('text')
    .data(nodes)
    .join('text')
    .text(d => d.label)
    .attr('font-size', d => Math.max(9, d.size * 0.4))
    .attr('fill', 'rgba(255,255,255,0.9)')
    .attr('text-anchor', 'middle')
    .attr('dy', d => d.size + 13)
    .attr('pointer-events', 'none')
    .style('text-shadow', '0 0 6px rgba(0,0,0,0.8)')
    .style('opacity', d => d.size > 18 ? 0.85 : 0);

  // ---------- simulation ----------
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(58).strength(0.45))
    .force('charge', d3.forceManyBody().strength(-100))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(d => d.size + 5).strength(0.85))
    .alphaDecay(0.02)
    .on('tick', ticked);

  function bridgePath(s, t) {
    const dx = t.x - s.x, dy = t.y - s.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / dist, ny = dx / dist;

    const closeness = Math.max(0, 1 - dist / 260);
    const rs = s.size * (0.55 + closeness * 0.25);
    const rt = t.size * (0.55 + closeness * 0.25);

    const p1 = [s.x + nx * rs, s.y + ny * rs];
    const p2 = [t.x + nx * rt, t.y + ny * rt];
    const p3 = [t.x - nx * rt, t.y - ny * rt];
    const p4 = [s.x - nx * rs, s.y - ny * rs];

    const midX = (s.x + t.x) / 2, midY = (s.y + t.y) / 2;

    return `M${p1[0]},${p1[1]} Q${midX},${midY} ${p2[0]},${p2[1]} L${p3[0]},${p3[1]} Q${midX},${midY} ${p4[0]},${p4[1]} Z`;
  }

  function ticked() {
    link.attr('d', d => bridgePath(d.source, d.target));
    node.attr('cx', d => d.x).attr('cy', d => d.y);
    ring.attr('cx', d => d.x).attr('cy', d => d.y);
    labels.attr('x', d => d.x).attr('y', d => d.y);
  }

  d3.timer((elapsed) => {
    nodes.forEach(d => {
      if (d._pulseOffset === undefined) d._pulseOffset = Math.random() * 1000;
      d._pulse = 1 + Math.sin((elapsed + d._pulseOffset) * 0.0009) * 0.045;
    });
    node.attr('r', d => d.size * d._pulse);
  });

  function drag() {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.2).restart();
      d.fx = d.x; d.fy = d.y;
      d3.select(this).style('cursor', 'grabbing');
    }
    function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null; d.fy = null;
      d3.select(this).style('cursor', 'grab');
    }
    return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
  }

  const neighborMap = {};
  links.forEach(l => {
    const s = typeof l.source === 'object' ? l.source.id : l.source;
    const t = typeof l.target === 'object' ? l.target.id : l.target;
    (neighborMap[s] ||= new Set()).add(t);
    (neighborMap[t] ||= new Set()).add(s);
  });

  node.on('mouseover', function (event, d) {
      const neighbors = neighborMap[d.id] || new Set();
      node.style('opacity', n => n.id === d.id || neighbors.has(n.id) ? 1 : 0.14);
      labels.style('opacity', n => (n.id === d.id || neighbors.has(n.id)) ? (n.size > 18 ? 0.9 : 0.75) : 0);
      link.style('opacity', l => {
        const s = typeof l.source === 'object' ? l.source.id : l.source;
        const t = typeof l.target === 'object' ? l.target.id : l.target;
        return (s === d.id || t === d.id) ? 0.95 : 0.03;
      });
      ring.attr('stroke', n => n.id === d.id ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0)');
      showPanel(d);
    })
    .on('mouseout', () => {
      node.style('opacity', 1);
      labels.style('opacity', d => d.size > 18 ? 0.85 : 0);
      link.style('opacity', 1);
      ring.attr('stroke', 'rgba(255,255,255,0)');
      hidePanel();
    })
    .on('click', (event, d) => {
      event.stopPropagation();
      focusOn(d);
    });

  svg.on('click', () => {
    node.style('opacity', 1);
    labels.style('opacity', d => d.size > 18 ? 0.85 : 0);
    link.style('opacity', 1);
  });

  function focusOn(d) {
    const targetScale = 2.4;
    const transform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(targetScale)
      .translate(-d.x, -d.y);
    svg.transition().duration(750).ease(d3.easeCubicOut).call(zoomBehavior.transform, transform);
  }

  const panel = document.getElementById('info-panel');
  const panelLabel = document.getElementById('panel-label');
  const panelCategory = document.getElementById('panel-category');
  const panelDesc = document.getElementById('panel-desc');

  function showPanel(d) {
    panelLabel.textContent = d.label;
    panelCategory.textContent = d.category;
    panelDesc.textContent = d.description;
    panel.classList.add('visible');
  }
  function hidePanel() { panel.classList.remove('visible'); }

  const categories = [...new Set(nodes.map(n => n.category))];
  const filterContainer = d3.select('#filters');
  let activeFilters = new Set(categories);

  filterContainer.selectAll('.filter-chip')
    .data(categories)
    .join('div')
    .attr('class', 'filter-chip active')
    .text(d => d)
    .on('click', function (event, cat) {
      if (activeFilters.has(cat)) {
        activeFilters.delete(cat);
        d3.select(this).classed('active', false);
      } else {
        activeFilters.add(cat);
        d3.select(this).classed('active', true);
      }
      applyFilter();
    });

  function applyFilter() {
    node.style('display', d => activeFilters.has(d.category) ? null : 'none');
    ring.style('display', d => activeFilters.has(d.category) ? null : 'none');
    labels.style('display', d => activeFilters.has(d.category) ? null : 'none');
    link.style('display', l => {
      const s = typeof l.source === 'object' ? l.source : nodes.find(n => n.id === l.source);
      const t = typeof l.target === 'object' ? l.target : nodes.find(n => n.id === l.target);
      return (activeFilters.has(s.category) && activeFilters.has(t.category)) ? null : 'none';
    });
  }

  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      node.style('opacity', 1);
      labels.style('opacity', d => d.size > 18 ? 0.85 : 0);
      return;
    }
    const match = nodes.find(n => n.label.toLowerCase().includes(q));
    node.style('opacity', n => n.label.toLowerCase().includes(q) ? 1 : 0.08);
    labels.style('opacity', n => n.label.toLowerCase().includes(q) ? 0.95 : 0);
    if (match) focusOn(match);
  });

  window.addEventListener('resize', () => location.reload());
})();
