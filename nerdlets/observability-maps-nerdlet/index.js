/* 
eslint no-use-before-define: 0,
no-console: 0,
*/ // --> OFF

import React, { useContext } from 'react';
import { AutoSizer, NerdletStateContext } from 'nr1';
import ObservabilityMaps from './components/observability-maps';
import { DataProvider } from './context/data';

function ObservabilityMapsCore(props) {
  const { isWidget, vizConfig } = props;
  const nerdletContext = useContext(NerdletStateContext);

  // test guids being pushed manually
  //

  nerdletContext.workloadGuids = [
    'MTYwNjg2MnxOUjF8V09SS0xPQUR8ODkwNzc',
    'MTYwNjg2MnxOUjF8V09SS0xPQUR8NDkyMjg'
  ];

  return (
    <AutoSizer>
      {({ width, height }) => (
        <DataProvider
          isWidget={isWidget}
          vizConfig={vizConfig}
          {...nerdletContext}
          width={width}
          height={height}
        >
          {height > 0 && (
            <ObservabilityMaps
              isWidget={isWidget}
              height={height}
              // width={width}
              vizConfig={vizConfig}
            />
          )}
        </DataProvider>
      )}
    </AutoSizer>
  );
}

export default ObservabilityMapsCore;
