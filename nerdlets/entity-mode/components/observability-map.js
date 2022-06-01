/* 
eslint no-use-before-define: 0,
no-console: 0,
*/ // --> OFF

import React, { useContext, useMemo } from 'react';
import DataContext from '../context/data';
import Map from './map/map';
import { cleanNodeId } from '../lib/helper';
import NodeHandler from './custom-nodes/handler';
import LinkHandler from './custom-links/handler';

function ObservabilityMap(props) {
  const { width, height } = props;
  const { entityMapData, gravity, linkLength } = useContext(DataContext);

  if (width === 0 || height === 0) return null;
  if (entityMapData.nodes.length === 0) return null;

  return useMemo(() => {
    // console.log('rendering: map', width, height);
    const nodeSize = 700; // increasing this will not adjust the icon sizing, it will increase the svg area

    const d3MapConfig = {
      automaticRearrangeAfterDropNode: false,
      width,
      height,
      // collapsible: true,
      directed: true,
      focusAnimationDuration: 0.75,
      focusZoom: 1,
      freezeAllDragEvents: false,
      highlightDegree: 2,
      highlightOpacity: 0.2,
      linkHighlightBehavior: true,
      initialZoom: 0.7,
      maxZoom: 12,
      minZoom: 0.05,
      nodeHighlightBehavior: true,
      panAndZoom: false,
      staticGraph: false,
      staticGraphWithDragAndDrop: false,
      d3: {
        alphaTarget: 0.05,
        gravity: gravity * -1,
        linkLength,
        linkStrength: 2,
        disableLinkForce: false
      },
      node: {
        color: 'lightgreen',
        size: nodeSize,
        highlightStrokeColor: 'blue',
        fontSize: 16,
        highlightFontSize: 16,
        labelProperty: node => cleanNodeId(node.name || node.id),
        // fontColor: 'white',
        viewGenerator: node => <NodeHandler node={node} nodeSize={nodeSize} />
      },
      link: {
        highlightColor: 'lightblue',
        type: 'CURVE_SMOOTH',
        renderLabel: true,
        labelProperty: link => <LinkHandler link={link} />,
        fontColor: '#21ba45',
        fontSize: 13,
        fontWeight: 'bold'
      }
    };

    return (
      <>
        <Map d3MapConfig={d3MapConfig} entityMapData={entityMapData} />
      </>
    );
  }, [entityMapData, width, gravity, linkLength]);
}

export default ObservabilityMap;
