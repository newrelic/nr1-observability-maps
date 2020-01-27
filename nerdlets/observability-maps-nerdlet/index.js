/* eslint no-use-before-define: 0 */ // --> OFF
import React from 'react';
import { NerdletStateContext, PlatformStateContext, AutoSizer } from 'nr1';
import ObservabilityMaps from './components/observability-maps';

export default class Root extends React.Component {
  render() {
    return (
      <PlatformStateContext.Consumer>
        {launcherUrlState => (
          <NerdletStateContext.Consumer>
            {nerdletUrlState => (
              <AutoSizer>
                {({ width, height }) => (
                  <ObservabilityMaps
                    launcherUrlState={launcherUrlState}
                    nerdletUrlState={nerdletUrlState}
                    width={width}
                    height={height}
                  />
                )}
              </AutoSizer>
            )}
          </NerdletStateContext.Consumer>
        )}
      </PlatformStateContext.Consumer>
    );
  }
}
