import React from 'react';
import DefaultNode from './default';

export default class NodeHandler extends React.PureComponent {
  render() {
    const { node, nodeSize } = this.props;
    return <DefaultNode node={node} nodeSize={nodeSize} />;
  }
}
