/* 
eslint no-use-before-define: 0,
no-console: 0,
*/ // --> OFF

import React from 'react';
import { AutoSizer } from 'nr1';
import ObservabilityMaps from './components/observability-maps';
import { DataProvider } from './context/data';

export default class ObservabilityMapsCore extends React.Component {
  render() {
    const { isWidget, vizConfig } = this.props;
    return (
      <AutoSizer>
        {({ width, height }) => (
          <DataProvider isWidget={isWidget} vizConfig={vizConfig}>
            <ObservabilityMaps
              isWidget={isWidget}
              width={width}
              vizConfig={vizConfig}
              height={vizConfig?.hideMenu === true ? height + 60 : height}
            />
          </DataProvider>
        )}
      </AutoSizer>
    );
  }
}
