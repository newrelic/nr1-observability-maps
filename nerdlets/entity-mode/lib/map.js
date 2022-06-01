export const buildEntityMap = entityData => {
  const mapData = {
    nodes: [],
    links: []
  };

  let customNodes = [];
  let customLinks = [];

  Object.keys(entityData).forEach(guid => {
    mapData.nodes.push({ id: guid, ...entityData[guid] });

    // check if ansible vm sample
    const AnsibleVmSystemSamples =
      entityData[guid]?.AnsibleVmSystemSamples?.results || [];
    if (AnsibleVmSystemSamples.length > 0) {
      const { facet } = AnsibleVmSystemSamples?.[0] || {};
      // datacenter, cluster, esxiHostname
      customNodes.push(facet[1], facet[2], facet[3]);
      customLinks.push(
        `${facet[1]}:::${facet[2]}`,
        `${facet[2]}:::${facet[3]}`,
        `${facet[3]}:::${guid}`
      );
    }

    (entityData[guid]?.relatedEntities?.results || []).forEach(r => {
      // if (mapData.nodes.some(n => n.id === r?.target?.entity?.guid)) {
      mapData.links.push({ source: guid, target: r.target.entity.guid });
      // } else {
      //   console.log('missing', r.target.entity.__typename);
      // }
    });

    // stitch in the custom nodes and links
    customNodes = [...new Set(customNodes)];
    customLinks = [...new Set(customLinks)];

    customNodes.forEach(n => {
      mapData.nodes.push({ id: n });
    });

    customLinks.forEach(l => {
      const linkSplit = l.split(':::');
      mapData.links.push({ source: linkSplit[0], target: linkSplit[1] });
    });
  });

  // Object.keys(entityData).forEach(guid => {
  //   (entityData[guid]?.relatedEntities?.results || []).forEach(r => {
  //     if (mapData.nodes.some(n => n.id === r?.target?.entity?.guid)) {
  //       mapData.links.push({ source: guid, target: r.target.entity.guid });
  //     } else {
  //       console.log('missing', r.target.entity.__typename);
  //     }
  //   });
  // });

  // find nodes without links
  let noLinks = false;
  Object.keys(entityData).forEach(guid => {
    if (!mapData.links.some(l => l.source === guid || l.target === guid)) {
      noLinks = true;
      mapData.links.push({ source: 'NO LINKS', target: guid });
    }
  });

  if (noLinks) {
    mapData.nodes.push({ id: 'NO LINKS' });
  }

  return mapData;
};
