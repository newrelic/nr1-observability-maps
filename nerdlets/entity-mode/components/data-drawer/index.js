import React, { useContext } from 'react';
import DataContext from '../../context/data';
import { StackItem } from 'nr1';
import ProcessTable from './processTable';
import StorageTable from './storageTable';
import ConnectionTable from './connectionTable';
import ServiceTable from './serviceTable';
import DiskIOTable from './diskIOTable';

// eslint-disable-next-line no-unused-vars
export default function DataDrawer(props) {
  const {
    dataDrawer,
    selectedEntities,
    entityMapData,
    updateDataState
  } = useContext(DataContext);
  const { height, width } = props;
  const tableHeight = height - 50;
  const tableWidth = width;

  const renderView = () => {
    switch (dataDrawer) {
      case 'processes':
        return <ProcessTable height={tableHeight} width={tableWidth} />;
      case 'storage':
        return <StorageTable height={tableHeight} width={tableWidth} />;
      case 'connections':
        return <ConnectionTable height={tableHeight} width={tableWidth} />;
      case 'services':
        return <ServiceTable height={tableHeight} width={tableWidth} />;
      case 'diskio':
        return <DiskIOTable height={tableHeight} width={tableWidth} />;
      default:
        return '';
    }
  };

  const updateEntities = entity => {
    delete selectedEntities[entity];
    updateDataState(selectedEntities);
  };

  const getName = nodeId => {
    const node = entityMapData.nodes.find(n => n.id === nodeId);
    return node?.name || node?.id;
  };

  return (
    <>
      <StackItem
        style={{
          backgroundColor: 'white',
          maxHeight: `${height}px`,
          minWidth: tableWidth,
          minHeight: tableHeight
        }}
      >
        <div
          style={{
            marginTop: '10px',
            display: 'inline-block'
          }}
        >
          {Object.keys(selectedEntities || {}).map((nodeId, i) => {
            return (
              <div
                key={`${nodeId}.${i}`}
                style={{ paddingBottom: '15px', display: 'inline-block' }}
              >
                <span
                  style={{
                    padding: '4px',
                    fontSize: '12px',
                    marginTop: '10px',
                    marginBottom: '20px',
                    marginRight: '10px',
                    backgroundColor: '#D0F0FF',
                    cursor: 'pointer',
                    borderRadius: '3px'
                  }}
                  onClick={() => updateEntities(nodeId)}
                >
                  {getName(nodeId)}&nbsp;&nbsp;
                  <span style={{ color: '#0079BF' }}>X</span>&nbsp;
                </span>
              </div>
            );
          })}
        </div>

        {renderView()}
      </StackItem>
    </>
  );
}
