import React from 'react';
import NodeHandler from '../custom-nodes/handler';
import { setLinkData, cleanNodeId } from '../../lib/helper';

// the graph configuration, you only need to pass down properties
// that you want to override, otherwise default ones will be used
export const generateD3MapConfig = (graphWidth, sidebarOpen, node, mapData) => {
  const nodeSize = 700;
  return {
    staticGraph: false,
    staticGraphWithDragAndDrop: true,
    d3: {
      linkLength: 200
    },
    nodeHighlightBehavior: false, // if this is set to true reset positions doesn't work
    node: {
      color: 'lightgreen',
      size: nodeSize,
      highlightStrokeColor: 'blue',
      fontSize: 16,
      highlightFontSize: 16,
      labelProperty: node => cleanNodeId(node.id),
      // renderLabel: false,
      fontColor: 'white',
      // viewGenerator: node => <Popup basic pinned on={"click"} content={node} trigger={<Button color="green" icon='add' />} />
      viewGenerator: node => (
        <NodeHandler
          sidebarOpen={sidebarOpen}
          node={node}
          nodeSize={nodeSize}
        />
      )
    },
    link: {
      highlightColor: 'lightblue',
      type: 'CURVE_SMOOTH',
      renderLabel: true,
      labelProperty: link => setLinkData(link, mapData.linkData),
      fontColor: '#21ba45',
      fontSize: 13,
      fontWeight: 'bold'
    },
    directed: true,
    height: this.props.height - 80,
    width: graphWidth
  };
};
