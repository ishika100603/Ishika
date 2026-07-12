(function() {
    const margin = { top: 40, right: 40, bottom: 60, left: 160 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
  
    const svg = d3.select('#d3-container-1')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
  
    d3.csv('synthetic-data.csv').then(function(data) {
      data.forEach(d => {
        d.start = +d.start;
        d.end = +d.end;
      });
  
      const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.start), d3.max(data, d => d.end)])
        .range([0, width]);
  
      const yScale = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, height])
        .padding(0.3);
  
      const colorScale = d3.scaleOrdinal()
        .domain(['Modern', 'Avant-garde', 'Experimental', 'Contemporary'])
        .range(['#6b9cff', '#ff6b6b', '#ffcc66', '#9edb8d']);
  
      const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
      svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis)
        .selectAll('text')
        .style('fill', '#ccc');
  
      svg.append('g')
        .call(d3.axisLeft(yScale))
        .selectAll('text')
        .style('fill', '#eee')
        .style('font-size', '11px');
  
      svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.start))
        .attr('y', d => yScale(d.name))
        .attr('width', d => xScale(d.end) - xScale(d.start))
        .attr('height', yScale.bandwidth())
        .attr('fill', d => colorScale(d.category))
        .attr('rx', 4)
        .style('opacity', 0.85)
        .on('mouseover', function(event, d) {
          d3.select(this).style('opacity', 1);
          tooltip.transition().duration(150).style('opacity', 1);
          tooltip.html(`<strong>${d.name}</strong><br>${d.start}–${d.end}<br>${d.category}`)
            .style('left', (event.pageX + 12) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function() {
          d3.select(this).style('opacity', 0.85);
          tooltip.transition().duration(150).style('opacity', 0);
        });
  
      const tooltip = d3.select('#d3-container-1')
        .append('div')
        .style('position', 'absolute')
        .style('background', 'rgba(0,0,0,0.9)')
        .style('color', '#fff')
        .style('padding', '8px 12px')
        .style('border-radius', '6px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('opacity', 0);
  
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', -15)
        .attr('text-anchor', 'middle')
        .style('fill', '#eee')
        .style('font-size', '14px')
        .text('Timeline of Art Movements');
    });
  })();