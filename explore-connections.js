(function () {
  const { nodes, links } = GRAPH_DATA;

  const width = window.innerWidth;
  const height = window.innerHeight;

  const svg = d3.select('#graph-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('touch-action', 'none')
    .style('background', '#f0e9d8');

  const BROWN = '#5c4a3d';
  const BROWN_SOFT = 'rgba(92, 74, 61, 0.55)';

  const rootG = svg.append('g');
  const defs = svg.append('defs');

  const categoryColor = {
    Studio: '#ff2f6d', Collection: '#ff3d78', Artwork: '#ff5f8f',
    Inspiration: '#b34fd6', Material: '#6b7fd6', Technique: '#4fb8d6',
    Texture: '#4fd6a8', Colour: '#e0295c', Concept: '#d68f4f',
    Process: '#8a7f76', Exhibition: '#ffb84f'
  };

  nodes.forEach(d => { if (!d.color) d.color = categoryColor[d.category] || '#c2255c'; });

  const bubbleCombos = [
    ['#ffd0e4', '#e8789a', '#c96a9a'],
    ['#ffe4a8', '#e8a850', '#d48868'],
    ['#b8e8cc', '#68b888', '#9888c0'],
    ['#ffc8dc', '#e87098', '#9078b8'],
    ['#ffe090', '#e89850', '#d87870'],
    ['#a8ddd4', '#58b8a8', '#d888a8'],
  ];

  const gradLookup = {};
  nodes.forEach((d, i) => {
    const combo = bubbleCombos[i % bubbleCombos.length];
    d.bubbleCombo = combo;
    const gid = 'bubble-' + i;
    const g = defs.append('radialGradient')
      .attr('id', gid)
      .attr('cx', '40%').attr('cy', '34%').attr('r', '70%');
    g.append('stop').attr('offset', '0%').attr('stop-color', '#ffffff').attr('stop-opacity', 0.95);
    g.append('stop').attr('offset', '28%').attr('stop-color', combo[0]).attr('stop-opacity', 0.92);
    g.append('stop').attr('offset', '62%').attr('stop-color', combo[1]).attr('stop-opacity', 0.78);
    g.append('stop').attr('offset', '100%').attr('stop-color', combo[2]).attr('stop-opacity', 0.62);
    gradLookup[d.id] = gid;
  });

  const waterGlow = defs.append('filter')
    .attr('id', 'water-glow')
    .attr('x', '-100%').attr('y', '-100%')
    .attr('width', '300%').attr('height', '300%');
  waterGlow.append('feGaussianBlur').attr('stdDeviation', '5').attr('result', 'blur');
  const waterMerge = waterGlow.append('feMerge');
  waterMerge.append('feMergeNode').attr('in', 'blur');
  waterMerge.append('feMergeNode').attr('in', 'SourceGraphic');

  const linkGlow = defs.append('filter')
    .attr('id', 'link-glow')
    .attr('x', '-50%').attr('y', '-50%')
    .attr('width', '200%').attr('height', '200%');
  linkGlow.append('feGaussianBlur').attr('stdDeviation', '1.8').attr('result', 'b');
  const linkGlowMerge = linkGlow.append('feMerge');
  linkGlowMerge.append('feMergeNode').attr('in', 'b');
  linkGlowMerge.append('feMergeNode').attr('in', 'SourceGraphic');

  const ambientBlur = defs.append('filter')
    .attr('id', 'ambient-blur')
    .attr('x', '-50%').attr('y', '-50%')
    .attr('width', '200%').attr('height', '200%');
  ambientBlur.append('feGaussianBlur').attr('stdDeviation', '42');

  const clusterR = Math.min(width, height) * 0.34;
  const cx = width / 2;
  const cy = height / 2;

  const ambientLayer = rootG.append('g')
    .attr('class', 'ambient-layer')
    .attr('pointer-events', 'none');
  [
    [cx * 0.62, cy * 0.88, clusterR * 1.15, 'rgba(255,210,228,0.42)'],
    [cx * 1.38, cy * 0.72, clusterR * 0.95, 'rgba(184,232,204,0.32)'],
    [cx, cy * 1.12, clusterR * 1.25, 'rgba(255,228,168,0.28)'],
  ].forEach(([x, y, r, fill]) => {
    ambientLayer.append('circle').attr('cx', x).attr('cy', y).attr('r', r)
      .attr('fill', fill).attr('filter', 'url(#ambient-blur)');
  });

  const zoomLayer = rootG.append('g').attr('class', 'zoom-layer');

  function pointer(event) {
    return d3.zoomTransform(svg.node()).invert([event.x, event.y]);
  }

  let prevTransform = d3.zoomIdentity;
  let isPanning = false;

  function nudgeNodesOnPan(dx, dy, strength) {
    if (!dx && !dy) return;
    nodes.forEach(d => {
      const drag = 0.04 + (d.size || 12) * 0.0015;
      d.vx = (d.vx || 0) - dx * strength * drag + (Math.random() - 0.5) * strength * 0.35;
      d.vy = (d.vy || 0) - dy * strength * drag + (Math.random() - 0.5) * strength * 0.35;
    });
    simulation.alphaTarget(0.28).restart();
  }

  const zoomBehavior = d3.zoom()
    .scaleExtent([0.25, 6])
    .filter((event) => {
      if (event.type === 'wheel') return true;
      if (event.type.startsWith('touch')) return true;
      if (event.button === 1 || event.button === 2) return true;
      if (event.shiftKey) return true;
      if (event.target.classList && event.target.classList.contains('node-circle')) return false;
      return true;
    })
    .on('start', (event) => {
      isPanning = !!(event.sourceEvent && event.sourceEvent.type === 'mousedown');
      prevTransform = d3.zoomTransform(svg.node());
      if (isPanning) simulation.alphaTarget(0.15).restart();
    })
    .on('zoom', (event) => {
      const k = event.transform.k || 1;
      const dx = (event.transform.x - prevTransform.x) / k;
      const dy = (event.transform.y - prevTransform.y) / k;
      if (isPanning) nudgeNodesOnPan(dx, dy, 1.1);
      zoomLayer.attr('transform', event.transform);
      prevTransform = event.transform;
    })
    .on('end', () => {
      isPanning = false;
      simulation.alphaTarget(0.06);
      setTimeout(() => simulation.alphaTarget(0), 900);
    });

  svg.call(zoomBehavior).on('dblclick.zoom', null);
  svg.on('dblclick', () => {
    svg.transition().duration(650).ease(d3.easeCubicOut)
      .call(zoomBehavior.transform, d3.zoomIdentity);
  });

  const cursor = { active: false, x: cx, y: cy };
  svg.on('mousemove', (event) => {
    [cursor.x, cursor.y] = pointer(event);
    cursor.active = true;
  }).on('mouseleave', () => { cursor.active = false; });

  const zoomControls = d3.select('body').append('div')
    .attr('id', 'zoom-controls')
    .style('position', 'fixed').style('bottom', '30px').style('right', '400px')
    .style('z-index', 20).style('display', 'flex').style('gap', '8px');

  function zoomBtn(label, onClick) {
    zoomControls.append('div')
      .text(label)
      .style('width', '30px').style('height', '30px')
      .style('display', 'flex').style('align-items', 'center').style('justify-content', 'center')
      .style('border-radius', '50%')
      .style('background', 'rgba(255,255,255,0.45)')
      .style('border', '1px solid rgba(92,74,61,0.18)')
      .style('color', BROWN).style('font-size', '14px').style('cursor', 'pointer')
      .style('user-select', 'none')
      .on('click', onClick);
  }
  zoomBtn('+', () => svg.transition().duration(300).call(zoomBehavior.scaleBy, 1.4));
  zoomBtn('–', () => svg.transition().duration(300).call(zoomBehavior.scaleBy, 0.7));
  zoomBtn('⟲', () => svg.transition().duration(500).call(zoomBehavior.transform, d3.zoomIdentity));

  const linkLayer = zoomLayer.append('g');
  const labelLayer = zoomLayer.append('g');
  const nodeLayer = zoomLayer.append('g');

  zoomLayer.insert('rect', ':first-child')
    .attr('class', 'pan-surface')
    .attr('x', -width)
    .attr('y', -height)
    .attr('width', width * 3)
    .attr('height', height * 3)
    .attr('fill', 'transparent')
    .style('pointer-events', 'all');

  const link = linkLayer.selectAll('path')
    .data(links)
    .join('path')
    .attr('fill', 'none')
    .attr('stroke', BROWN_SOFT)
    .attr('stroke-width', 1)
    .attr('filter', 'url(#link-glow)')
    .style('opacity', 0)
    .style('pointer-events', 'none');

  const labels = labelLayer.selectAll('text')
    .data(nodes)
    .join('text')
    .text(d => d.label)
    .attr('font-size', d => Math.max(8, Math.min(d.size * 0.38, 11)))
    .attr('class', 'node-label-soft')
    .attr('fill', BROWN)
    .attr('font-weight', 500)
    .attr('text-anchor', 'middle')
    .attr('dy', d => d.size + 14)
    .attr('pointer-events', 'none')
    .style('opacity', 0)
    .style('transition', 'opacity 0.45s ease');

  const node = nodeLayer.selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('class', 'node-circle')
    .attr('r', d => d.size)
    .attr('fill', d => `url(#${gradLookup[d.id]})`)
    .attr('fill-opacity', 0.88)
    .attr('stroke', d => d.bubbleCombo[1])
    .attr('stroke-opacity', 0.45)
    .attr('stroke-width', d => Math.max(1, d.size * 0.05))
    .style('opacity', 0)
    .style('cursor', 'grab')
    .style('transition', 'opacity 0.45s ease')
    .call(drag());

  const studioRipple = nodeLayer.append('circle')
    .attr('class', 'studio-ripple')
    .attr('fill', 'none')
    .attr('stroke', 'rgba(232,120,154,0.4)')
    .attr('stroke-width', 1.5)
    .attr('pointer-events', 'none')
    .style('opacity', 0);

  const ring = labelLayer.selectAll('circle.ring')
    .data(nodes)
    .join('circle')
    .attr('class', 'ring')
    .attr('r', d => d.size + 4)
    .attr('fill', 'none')
    .attr('stroke', 'rgba(92,74,61,0)')
    .attr('stroke-width', 2)
    .attr('pointer-events', 'none');

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id)
      .distance(d => 28 + ((d.source.size || 10) + (d.target.size || 10)) * 0.55)
      .strength(0.82))
    .force('charge', d3.forceManyBody().strength(-55))
    .force('center', d3.forceCenter(cx, cy).strength(0.12))
    .force('collision', d3.forceCollide().radius(d => d.size * 0.9).strength(0.92))
    .velocityDecay(0.32)
    .alphaMin(0.002)
    .alphaDecay(0.018)
    .on('tick', ticked);

  function containInCluster(d) {
    if (d.fx != null && d.fy != null) return;
    const dx = d.x - cx, dy = d.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > clusterR) {
      const s = clusterR / dist;
      d.x = cx + dx * s;
      d.y = cy + dy * s;
    }
  }

  function linkPath(d, i) {
    const sx = d.source.x, sy = d.source.y;
    const tx = d.target.x, ty = d.target.y;
    const dx = tx - sx, dy = ty - sy;
    const dist = Math.hypot(dx, dy) || 1;
    const bend = Math.min(dist * 0.2, 36) * (i % 2 === 0 ? 1 : -1);
    const mx = (sx + tx) / 2 + (-dy / dist) * bend;
    const my = (sy + ty) / 2 + (dx / dist) * bend;
    return `M${sx},${sy} Q${mx},${my} ${tx},${ty}`;
  }

  function applyCursorForce() {
    if (!cursor.active || hoveredNode) return;
    nodes.forEach(d => {
      if (d._hovered) return;
      const dx = d.x - cursor.x, dy = d.y - cursor.y;
      const dist = Math.hypot(dx, dy) || 1;
      const reach = 85 + d.size * 1.2;
      if (dist < reach) {
        const f = ((reach - dist) / reach) * 2.2;
        d.vx += (dx / dist) * f;
        d.vy += (dy / dist) * f;
      }
    });
  }

  let hasRevealed = false;
  let hoveredNode = null;

  function pinNode(n) {
    n.fx = n.x;
    n.fy = n.y;
    n.vx = 0;
    n.vy = 0;
  }

  function unpinNode(n) {
    if (!n._dragging) {
      n.fx = null;
      n.fy = null;
    }
  }

  function ticked() {
    applyCursorForce();
    nodes.forEach(containInCluster);
    link.attr('d', linkPath);
    node.attr('cx', d => d.x).attr('cy', d => d.y);
    ring.attr('cx', d => d.x).attr('cy', d => d.y);
    labels.attr('x', d => d.x).attr('y', d => d.y);
    const studio = nodes.find(n => n.id === 'studio');
    if (studio) {
      studioRipple.attr('cx', studio.x).attr('cy', studio.y);
    }
    if (!hasRevealed && simulation.alpha() < 0.08) {
      hasRevealed = true;
      node.transition().duration(900).delay((d, i) => i * 10).style('opacity', 1);
      labels.transition().duration(900).delay((d, i) => i * 10)
        .style('opacity', d => d.size > 18 ? 0.82 : 0.5);
      link.transition().duration(1100).style('opacity', 0.45);
      studioRipple.transition().duration(1200).style('opacity', 1);
    }
  }

  d3.timer((elapsed) => {
    simulation.force('center', d3.forceCenter(
      cx + Math.sin(elapsed * 0.00028) * 10,
      cy + Math.cos(elapsed * 0.00022) * 8
    ).strength(0.12));

    nodes.forEach(d => {
      if (d._pulseOffset === undefined) d._pulseOffset = Math.random() * 1000;
      d._pulse = 1 + Math.sin((elapsed + d._pulseOffset) * 0.0007) * 0.05;
    });
    node.each(function (d) {
      if (d._hovered) return;
      d3.select(this).attr('r', d.size * d._pulse);
    });
    ring.each(function (d) {
      if (d._hovered) return;
      d3.select(this).attr('r', d.size * d._pulse + 4);
    });

    const studio = nodes.find(n => n.id === 'studio');
    if (studio && hasRevealed) {
      const ripple = 1 + Math.sin(elapsed * 0.0018) * 0.14;
      studioRipple
        .attr('r', studio.size * ripple + 18)
        .attr('stroke-opacity', 0.22 + Math.sin(elapsed * 0.0018) * 0.18);
    }
  });

  function drag() {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.2).restart();
      d._dragging = true;
      const [x, y] = pointer(event);
      d.fx = x; d.fy = y;
      d3.select(this).style('cursor', 'grabbing');
    }
    function dragged(event, d) {
      const [x, y] = pointer(event);
      d.fx = x; d.fy = y;
    }
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d._dragging = false;
      d.fx = null; d.fy = null;
      d3.select(this).style('cursor', 'grab');
    }
    return d3.drag()
      .container(svg.node())
      .on('start', dragstarted).on('drag', dragged).on('end', dragended);
  }

  const neighborMap = {};
  const linkMap = {};
  const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]));
  links.forEach(l => {
    const s = typeof l.source === 'object' ? l.source.id : l.source;
    const t = typeof l.target === 'object' ? l.target.id : l.target;
    (neighborMap[s] ||= new Set()).add(t);
    (neighborMap[t] ||= new Set()).add(s);
    (linkMap[s] ||= []).push({ id: t, rel: l.relationship });
    (linkMap[t] ||= []).push({ id: s, rel: l.relationship });
  });

  const DIM = 0.22;
  const MID = 0.45;

  node.on('mouseover', function (event, d) {
      d._hovered = true;
      hoveredNode = d;
      pinNode(d);
      simulation.alphaTarget(0.02);

      const neighbors = neighborMap[d.id] || new Set();
      node
        .style('opacity', n => n.id === d.id || neighbors.has(n.id) ? 1 : DIM)
        .attr('filter', n => n.id === d.id ? 'url(#water-glow)' : null)
        .attr('fill-opacity', n => n.id === d.id ? 0.95 : 0.88)
        .transition().duration(400).ease(d3.easeCubicOut)
        .attr('r', n => n.id === d.id ? n.size * 1.12 : n.size * (n._pulse || 1));
      labels.style('opacity', n => (n.id === d.id || neighbors.has(n.id)) ? 0.95 : MID);
      link
        .attr('class', l => {
          const s = typeof l.source === 'object' ? l.source.id : l.source;
          const t = typeof l.target === 'object' ? l.target.id : l.target;
          return (s === d.id || t === d.id) ? 'link-flow' : null;
        })
        .attr('stroke-width', l => {
          const s = typeof l.source === 'object' ? l.source.id : l.source;
          const t = typeof l.target === 'object' ? l.target.id : l.target;
          return (s === d.id || t === d.id) ? 1.6 : 1;
        })
        .style('opacity', l => {
          const s = typeof l.source === 'object' ? l.source.id : l.source;
          const t = typeof l.target === 'object' ? l.target.id : l.target;
          return (s === d.id || t === d.id) ? 0.72 : 0.14;
        });
      ring
        .attr('stroke', n => n.id === d.id ? 'rgba(92,74,61,0.55)' : 'rgba(92,74,61,0)')
        .transition().duration(400)
        .attr('r', n => n.id === d.id ? n.size * 1.16 + 6 : n.size + 4);
      showPanel(d);
    })
    .on('mouseout', function (event, d) {
      d._hovered = false;
      hoveredNode = null;
      unpinNode(d);
      simulation.alphaTarget(0.06);
      setTimeout(() => simulation.alphaTarget(0), 500);
      node
        .attr('filter', null)
        .attr('fill-opacity', 0.88)
        .transition().duration(500).ease(d3.easeCubicOut)
        .attr('r', n => n.size * (n._pulse || 1));
      resetVisualOpacity();
      ring.attr('stroke', 'rgba(92,74,61,0)').attr('r', n => n.size + 4);
      hidePanel();
    })
    .on('click', (event, d) => {
      event.stopPropagation();
      focusOn(d);
    });

  function resetVisualOpacity() {
    node.style('opacity', 1);
    labels.style('opacity', d => d.size > 18 ? 0.82 : 0.5);
    link.attr('class', null).attr('stroke-width', 1).style('opacity', 0.45);
  }

  svg.on('click', () => {
    nodes.forEach(n => {
      n._hovered = false;
      unpinNode(n);
    });
    hoveredNode = null;
    node.attr('filter', null);
    resetVisualOpacity();
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
  const panelConnections = document.getElementById('panel-connections');

  function showPanel(d) {
    panelLabel.textContent = d.label;
    panelCategory.textContent = d.category;
    panelDesc.textContent = d.description;
    const conns = (linkMap[d.id] || []).slice(0, 6);
    panelConnections.innerHTML = conns.map(c =>
      `<span>${c.rel} · ${nodeById[c.id]?.label || c.id}</span>`
    ).join('');
    panel.classList.add('visible');
  }
  function hidePanel() { panel.classList.remove('visible'); }

  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      resetVisualOpacity();
      return;
    }
    const match = nodes.find(n => n.label.toLowerCase().includes(q));
    node.style('opacity', n => n.label.toLowerCase().includes(q) ? 1 : DIM);
    labels.style('opacity', n => n.label.toLowerCase().includes(q) ? 0.95 : MID);
    link.attr('class', null).attr('stroke-width', 1).style('opacity', 0.25);
    if (match) focusOn(match);
  });

  window.addEventListener('resize', () => location.reload());
})();
