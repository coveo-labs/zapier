'use strict';

module.exports = {
  filterSourcesWithPrivileges: (sources, privileges) => {
    // make sure we have arrays.
    if (!sources.map) {
      sources = [];
    }
    if (!privileges.map) {
      privileges = [];
    }

    // We can only use this app with Push sources.
    sources = sources.filter(source => source.sourceType === 'PUSH');
    // Only want source ids and names from this call
    sources = sources.map(source => ({ id: source.id, name: source.name }));

    // Keep only sources with EDIT privileges
    privileges = privileges.filter(p => p.type === 'EDIT' && p.targetDomain === 'SOURCE');
    // we just need the ids
    privileges = privileges.map(p => p.targetId);

    sources = sources.filter(s => privileges.includes(s.id) || privileges.includes('*'));

    return sources;
  },
};
