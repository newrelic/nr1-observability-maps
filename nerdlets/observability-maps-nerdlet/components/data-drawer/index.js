import React, { useContext, useState } from 'react';
import DataContext from '../../context/data';
import { SegmentedControl, SegmentedControlItem, TableChart } from 'nr1';

// eslint-disable-next-line no-unused-vars
export default function DataDrawer(props) {
  const dataContext = useContext(DataContext);
  const [segment, setSegment] = useState(false);

  return (
    <>
      <SegmentedControl
        value={segment}
        onChange={(evt, value) => setSegment(value)}
      >
        <SegmentedControlItem value="processes" label="Processes" />
        <SegmentedControlItem value="connections" label="Connections" />
      </SegmentedControl>

      <TableChart
        accountIds={[1606862]}
        fullWidth
        fullHeight
        query="FROM ProcessSample SELECT count(*), latest(parentProcessId), latest(processId) FACET entityName, processDisplayName WHERE contained = 'false' and processDisplayName NOT LIKE '%contain%' LIMIT MAX"
      />
    </>
  );
}
