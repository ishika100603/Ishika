(function () {
  const MONTHS = [
    { label: 'JAN', image: 'january.jpeg' },
    { label: 'FEB', image: 'february.jpeg' },
    { label: 'MAR', image: 'march.jpeg' },
    { label: 'APR', image: 'april.jpeg' },
    { label: 'MAY', image: 'may.jpeg' },
    { label: 'JUN', image: 'june.jpeg' },
    { label: 'JUL', image: 'july.jpeg' },
    { label: 'AUG', image: 'august.jpeg' },
    { label: 'SEP', image: 'september.jpeg' },
    { label: 'OCT', image: 'october.jpeg' },
    { label: 'NOV', image: 'november.jpeg' },
    { label: 'DEC', image: 'december.jpeg' },
  ];

  const container = document.getElementById('months-container');
  const width = window.innerWidth;
  const height = window.innerHeight;
  const cx = width * 0.46;
  const cy = height * 0.52;

  const RADIUS = Math.min(height * 0.36, 320);
  const ROW_ANGLE = 0.42;
  const BASE_HALF_WIDTH = Math.min(width * 0.28, 360);
  const DEPTH_OFFSET = 18;
  const MAX_SCROLL = MONTHS.length - 1;

  let targetScroll = 0;
  let currentScroll = 0;

  const svg = d3.select('#months-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const defs = svg.append('defs');

  defs.append('pattern')
    .attr('id', 'grain')
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 4)
    .attr('height', 4)
    .append('rect')
    .attr('width', 4)
    .attr('height', 4)
    .attr('fill', '#d8d8d6');

  defs.append('filter')
    .attr('id', 'soft-shadow')
    .append('feDropShadow')
    .attr('dx', 0)
    .attr('dy', 2)
    .attr('stdDeviation', 4)
    .attr('flood-opacity', 0.18);

  svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'url(#grain)');

  const gridLayer = svg.append('g').attr('class', 'grid-layer');
  const cardsLayer = svg.append('g').attr('class', 'cards-layer');
  const labelsLayer = svg.append('g').attr('class', 'labels-layer');

  function layoutMonth(index, scroll) {
    const rel = index - scroll;
    const angle = rel * ROW_ANGLE;
    const y = cy + Math.sin(angle) * RADIUS;
    const depth = Math.cos(angle);
    const scale = 0.28 + 0.72 * Math.max(0, depth);
    const halfWidth = BASE_HALF_WIDTH * scale;
    const backY = y - DEPTH_OFFSET * scale;
    const backHalfWidth = halfWidth * 0.7;
    const opacity = depth < -0.15 ? 0.12 : 0.2 + 0.8 * Math.max(0, (depth + 0.15) / 1.15);

    return {
      index,
      label: MONTHS[index].label,
      y,
      backY,
      halfWidth,
      backHalfWidth,
      depth,
      scale,
      opacity,
      rel,
    };
  }

  function drawGrid(layouts) {
    gridLayer.selectAll('*').remove();

    const visible = layouts.filter(d => Math.abs(d.rel) < 6.5);
    if (!visible.length) return;

    const leftFront = visible.map(d => [cx - d.halfWidth, d.y]);
    const leftBack = visible.map(d => [cx - d.backHalfWidth, d.backY]);
    const rightFront = visible.map(d => [cx + d.halfWidth, d.y]);
    const rightBack = visible.map(d => [cx + d.backHalfWidth, d.backY]);

    const spine = (points) => d3.line().curve(d3.curveCatmullRom.alpha(0.5))(points);

    gridLayer.append('path')
      .attr('d', spine(leftFront))
      .attr('fill', 'none')
      .attr('stroke', '#111')
      .attr('stroke-width', 1.1);

    gridLayer.append('path')
      .attr('d', spine(leftBack))
      .attr('fill', 'none')
      .attr('stroke', '#111')
      .attr('stroke-width', 1.1);

    gridLayer.append('path')
      .attr('d', spine(rightFront))
      .attr('fill', 'none')
      .attr('stroke', '#111')
      .attr('stroke-width', 1.1);

    gridLayer.append('path')
      .attr('d', spine(rightBack))
      .attr('fill', 'none')
      .attr('stroke', '#111')
      .attr('stroke-width', 1.1);

    visible.forEach(d => {
      const g = gridLayer.append('g').attr('opacity', d.opacity);

      g.append('line')
        .attr('x1', cx - d.halfWidth)
        .attr('y1', d.y)
        .attr('x2', cx + d.halfWidth)
        .attr('y2', d.y)
        .attr('stroke', '#111')
        .attr('stroke-width', 1.1);

      g.append('line')
        .attr('x1', cx - d.backHalfWidth)
        .attr('y1', d.backY)
        .attr('x2', cx + d.backHalfWidth)
        .attr('y2', d.backY)
        .attr('stroke', '#111')
        .attr('stroke-width', 1.1);

      const corners = [
        [cx - d.halfWidth, d.y],
        [cx + d.halfWidth, d.y],
        [cx + d.backHalfWidth, d.backY],
        [cx - d.backHalfWidth, d.backY],
      ];

      corners.forEach(([x, y], i) => {
        const next = corners[(i + 1) % 4];
        g.append('line')
          .attr('x1', x)
          .attr('y1', y)
          .attr('x2', next[0])
          .attr('y2', next[1])
          .attr('stroke', '#111')
          .attr('stroke-width', 1.1);
      });

      corners.forEach(([x, y]) => {
        g.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 3.2)
          .attr('fill', '#111');
      });
    });
  }

  function drawCards(layouts) {
    cardsLayer.selectAll('*').remove();

    const sorted = layouts
      .filter(d => Math.abs(d.rel) < 5.5)
      .sort((a, b) => a.depth - b.depth);

    sorted.forEach(d => {
      const month = MONTHS[d.index];
      const cardWidth = 70 + 150 * Math.max(0, d.depth);
      const cardHeight = 90 + 240 * Math.max(0, d.depth);
      const x = cx - cardWidth / 2;
      const y = d.y - cardHeight / 2;
      const cardOpacity = d.depth < -0.1 ? 0.08 : 0.25 + 0.75 * Math.max(0, (d.depth + 0.1) / 1.1);

      const g = cardsLayer.append('g')
        .attr('opacity', cardOpacity)
        .attr('filter', d.depth > 0.55 ? 'url(#soft-shadow)' : null);

      if (!month.image) {
        g.append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', cardWidth)
          .attr('height', cardHeight)
          .attr('fill', month.color || '#aaa')
          .attr('stroke', 'none');
      }

      if (month.image) {
        g.append('image')
          .attr('href', month.image)
          .attr('x', x)
          .attr('y', y)
          .attr('width', cardWidth)
          .attr('height', cardHeight)
          .attr('preserveAspectRatio', 'xMidYMid meet');
      } else {
        g.append('text')
          .attr('x', cx)
          .attr('y', d.y + 5)
          .attr('text-anchor', 'middle')
          .attr('fill', 'rgba(0,0,0,0.35)')
          .attr('font-size', 11)
          .attr('letter-spacing', 2)
          .text(month.label);
      }
    });
  }

  function drawLabels(layouts) {
    labelsLayer.selectAll('*').remove();

    layouts
      .filter(d => Math.abs(d.rel) < 6.5)
      .forEach(d => {
        labelsLayer.append('text')
          .attr('x', cx + d.halfWidth + 42)
          .attr('y', d.y + 4)
          .attr('fill', '#111')
          .attr('font-size', 13)
          .attr('letter-spacing', 3)
          .attr('opacity', d.opacity)
          .text(d.label);
      });
  }

  function render(scroll) {
    const layouts = MONTHS.map((_, i) => layoutMonth(i, scroll));
    drawGrid(layouts);
    drawCards(layouts);
    drawLabels(layouts);
  }

  container.addEventListener('wheel', (event) => {
    event.preventDefault();
    targetScroll = Math.max(0, Math.min(MAX_SCROLL, targetScroll + event.deltaY * 0.004));
  }, { passive: false });

  let dragging = false;
  let dragStartY = 0;
  let dragStartScroll = 0;

  container.addEventListener('mousedown', (event) => {
    dragging = true;
    dragStartY = event.clientY;
    dragStartScroll = targetScroll;
  });

  window.addEventListener('mousemove', (event) => {
    if (!dragging) return;
    const delta = (event.clientY - dragStartY) * 0.008;
    targetScroll = Math.max(0, Math.min(MAX_SCROLL, dragStartScroll + delta));
  });

  window.addEventListener('mouseup', () => { dragging = false; });

  window.addEventListener('resize', () => {
    location.reload();
  });

  function animate() {
    currentScroll += (targetScroll - currentScroll) * 0.1;
    render(currentScroll);
    requestAnimationFrame(animate);
  }

  animate();
})();