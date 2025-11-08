(function () {
  const AMBIENT_MIN_DELAY = 1200;
  const AMBIENT_MAX_DELAY = 2400;
  const MAX_CASCADE_DEPTH = 3;

  function initNetwork() {
    const container = document.getElementById('neuron-network');
    if (!container || typeof d3 === 'undefined') {
      return null;
    }

    const parent = container.parentElement;
    const svg = d3
      .select(container)
      .style('touch-action', 'manipulation')
      .attr('preserveAspectRatio', 'xMidYMid meet');

    svg.selectAll('*').remove();

    const defs = svg.append('defs');

    const createGradient = (id, stops, attrs = {}) => {
      const gradient = defs.append('radialGradient').attr('id', id);
      Object.entries(attrs).forEach(([key, value]) => gradient.attr(key, value));
      stops.forEach((stop) => {
        gradient
          .append('stop')
          .attr('offset', stop.offset)
          .attr('stop-color', stop.color)
          .attr('stop-opacity', stop.opacity ?? 1);
      });
    };

    createGradient('hubGradient', [
      { offset: '0%', color: '#f9f3ff', opacity: 1 },
      { offset: '52%', color: '#bfc6ff', opacity: 0.95 },
      { offset: '100%', color: '#3b4db4', opacity: 1 }
    ]);

    createGradient('sectionGradient', [
      { offset: '0%', color: '#fff3e6', opacity: 1 },
      { offset: '55%', color: '#ffc7f6', opacity: 0.95 },
      { offset: '100%', color: '#6158dd', opacity: 1 }
    ]);

    createGradient('supportGradient', [
      { offset: '0%', color: '#daf6ff', opacity: 0.95 },
      { offset: '60%', color: '#8fcaff', opacity: 0.9 },
      { offset: '100%', color: '#1f4fb1', opacity: 1 }
    ]);

    createGradient(
      'axonGlow',
      [
        { offset: '0%', color: 'rgba(94, 196, 255, 0.65)' },
        { offset: '50%', color: 'rgba(128, 108, 255, 0.2)' },
        { offset: '100%', color: 'rgba(12, 24, 62, 0)' }
      ],
      { fx: '50%', fy: '45%', r: '72%' }
    );

    const nodes = [
      { id: 'hub', lines: ['MBCT', 'Hub'], radius: 78, type: 'hub' },
      { id: 'about', lines: ['Neuron', 'Origins'], radius: 38, type: 'section', target: '#about', angle: -90, orbit: 0.92 },
      { id: 'bios', lines: ['Trainee', 'Cortex'], radius: 36, type: 'section', target: '#bios', angle: -28, orbit: 1.04 },
      { id: 'lectures', lines: ['Learning', 'Circuits'], radius: 36, type: 'section', target: '#lectures', angle: 18, orbit: 1.02 },
      {
        id: 'interviews',
        lines: ['Voices', '& Stories'],
        radius: 34,
        type: 'section',
        target: '#interviews',
        angle: 102,
        orbit: 1.08
      },
      {
        id: 'applications',
        lines: ['Opportunity', 'Signals'],
        radius: 36,
        type: 'section',
        target: '#applications',
        angle: 154,
        orbit: 1.04
      },
      {
        id: 'resources',
        lines: ['Resource', 'Synapses'],
        radius: 34,
        type: 'section',
        target: '#resources',
        angle: -150,
        orbit: 1.1
      },
      { id: 'glia', lines: ['Glial', 'Bridge'], radius: 22, type: 'support', angle: -118, orbit: 1.45 },
      { id: 'cortical-loop', lines: ['Cortical', 'Loop'], radius: 22, type: 'support', angle: -5, orbit: 1.48 },
      { id: 'synapse-bloom', lines: ['Synapse', 'Bloom'], radius: 20, type: 'support', angle: 118, orbit: 1.42 },
      { id: 'neurotech', lines: ['Neurotech', 'Playground'], radius: 22, type: 'support', angle: 52, orbit: 1.52 },
      { id: 'community', lines: ['Community', 'Pulse'], radius: 24, type: 'support', angle: -62, orbit: 1.36 },
      { id: 'creative-lab', lines: ['Creative', 'Lab'], radius: 22, type: 'support', angle: 178, orbit: 1.48 }
    ];

    const links = [
      { id: 'hub-about', source: 'hub', target: 'about' },
      { id: 'hub-bios', source: 'hub', target: 'bios' },
      { id: 'hub-lectures', source: 'hub', target: 'lectures' },
      { id: 'hub-interviews', source: 'hub', target: 'interviews' },
      { id: 'hub-applications', source: 'hub', target: 'applications' },
      { id: 'hub-resources', source: 'hub', target: 'resources' },
      { id: 'about-resources', source: 'about', target: 'resources' },
      { id: 'about-glia', source: 'about', target: 'glia' },
      { id: 'bios-community', source: 'bios', target: 'community' },
      { id: 'bios-cortical-loop', source: 'bios', target: 'cortical-loop' },
      { id: 'lectures-cortical-loop', source: 'lectures', target: 'cortical-loop' },
      { id: 'lectures-neurotech', source: 'lectures', target: 'neurotech' },
      { id: 'interviews-synapse', source: 'interviews', target: 'synapse-bloom' },
      { id: 'applications-neurotech', source: 'applications', target: 'neurotech' },
      { id: 'resources-creative', source: 'resources', target: 'creative-lab' },
      { id: 'creative-glia', source: 'creative-lab', target: 'glia' },
      { id: 'community-glia', source: 'community', target: 'glia' },
      { id: 'community-neurotech', source: 'community', target: 'neurotech' },
      { id: 'synapse-creative', source: 'synapse-bloom', target: 'creative-lab' }
    ];

    const adjacency = new Map();
    links.forEach((link) => {
      if (!adjacency.has(link.source)) {
        adjacency.set(link.source, []);
      }
      if (!adjacency.has(link.target)) {
        adjacency.set(link.target, []);
      }
      adjacency.get(link.source).push(link.target);
      adjacency.get(link.target).push(link.source);
    });

    const backgroundGroup = svg.append('g').attr('class', 'background');
    const pulseGroup = backgroundGroup.append('g').attr('class', 'pulses');
    const brainGroup = backgroundGroup.append('g').attr('class', 'brain-core');

    const linkGroup = svg.append('g').attr('class', 'links');
    const signalGroup = svg.append('g').attr('class', 'signals');
    const nodeGroup = svg.append('g').attr('class', 'nodes');

    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const nodeSelectionById = new Map();
    const linkSelectionByKey = new Map();
    const linkByKey = new Map();

    let width = 1024;
    let height = 640;
    let center = { x: width / 2, y: height / 2 };
    let brainImage;
    let ambientTimeout = null;
    const cascadeTimeouts = [];
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const pulses = pulseGroup
      .selectAll('circle')
      .data([1, 0.72, 0.46])
      .join('circle')
      .attr('class', 'pulse');

    brainGroup
      .append('circle')
      .attr('class', 'brain-halo')
      .attr('fill', 'url(#axonGlow)');

    brainImage = brainGroup
      .append('image')
      .attr('href', '/img/brain-aurora.svg')
      .attr('class', 'brain-image')
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const linkSelection = linkGroup
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', 'link')
      .each(function (d) {
        const keyForward = `${d.source}-${d.target}`;
        const keyReverse = `${d.target}-${d.source}`;
        linkSelectionByKey.set(keyForward, d3.select(this));
        linkSelectionByKey.set(keyReverse, d3.select(this));
        linkByKey.set(keyForward, d);
        linkByKey.set(keyReverse, { id: d.id, source: d.target, target: d.source });
      });

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
      .attr('aria-label', (d) => (d.target ? `${d.lines.join(' ')} section navigation` : `${d.lines.join(' ')} connector`))
      .each(function (d) {
        nodeSelectionById.set(d.id, d3.select(this));
      });

    nodesSelection.append('circle').attr('r', (d) => d.radius);

    nodesSelection
      .filter((d) => Array.isArray(d.lines) && d.lines.length)
      .append('text')
      .selectAll('tspan')
      .data((d) => d.lines.map((line, index, arr) => ({ line, index, total: arr.length })))
      .join('tspan')
      .attr('x', 0)
      .attr('dy', (d) => (d.index === 0 ? `${-((d.total - 1) * 0.6)}em` : '1.2em'))
      .text((d) => d.line);

    function computeLayout() {
      const rect = container.getBoundingClientRect();
      const parentWidth = rect.width || parent.clientWidth || width;
      width = Math.max(parentWidth, 980);
      height = Math.max(width * 0.66, 640);
      center = { x: width / 2, y: height / 2 + height * 0.025 };

      svg.attr('viewBox', `0 0 ${width} ${height}`);

      const orbitBase = Math.min(width, height) / 2.45;

      nodes.forEach((node) => {
        if (node.id === 'hub') {
          node.x = center.x;
          node.y = center.y;
          return;
        }

        const angle = (node.angle ?? 0) * (Math.PI / 180);
        const orbitFactor = node.orbit ?? 1;
        const radius = orbitBase * orbitFactor;
        const verticalCompression = 0.68 + Math.min(orbitFactor, 1.6) * 0.12;
        node.x = center.x + Math.cos(angle) * radius;
        node.y = center.y + Math.sin(angle) * radius * verticalCompression + (node.offsetY || 0);
      });

      const brainWidth = Math.min(width * 0.42, 520);
      const brainHeight = brainWidth * 0.82;

      brainGroup
        .select('.brain-halo')
        .attr('cx', center.x)
        .attr('cy', center.y)
        .attr('r', brainWidth * 0.68);

      brainImage
        .attr('x', center.x - brainWidth / 2)
        .attr('y', center.y - brainHeight / 2)
        .attr('width', brainWidth)
        .attr('height', brainHeight);

      pulses
        .attr('cx', center.x)
        .attr('cy', center.y)
        .attr('r', (d) => brainWidth * d * 0.95);
    }

    function updatePositions() {
      linkSelection
        .attr('x1', (d) => nodeById.get(d.source).x)
        .attr('y1', (d) => nodeById.get(d.source).y)
        .attr('x2', (d) => nodeById.get(d.target).x)
        .attr('y2', (d) => nodeById.get(d.target).y);

      nodesSelection.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
    }

    function setActiveNode(nodeId) {
      nodesSelection.classed('is-active', (d) => d.id === nodeId);
      linkSelection.classed(
        'is-highlighted',
        (d) => d.source === nodeId || d.target === nodeId
      );
    }

    function clearActiveNode() {
      nodesSelection.classed('is-active', false);
      linkSelection.classed('is-highlighted', false);
    }

    function clearCascadeHighlights() {
      cascadeTimeouts.splice(0).forEach((timeout) => window.clearTimeout(timeout));
      nodesSelection.classed('is-cascade', false);
      linkSelection.classed('is-cascade', false);
    }

    function highlightCascade(nodesToHighlight, linksToHighlight, duration = 1300) {
      nodesToHighlight.forEach((id) => {
        const selection = nodeSelectionById.get(id);
        if (selection) {
          selection.classed('is-cascade', true);
        }
      });
      linksToHighlight.forEach((key) => {
        const selection = linkSelectionByKey.get(key);
        if (selection) {
          selection.classed('is-cascade', true);
        }
      });

      const timeout = window.setTimeout(() => {
        nodesToHighlight.forEach((id) => {
          const selection = nodeSelectionById.get(id);
          if (selection) {
            selection.classed('is-cascade', false);
          }
        });
        linksToHighlight.forEach((key) => {
          const selection = linkSelectionByKey.get(key);
          if (selection) {
            selection.classed('is-cascade', false);
          }
        });
      }, duration);

      cascadeTimeouts.push(timeout);
    }

    function animateSignal(link, intense = false) {
      const source = nodeById.get(link.source);
      const target = nodeById.get(link.target);
      if (!source || !target) {
        return;
      }

      const radius = intense ? 6.5 : 4.2;
      const duration = intense ? 900 : 1400;

      const signal = signalGroup
        .append('circle')
        .attr('class', `signal${intense ? ' intense' : ''}`)
        .attr('r', radius)
        .attr('cx', source.x)
        .attr('cy', source.y)
        .style('opacity', intense ? 0.95 : 0.6);

      signal
        .transition()
        .duration(duration)
        .ease(d3.easeCubicInOut)
        .attr('cx', target.x)
        .attr('cy', target.y)
        .style('opacity', 0.05)
        .remove();
    }

    function triggerCascade(startId) {
      clearCascadeHighlights();
      highlightCascade([startId], [], 1600);

      const visited = new Set([startId]);

      function propagate(fromId, depth) {
        if (depth >= MAX_CASCADE_DEPTH) {
          return;
        }
        const neighbors = (adjacency.get(fromId) || []).filter((neighbor) => !visited.has(neighbor));
        neighbors.forEach((neighbor, index) => {
          const key = `${fromId}-${neighbor}`;
          const link = linkByKey.get(key);
          const delay = 220 * depth + index * 160;
          const timeout = window.setTimeout(() => {
            visited.add(neighbor);
            animateSignal(link, true);
            highlightCascade([neighbor], [key], 1200 - depth * 120);
            propagate(neighbor, depth + 1);
          }, delay);
          cascadeTimeouts.push(timeout);
        });
      }

      const initialNeighbors = adjacency.get(startId) || [];
      initialNeighbors.forEach((neighbor, index) => {
        const key = `${startId}-${neighbor}`;
        const link = linkByKey.get(key);
        const timeout = window.setTimeout(() => {
          animateSignal(link, true);
          highlightCascade([neighbor], [key], 1350);
          propagate(neighbor, 1);
        }, index * 140);
        cascadeTimeouts.push(timeout);
      });
    }

    function scheduleAmbientSignal() {
      if (prefersReducedMotion) {
        return;
      }
      const delay = AMBIENT_MIN_DELAY + Math.random() * (AMBIENT_MAX_DELAY - AMBIENT_MIN_DELAY);
      ambientTimeout = window.setTimeout(() => {
        const link = links[Math.floor(Math.random() * links.length)];
        if (link) {
          animateSignal(link, false);
        }
        scheduleAmbientSignal();
      }, delay);
    }

    function cancelAmbientSignal() {
      if (ambientTimeout) {
        window.clearTimeout(ambientTimeout);
        ambientTimeout = null;
      }
    }

    nodesSelection
      .on('mouseenter', (event, d) => {
        setActiveNode(d.id);
        triggerCascade(d.id);
      })
      .on('mouseleave', () => {
        clearActiveNode();
        clearCascadeHighlights();
      })
      .on('focus', (event, d) => {
        setActiveNode(d.id);
        triggerCascade(d.id);
      })
      .on('blur', () => {
        clearActiveNode();
        clearCascadeHighlights();
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

    function render() {
      computeLayout();
      updatePositions();
    }

    render();
    scheduleAmbientSignal();

    const resize = () => {
      render();
    };

    const cleanup = () => {
      cancelAmbientSignal();
      clearCascadeHighlights();
    };

    return { resize, cleanup };
  }

  function boot() {
    const network = initNetwork();
    if (!network) {
      return;
    }

    let resizeFrame = null;

    const onResize = () => {
      if (resizeFrame) {
        cancelAnimationFrame(resizeFrame);
      }
      resizeFrame = requestAnimationFrame(() => {
        network.resize();
        resizeFrame = null;
      });
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('beforeunload', network.cleanup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
