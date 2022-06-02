import React, { useContext, useState } from 'react';
import DataContext from '../../context/data';
import {
  navigation,
  Button,
  EmptyState,
  TextField,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell
} from 'nr1';
import { instrumentationAnalysis } from '../../lib/instrument';

// eslint-disable-next-line no-unused-vars
export default function ServiceTable(props) {
  const { height, width } = props;
  const { entityMapData, selectedEntities, integrations } = useContext(
    DataContext
  );
  const [searchText, setSearchText] = useState('');
  const [column, setColumn] = useState(0);
  const [sortingType, setSortingType] = useState(
    TableHeaderCell.SORTING_TYPE.NONE
  );
  const onClickTableHeaderCell = (nextColumn, { nextSortingType }) => {
    if (nextColumn === column) {
      setSortingType(nextSortingType);
    } else {
      setSortingType(nextSortingType);
      setColumn(nextColumn);
    }
  };

  const entitiesWithData = entityMapData.nodes
    .filter(n =>
      Object.keys(selectedEntities).length > 0
        ? selectedEntities[n?.id] || selectedEntities[n?.name]
        : true
    )
    .filter(n => (n.AnsibleServiceSamples?.results || []).length > 0)
    .map(e => e.AnsibleServiceSamples?.results || [])
    .flat()
    .filter(
      e =>
        e.facet[0].toLowerCase().includes(searchText) ||
        e.facet[1].toLowerCase().includes(searchText)
    );

  if (entitiesWithData.length === 0) {
    return (
      <EmptyState
        iconType={
          EmptyState.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__ALL_ENTITIES
        }
        title="No data found"
      />
    );
  }

  instrumentationAnalysis(integrations, entitiesWithData, [1]);

  const columns = [
    {
      value: ({ item }) => item?.facet[0],
      width: '15%',
      key: 'Entity Name'
    },
    {
      value: ({ item }) => item?.facet[1],
      width: '10%',
      key: 'Name'
    },
    {
      value: ({ item }) => item?.state,
      width: '10%',
      key: 'State'
    },
    {
      value: ({ item }) => item?.status,
      width: '10%',
      key: 'Status'
    },
    {
      value: ({ item }) => item?.source,
      width: '10%',
      key: 'Source'
    },
    {
      value: ({ item }) => item?.instrument?.id,
      width: '10%',
      key: 'Instrument'
    }
  ];

  return (
    <>
      <TextField
        type={TextField.TYPE.SEARCH}
        placeholder="Search a host or process name"
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        style={{
          width: width - 3,
          marginTop: '5px',
          marginLeft: '3px'
        }}
      />

      <Table items={entitiesWithData} style={{ height, width }}>
        <TableHeader>
          {columns.map((h, i) => (
            // expansion will add the key, linter complains unnecessarily
            // eslint-disable-next-line react/jsx-key
            <TableHeaderCell
              {...h}
              sortable
              sortingType={
                column === i ? sortingType : TableHeaderCell.SORTING_TYPE.NONE
              }
              onClick={(event, data) => onClickTableHeaderCell(i, data)}
            >
              {h.key}
            </TableHeaderCell>
          ))}
        </TableHeader>

        {({ item }) => (
          <TableRow>
            <TableRowCell
              onClick={() =>
                navigation.openStackedEntity(item['latest.entityGuid'])
              }
            >
              {item.facet[0]}
            </TableRowCell>
            <TableRowCell>{item.facet[1]}</TableRowCell>
            <TableRowCell>{item.state}</TableRowCell>
            <TableRowCell>{item.status}</TableRowCell>
            <TableRowCell>{item.source}</TableRowCell>
            <TableRowCell
              onClick={item?.instrument ? item?.instrument?.onClick : undefined}
            >
              {item?.instrument?.name && (
                <Button type={Button.TYPE.PRIMARY}>
                  {item?.instrument?.name}
                </Button>
              )}
            </TableRowCell>
          </TableRow>
        )}
      </Table>
    </>
  );
}
