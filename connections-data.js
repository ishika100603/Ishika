const GRAPH_DATA = (function () {

  const nodes = [];
  const links = [];

  function addNode(id, label, category, description, size, color) {
    nodes.push({ id, label, category, description, size, color });
  }
  function addLink(source, target, relationship) {
    links.push({ source, target, relationship });
  }

  // ---------- STUDIO ----------
  addNode('studio', 'Musecreate', 'Studio', 'The studio practice at the center of the entire body of work.', 34, '#e05c8a');

  // ---------- COLLECTIONS ----------
  const collections = [
    ['col-experimental', 'Experimental Abstractions'],
    ['col-pleated', 'Pleated Canvas Works'],
    ['col-human', 'Human Form Studies'],
    ['col-geometric', 'Geometric Explorations'],
    ['col-mixed', 'Mixed Media Textures'],
    ['col-flow', 'Acrylic Flow Paintings'],
  ];
  collections.forEach(([id, label]) => {
    addNode(id, label, 'Collection', `A collection within the studio practice: ${label}.`, 22, '#c9436b');
    addLink('studio', id, 'contains');
  });

  // ---------- ARTWORKS ----------
  const artworks = [
    ['art-velvet', 'Velvet Fury', 'col-flow'],
    ['art-unheard', 'Unheard', 'col-experimental'],
    ['art-wetlight', 'Through the Wet Light', 'col-flow'],
    ['art-earthen', 'Earthen Weaves', 'col-mixed'],
    ['art-bound', 'Bound Forms', 'col-human'],
    ['art-resting', 'Resting Geometry', 'col-geometric'],
    ['art-silent', 'Silent Coordinates', 'col-geometric'],
    ['art-midnight', 'The Midnight Orbit', 'col-experimental'],
  ];
  artworks.forEach(([id, label, col]) => {
    addNode(id, label, 'Artwork', `An artwork belonging to ${nodes.find(n=>n.id===col).label}.`, 18, '#ff6f91');
    addLink(col, id, 'belongs to');
  });

  // ---------- INSPIRATIONS ----------
  const inspirations = {
    Science: ['Microscopic organisms','Cell division','Cellular membranes','Fluid dynamics','Molecular structures','Organic growth','Geological formations'],
    Nature: ['Coral reefs','River erosion','Lava flow','Rock strata','Sand dunes','Weathered surfaces','Tree bark','Moss'],
    Architecture: ['Brutalist architecture','Raw concrete','Layered facades','Japanese minimalism','Material ageing','Architectural rhythm'],
    Human: ['Human anatomy','Skin textures','Muscle fibres','Emotion','Memory','Silence','Presence'],
  };
  Object.entries(inspirations).forEach(([group, items]) => {
    items.forEach(label => {
      const id = 'insp-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      addNode(id, label, 'Inspiration', `An inspiration drawn from ${group.toLowerCase()}.`, 12, '#9d5fd0');
    });
  });

  // ---------- MATERIALS ----------
  ['Acrylic paint','Canvas','Texture paste','Sand','Marble dust','Pigments','Metallic pigments','Mixed media'].forEach(label => {
    addNode('mat-' + label.toLowerCase().replace(/[^a-z0-9]+/g,'-'), label, 'Material', `A material used in the practice: ${label}.`, 11, '#7f8fd4');
  });

  // ---------- TECHNIQUES ----------
  ['Acrylic pouring','Controlled flow','Layer building','Palette knife','Sculptural texture','Pleating','Freehand painting'].forEach(label => {
    addNode('tech-' + label.toLowerCase().replace(/[^a-z0-9]+/g,'-'), label, 'Technique', `A technique used: ${label}.`, 11, '#5fa8d0');
  });

  // ---------- TEXTURE LANGUAGE ----------
  ['Cellular','Folded','Layered','Rippled','Raised relief','Stone surface','Organic edges','Smooth gradients'].forEach(label => {
    addNode('tex-' + label.toLowerCase().replace(/[^a-z0-9]+/g,'-'), label, 'Texture', `A texture quality: ${label}.`, 10, '#6bbf9e');
  });

  // ---------- COLOUR LANGUAGE ----------
  const colours = {
    'Burgundy': '#6b1f33', 'Crimson': '#a3223e', 'Magenta': '#c2255c',
    'Deep violet': '#5b2a86', 'Olive green': '#6b6b2c', 'Terracotta': '#b0532c',
    'Charcoal': '#3a3a3a', 'Black': '#111111', 'Ivory': '#e9e2d0',
    'Burnt orange': '#c1521e', 'Silver': '#b8b8b8',
  };
  Object.entries(colours).forEach(([label, hex]) => {
    addNode('col-' + label.toLowerCase().replace(/[^a-z0-9]+/g,'-'), label, 'Colour', `A colour used: ${label}.`, 9, hex);
  });

  // ---------- CONCEPTS ----------
  ['Transformation','Balance','Tension','Growth','Decay','Movement','Stillness','Connection','Fragmentation','Materiality'].forEach(label => {
    addNode('con-' + label.toLowerCase().replace(/[^a-z0-9]+/g,'-'), label, 'Concept', `A conceptual thread: ${label}.`, 12, '#d0a05f');
  });

  // ---------- PROCESS ----------
  ['Initial inspiration','Visual references','Material experimentation','Colour studies','Texture studies','Composition development','Work in progress','Finished artwork'].forEach((label, i) => {
    const id = 'proc-' + label.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    addNode(id, label, 'Process', `Step ${i+1} of the creative process.`, 10, '#a0a0a0');
  });

  // ---------- EXHIBITION ----------
  addNode('exh-designmumbai', 'Design Mumbai 2025', 'Exhibition', 'Exhibition where select works were shown.', 16, '#ffd166');

  // ---------- helper to link an artwork to a list of tag ids by label ----------
  function link(artId, prefix, labels, rel) {
    labels.forEach(label => {
      const id = prefix + label.toLowerCase().replace(/[^a-z0-9]+/g,'-');
      addLink(artId, id, rel);
    });
  }

  // ---------- Velvet Fury ----------
  link('art-velvet', 'insp-', ['Microscopic organisms','Cellular membranes','Lava flow','Fluid dynamics','Organic growth'], 'inspired by');
  link('art-velvet', 'mat-', ['Acrylic paint','Pigments','Canvas'], 'uses');
  link('art-velvet', 'tech-', ['Acrylic pouring','Controlled flow'], 'created using');
  link('art-velvet', 'tex-', ['Cellular','Organic edges'], 'texture');
  link('art-velvet', 'col-', ['Burgundy','Crimson','Magenta','Deep violet','Black'], 'colour');
  link('art-velvet', 'con-', ['Transformation','Movement','Growth'], 'explores');
  addLink('art-velvet', 'exh-designmumbai', 'exhibited at');

  // ---------- Bound Forms ----------
  link('art-bound', 'insp-', ['Human anatomy','Skin textures','Architectural rhythm'], 'inspired by');
  link('art-bound', 'mat-', ['Texture paste','Acrylic paint'], 'uses');
  link('art-bound', 'tech-', ['Pleating','Sculptural texture'], 'created using');
  link('art-bound', 'tex-', ['Folded','Raised relief'], 'texture');
  link('art-bound', 'col-', ['Ivory','Terracotta','Charcoal'], 'colour');
  link('art-bound', 'con-', ['Balance','Materiality'], 'explores');

  // ---------- Earthen Weaves ----------
  link('art-earthen', 'insp-', ['Geological formations','Tree bark','Weathered surfaces'], 'inspired by');
  link('art-earthen', 'mat-', ['Sand','Marble dust','Acrylic paint'], 'uses');
  link('art-earthen', 'tech-', ['Layer building','Palette knife'], 'created using');
  link('art-earthen', 'tex-', ['Stone surface','Layered'], 'texture');
  link('art-earthen', 'col-', ['Terracotta','Olive green','Charcoal'], 'colour');
  link('art-earthen', 'con-', ['Growth','Decay'], 'explores');

  // ---------- light connective tissue for remaining artworks (so graph isn't sparse) ----------
  link('art-unheard', 'insp-', ['Silence','Memory','Emotion'], 'inspired by');
  link('art-unheard', 'con-', ['Stillness','Fragmentation'], 'explores');
  link('art-unheard', 'col-', ['Charcoal','Black','Silver'], 'colour');

  link('art-wetlight', 'insp-', ['Fluid dynamics','River erosion'], 'inspired by');
  link('art-wetlight', 'tech-', ['Acrylic pouring'], 'created using');
  link('art-wetlight', 'col-', ['Magenta','Deep violet'], 'colour');

  link('art-resting', 'insp-', ['Japanese minimalism','Brutalist architecture'], 'inspired by');
  link('art-resting', 'con-', ['Stillness','Balance'], 'explores');
  link('art-resting', 'col-', ['Ivory','Silver'], 'colour');

  link('art-silent', 'insp-', ['Rock strata','Layered facades'], 'inspired by');
  link('art-silent', 'con-', ['Connection','Tension'], 'explores');

  link('art-midnight', 'insp-', ['Cell division','Molecular structures'], 'inspired by');
  link('art-midnight', 'con-', ['Movement','Transformation'], 'explores');
  link('art-midnight', 'col-', ['Deep violet','Black'], 'colour');

  // process chain shared across all artworks (loosely)
  const processIds = ['proc-initial-inspiration','proc-visual-references','proc-material-experimentation','proc-colour-studies','proc-texture-studies','proc-composition-development','proc-work-in-progress','proc-finished-artwork'];
  for (let i = 0; i < processIds.length - 1; i++) {
    addLink(processIds[i], processIds[i+1], 'leads to');
  }
  artworks.forEach(([id]) => addLink(id, 'proc-finished-artwork', 'result of'));
  addLink('studio', 'proc-initial-inspiration', 'begins with');
  addLink('exh-designmumbai', 'studio', 'part of');

  // ensure every node has at least one link (no disconnected strays)
  const linkedIds = new Set();
  links.forEach(l => {
    linkedIds.add(l.source);
    linkedIds.add(l.target);
  });
  nodes.forEach(n => {
    if (!linkedIds.has(n.id)) {
      addLink('studio', n.id, 'related to');
    }
  });

  return { nodes, links };
})();
