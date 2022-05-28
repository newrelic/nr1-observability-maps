export const buildEntityMap = entityData => {
  console.log('triggered');
  const mapData = {
    nodes: [],
    links: []
  };

  Object.keys(entityData).forEach(guid => {
    mapData.nodes.push({ id: guid, ...entityData[guid] });

    (entityData[guid]?.relatedEntities?.results || []).forEach(r => {
      // if (mapData.nodes.some(n => n.id === r?.target?.entity?.guid)) {
      mapData.links.push({ source: guid, target: r.target.entity.guid });
      // } else {
      //   console.log('missing', r.target.entity.__typename);
      // }
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

  // console.log(mapData);

  return mapData;
};
