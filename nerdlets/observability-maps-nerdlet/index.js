/* 
eslint no-use-before-define: 0,
no-console: 0,
*/ // --> OFF

import React from 'react';
import { AutoSizer } from 'nr1';
import ObservabilityMaps from './components/observability-maps';
import { DataProvider } from './context/data';

export default class Root extends React.Component {
  render() {
    return (
      <AutoSizer>
        {({ width, height }) => (
          <DataProvider>
            <ObservabilityMaps width={width} height={height} />
          </DataProvider>
        )}
      </AutoSizer>
    );
  }
}
