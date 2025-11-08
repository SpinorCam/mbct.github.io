(function () {
  function initNetwork() {
    const container = document.getElementById('neuron-network');
    if (!container || typeof d3 === 'undefined') {
      return null;
    }

    const parent = container.parentElement;
    const bounds = container.getBoundingClientRect();
    let width = Math.max(bounds.width || parent.clientWidth || 720, 480);
    let height = Math.max(bounds.height || parent.clientHeight || 520, 360);

    const svg = d3
      .select(container)
      .style('touch-action', 'none')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    svg.selectAll('*').remove();

    const defs = svg.append('defs');

    const createGradient = (id, stops) => {
      const gradient = defs
        .append('radialGradient')
        .attr('id', id)
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '65%');

      stops.forEach((stop) => {
        gradient
          .append('stop')
          .attr('offset', stop.offset)
          .attr('stop-color', stop.color)
          .attr('stop-opacity', stop.opacity ?? 1);
      });
    };

    createGradient('hubGradient', [
      { offset: '0%', color: '#ffe9ff', opacity: 0.95 },
      { offset: '55%', color: '#94b8ff', opacity: 0.95 },
      { offset: '100%', color: '#2b3f90', opacity: 1 }
    ]);

    createGradient('sectionGradient', [
      { offset: '0%', color: '#ffe9d1', opacity: 0.95 },
      { offset: '50%', color: '#ffb3f4', opacity: 0.9 },
      { offset: '100%', color: '#5f63d6', opacity: 1 }
    ]);

    createGradient('supportGradient', [
      { offset: '0%', color: '#d9f6ff', opacity: 0.95 },
      { offset: '55%', color: '#8ccfff', opacity: 0.85 },
      { offset: '100%', color: '#1f4fb1', opacity: 1 }
    ]);

    const nodes = [
      {
        id: 'hub',
        lines: ['MBCT', 'Hub'],
        radius: 58,
        type: 'hub'
      },
      {
        id: 'about',
        lines: ['Neuron', 'Origins'],
        radius: 32,
        type: 'section',
        target: '#about'
      },
      {
        id: 'bios',
        lines: ['Trainee', 'Cortex'],
        radius: 30,
        type: 'section',
        target: '#bios'
      },
      {
        id: 'lectures',
        lines: ['Learning', 'Circuits'],
        radius: 30,
        type: 'section',
        target: '#lectures'
      },
      {
        id: 'interviews',
        lines: ['Voices', '& Stories'],
        radius: 28,
        type: 'section',
        target: '#interviews'
      },
      {
        id: 'applications',
        lines: ['Opportunity', 'Signals'],
        radius: 30,
        type: 'section',
        target: '#applications'
      },
      {
        id: 'resources',
        lines: ['Resource', 'Synapses'],
        radius: 28,
        type: 'section',
        target: '#resources'
      },
      {
        id: 'glia',
        lines: ['Glial', 'Bridge'],
        radius: 18,
        type: 'support'
      },
      {
        id: 'cortical-loop',
        lines: ['Cortical', 'Loop'],
        radius: 19,
        type: 'support'
      },
      {
        id: 'synapse-bloom',
        lines: ['Synapse', 'Bloom'],
        radius: 17,
        type: 'support'
      },
      {
        id: 'neurotech',
        lines: ['Neurotech', 'Playground'],
        radius: 19,
        type: 'support'
      },
      {
        id: 'community',
        lines: ['Community', 'Pulse'],
        radius: 20,
        type: 'support'
      },
      {
        id: 'creative-lab',
        lines: ['Creative', 'Lab'],
        radius: 18,
        type: 'support'
      }
    ];

    const links = [
      { source: 'hub', target: 'about', strength: 1.05, distance: 150 },
      { source: 'hub', target: 'bios', strength: 1.05, distance: 150 },
      { source: 'hub', target: 'lectures', strength: 1.05, distance: 155 },
      { source: 'hub', target: 'interviews', strength: 1.05, distance: 155 },
      { source: 'hub', target: 'applications', strength: 1.05, distance: 155 },
      { source: 'hub', target: 'resources', strength: 1.05, distance: 160 },
      { source: 'about', target: 'glia', strength: 0.5, distance: 120 },
      { source: 'bios', target: 'community', strength: 0.55, distance: 130 },
      { source: 'lectures', target: 'cortical-loop', strength: 0.52, distance: 140 },
      { source: 'interviews', target: 'synapse-bloom', strength: 0.48, distance: 125 },
      { source: 'applications', target: 'neurotech', strength: 0.48, distance: 135 },
      { source: 'resources', target: 'creative-lab', strength: 0.5, distance: 130 },
      { source: 'community', target: 'glia', strength: 0.32, distance: 150 },
      { source: 'cortical-loop', target: 'synapse-bloom', strength: 0.28, distance: 150 },
      { source: 'neurotech', target: 'creative-lab', strength: 0.3, distance: 145 },
      { source: 'resources', target: 'about', strength: 0.22, distance: 210 },
      { source: 'bios', target: 'lectures', strength: 0.3, distance: 210 },
      { source: 'interviews', target: 'applications', strength: 0.28, distance: 200 }
    ];

    const pulseGroup = svg.append('g').attr('class', 'pulses');
    const linkGroup = svg.append('g').attr('class', 'links');
    const nodeGroup = svg.append('g').attr('class', 'nodes');

    const center = { x: width / 2, y: height / 2 };

    const pulses = pulseGroup
      .selectAll('circle')
      .data([height * 0.22, height * 0.34, height * 0.46])
      .join('circle')
      .attr('class', 'pulse')
      .attr('cx', center.x)
      .attr('cy', center.y)
      .attr('r', (d) => d);

    const link = linkGroup
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', 'link');

    const nodesSelection = nodeGroup
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', (d) => {
        const base = `node ${d.type}-node`;
        return d.target ? `${base} interactive` : base;
      })
      .attr('role', (d) => (d.target ? 'link' : null))
      .attr('tabindex', (d) => (d.target ? 0 : null))
      .attr('aria-label', (d) => {
        if (d.target) {
          return `${d.lines.join(' ')} section navigation`;
        }
        return `${d.lines.join(' ')} connector`;
      });

    nodesSelection
      .append('circle')
      .attr('r', (d) => d.radius);

    nodesSelection
      .filter((d) => Array.isArray(d.lines) && d.lines.length)
      .append('text')
      .selectAll('tspan')
      .data((d) => d.lines.map((line, index, arr) => ({ line, index, total: arr.length })))
      .join('tspan')
      .attr('x', 0)
      .attr('dy', (d) => (d.index === 0 ? `${-((d.total - 1) * 0.6)}em` : '1.2em'))
      .text((d) => d.line);

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance((d) => d.distance)
          .strength((d) => d.strength)
      )
      .force(
        'charge',
        d3.forceManyBody().strength((d) => (d.type === 'hub' ? -420 : -260))
      )
      .force('center', d3.forceCenter(center.x, center.y))
      .force('collision', d3.forceCollide().radius((d) => d.radius + 12))
      .force(
        'radial',
        d3.forceRadial((d) => (d.type === 'hub' ? 0 : height * 0.35), center.x, center.y).strength((d) =>
          d.type === 'hub' ? 0.08 : 0.045
        )
      )
      .alpha(1)
      .on('tick', ticked);

    function ticked() {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      nodesSelection.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
    }

    const dragStarted = (event, d) => {
      if (!event.active) {
        simulation.alphaTarget(0.3).restart();
      }
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    };

    const dragEnded = (event, d) => {
      if (!event.active) {
        simulation.alphaTarget(0);
      }
      if (d.type !== 'hub') {
        d.fx = null;
        d.fy = null;
      }
    };

    nodesSelection.call(
      d3.drag().on('start', dragStarted).on('drag', dragged).on('end', dragEnded)
    );

    const highlightLinks = (node) => {
      nodesSelection.classed('is-active', (d) => d === node);
      link.classed('is-highlighted', (l) => l.source === node || l.target === node);
    };

    nodesSelection
      .on('mouseover', (event, d) => {
        highlightLinks(d);
      })
      .on('focus', (event, d) => {
        highlightLinks(d);
      })
      .on('mouseout', () => {
        nodesSelection.classed('is-active', false);
        link.classed('is-highlighted', false);
      })
      .on('blur', () => {
        nodesSelection.classed('is-active', false);
        link.classed('is-highlighted', false);
      })
      .on('click', (event, d) => {
        if (d.target) {
          event.preventDefault();
          const destination = document.querySelector(d.target);
          if (destination) {
            destination.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      })
      .on('keydown', (event, d) => {
        if (!d.target) {
          return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          const destination = document.querySelector(d.target);
          if (destination) {
            destination.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(rect.width || parent.clientWidth || width, 480);
      height = Math.max(rect.height || parent.clientHeight || height, 340);
      svg.attr('viewBox', `0 0 ${width} ${height}`);
      const cx = width / 2;
      const cy = height / 2;

      pulses
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', (d, i) => [height * 0.24, height * 0.36, height * 0.48][i]);

      simulation.force('center', d3.forceCenter(cx, cy));
      simulation.force(
        'radial',
        d3.forceRadial((d) => (d.type === 'hub' ? 0 : height * 0.35), cx, cy).strength((d) =>
          d.type === 'hub' ? 0.08 : 0.045
        )
      );
      simulation.alpha(0.6).restart();
    };

    return { resize };
  }

  function boot() {
    const network = initNetwork();
    if (!network) {
      return;
    }

    window.addEventListener('resize', () => {
      network.resize();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
