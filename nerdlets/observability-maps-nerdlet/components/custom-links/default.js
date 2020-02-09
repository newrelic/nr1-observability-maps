/* eslint react/no-access-state-in-setstate: 0 */
import React from 'react';
import { DataConsumer } from '../../context/data';
import { setLinkData } from './link-utils';

export default class DefaultLink extends React.PureComponent {
  render() {
    const { link } = this.props;
    return (
      <DataConsumer>
        {({ mapData }) => setLinkData(link, mapData.linkData)}
      </DataConsumer>
    );
  }
}
