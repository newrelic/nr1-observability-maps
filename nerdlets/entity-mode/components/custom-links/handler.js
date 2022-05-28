import React from 'react';
import DefaultLink from './default';

export default class LinkHandler extends React.PureComponent {
  render() {
    const { link } = this.props;
    return <DefaultLink link={link} />;
  }
}
