import React from 'react';
import Select from 'react-select';
import { DataConsumer } from '../../context/data';

export default class RefreshSelector extends React.PureComponent {
  render() {
    const timeBucketOptions = [
      { key: 1, label: '30 sec', value: 30000 },
      { key: 2, label: '1 min', value: 60000 },
      { key: 3, label: '2 min', value: 120000 },
      { key: 4, label: '3 min', value: 180000 },
      { key: 5, label: '4 min', value: 240000 },
      { key: 6, label: '5 min', value: 300000 }
    ];

    return (
      <DataConsumer>
        {({ bucketMs, updateDataContextState }) => (
          <div className="react-select-input-group" style={{ width: '100px' }}>
            <label>Refresh</label>
            <Select
              options={timeBucketOptions}
              onChange={data => updateDataContextState({ bucketMs: data })}
              value={bucketMs}
              classNamePrefix="react-select"
            />
          </div>
        )}
      </DataConsumer>
    );
  }
}
