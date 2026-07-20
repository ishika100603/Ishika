(function () {
  const { nodes, links } = GRAPH_DATA;

  const width = window.innerWidth;
  const height = window.innerHeight;

  const svg = d3.select('#graph-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const rootG = svg.append('g');

  // ---------- GOO FILTER (organic bubble-merge effect) ----------
  const defs = svg.append('defs');
  const goo = defs.append('filter').attr('id', 'goo');
  goo.append('feGaussianBlur')
    .attr('in', 'SourceGraphic')
    .attr('stdDeviation', 8)
    .attr('result', 'blur');
  goo.append('feColorMatrix')
    .attr('in', 'blur')
    .attr('mode', 'matrix')
    .attr('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11')
    .attr('result', 'goo');
  goo.append('feBlend')
    .attr('in', 'SourceGraphic')
    .attr('in2', 'goo');

  defs.append('filter').attr('id', 'glow')
    .html('<feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>');

  // ---------- zoom ----------
  const zoomLayer = rootG.append('g').attr('class', 'zoom-layer');
  svg.call(d3.zoom().scaleExtent([0.3, 4]).on('zoom', (event) => {
    zoomLayer.attr('transform', event.transform);
  }));

  // ---------- gooey layer (links + node blobs merge here) ----------
  const gooLayer = zoomLayer.append('g').attr('filter', 'url(#goo)');
  const linkLayer = gooLayer.append('g');
  const nodeBlobLayer = gooLayer.append('g');

  // crisp layer for labels (labels should NOT be gooey/blurred)
  const labelLayer = zoomLayer.append('g');

  const categoryColor = {
    Studio: '#e05c8a', Collection: '#c9436b', Artwork: '#ff6f91',
    Inspiration: '#9d5fd0', Material: '#7f8fd4', Technique: '#5fa8d0',
    Texture: '#6bbf9e', Colour: '#c2255c', Concept: '#d0a05f',
    Process: '#a0a0a0', Exhibition: '#ffd166'
  };

  const link = linkLayer.selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', 'rgba(255,255,255,0.9)')
    .attr('stroke-width', d => 4 + Math.random() * 3);

  const node = nodeBlobLayer.selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', d => d.size)
    .attr('fill', d => d.color || categoryColor[d.category] || '#888')
    .call(drag());

  const labels = labelLayer.selectAll('text')
    .data(nodes)
    .join('text')
    .text(d => d.label)
    .attr('font-size', d => Math.max(8, d.size * 0.42))
    .attr('fill', 'rgba(255,255,255,0.85)')
    .attr('text-anchor', 'middle')
    .attr('dy', d => d.size + 12)
    .attr('pointer-events', 'none')
    .style('opacity', d => d.size > 15 ? 0.9 : 0);

  // ---------- simulation ----------
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(60).strength(0.5))
    .force('charge', d3.forceManyBody().strength(-90))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(d => d.size + 6).strength(0.9))
    .on('tick', ticked);

  function ticked() {
    link
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    node.attr('cx', d => d.x).attr('cy', d => d.y);
    labels.attr('x', d => d.x).attr('y', d => d.y);
  }

  // gentle pulsing drift
  d3.timer((elapsed) => {
    nodes.forEach(d => {
      if (!d._pulseOffset) d._pulseOffset = Math.random() * 1000;
      d.r_pulse = d.size + Math.sin((elapsed + d._pulseOffset) * 0.001) * (d.size * 0.06);
    });
    node.attr('r', d => d.r_pulse || d.size);
  });

  function drag() {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.15).restart();
      d.fx = d.x; d.fy = d.y;
    }
    function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null; d.fy = null;
    }
    return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
  }

  // ---------- hover highlight ----------
  const neighborMap = {};
  links.forEach(l => {
    const s = typeof l.source === 'object' ? l.source.id : l.source;
    const t = typeof l.target === 'object' ? l.target.id : l.target;
    (neighborMap[s] ||= new Set()).add(t);
    (neighborMap[t] ||= new Set()).add(s);
  });

  node.on('mouseover', (event, d) => {
    const neighbors = neighborMap[d.id] || new Set();
    node.style('opacity', n => n.id === d.id || neighbors.has(n.id) ? 1 : 0.12);
    labels.style('opacity', n => (n.id === d.id || neighbors.has(n.id)) ? (n.size > 15 ? 0.95 : 0.7) : 0);
    link.style('opacity', l => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      return (s === d.id || t === d.id) ? 0.9 : 0.05;
    });
    showPanel(d);
  })
  .on('mouseout', () => {
    node.style('opacity', 1);
    labels.style('opacity', d => d.size > 15 ? 0.9 : 0);
    link.style('opacity', 1);
    hidePanel();
  })
  .on('click', (event, d) => {
    event.stopPropagation();
    focusOn(d);
  });

  svg.on('click', () => {
    node.style('opacity', 1);
    labels.style('opacity', d => d.size > 15 ? 0.9 : 0);
    link.style('opacity', 1);
  });

  function focusOn(d) {
    const targetScale = 2.2;
    const transform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(targetScale)
      .translate(-d.x, -d.y);
    svg.transition().duration(700).call(d3.zoom().transform, transform);
  }

  // ---------- info panel ----------
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

  // ---------- category filters ----------
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
    labels.style('display', d => activeFilters.has(d.category) ? null : 'none');
    link.style('display', l => {
      const s = typeof l.source === 'object' ? l.source : nodes.find(n => n.id === l.source);
      const t = typeof l.target === 'object' ? l.target : nodes.find(n => n.id === l.target);
      return (activeFilters.has(s.category) && activeFilters.has(t.category)) ? null : 'none';
    });
  }

  // ---------- search ----------
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      node.style('opacity', 1);
      labels.style('opacity', d => d.size > 15 ? 0.9 : 0);
      return;
    }
    const match = nodes.find(n => n.label.toLowerCase().includes(q));
    node.style('opacity', n => n.label.toLowerCase().includes(q) ? 1 : 0.08);
    labels.style('opacity', n => n.label.toLowerCase().includes(q) ? 0.95 : 0);
    if (match) focusOn(match);
  });

  window.addEventListener('resize', () => location.reload());
})();
