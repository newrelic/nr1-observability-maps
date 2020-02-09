/* 
eslint no-use-before-define: 0,
no-console: 0,
*/ // --> OFF

import React from 'react';
import { NerdletStateContext, PlatformStateContext, AutoSizer } from 'nr1';
import ObservabilityMaps from './components/observability-maps';
import pkg from '../../package.json';
import { DataProvider } from './context/data';

export default class Root extends React.Component {
  render() {
    console.log(`${pkg.name}: ${pkg.version}`);

    return (
      <PlatformStateContext.Consumer>
        {launcherUrlState => (
          <NerdletStateContext.Consumer>
            {nerdletUrlState => (
              <AutoSizer>
                {({ width, height }) => (
                  <DataProvider>
                    <ObservabilityMaps
                      launcherUrlState={launcherUrlState}
                      nerdletUrlState={nerdletUrlState}
                      width={width}
                      height={height}
                    />
                  </DataProvider>
                )}
              </AutoSizer>
            )}
          </NerdletStateContext.Consumer>
        )}
      </PlatformStateContext.Consumer>
    );
  }
}
