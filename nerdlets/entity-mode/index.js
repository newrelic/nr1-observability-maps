/* 
eslint no-use-before-define: 0,
no-console: 0,
*/ // --> OFF

import React, { useContext, useEffect } from 'react';
import { nerdlet, AutoSizer, NerdletStateContext } from 'nr1';
import EntityMode from './components/entity-mode';
import { DataProvider } from './context/data';

function EntityModeRoot(props) {
  useEffect(() => {
    nerdlet.setConfig({
      timePicker: false
    });
  }, []);

  const nerdletContext = useContext(NerdletStateContext);

  //////////////////////////////
  // cloud accel test workloads
  // nerdletContext.workloadGuids = [
  //   'MzI0MjYyN3xOUjF8V09SS0xPQUR8ODkwMTc',
  //   'MzI0MjYyN3xOUjF8V09SS0xPQUR8OTE1OTU',
  //   'MzI0MjYyN3xOUjF8V09SS0xPQUR8OTIyNDg'
  // ];

  return (
    <DataProvider {...nerdletContext}>
      <AutoSizer>
        {({ width, height }) =>
          height > 0 && <EntityMode height={height} width={width} />
        }
      </AutoSizer>
    </DataProvider>
  );
}

export default EntityModeRoot;
