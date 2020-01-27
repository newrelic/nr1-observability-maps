import React from 'react';
import DefaultNode from './default';

export default class NodeHandler extends React.PureComponent {
  render() {
    const {
      sidebarOpen,
      node,
      mapData,
      nodeSize,
      setParentState,
      userIcons,
      closeCharts
    } = this.props;
    return (
      <DefaultNode
        userIcons={userIcons}
        sidebarOpen={sidebarOpen}
        node={node}
        mapData={mapData}
        nodeSize={nodeSize}
        setParentState={setParentState}
        closeCharts={closeCharts}
      />
    );
  }
}
