import React, { useContext, useState } from 'react';
import DataContext from '../../context/data';
import {
  navigation,
  EmptyState,
  TextField,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell
} from 'nr1';

// eslint-disable-next-line no-unused-vars
export default function ConnectionTable(props) {
  const { height, width } = props;
  const { entityMapData, selectedEntities } = useContext(DataContext);
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
    .filter(n => (n.AnsibleNetstatSamples?.results || []).length > 0)
    .map(e => e.AnsibleNetstatSamples?.results || [])
    .flat()
    .filter(
      e =>
        e.facet[0].toLowerCase().includes(searchText) ||
        (e?.user || '').toLowerCase().includes(searchText)
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

  const columns = [
    {
      value: ({ item }) => item?.facet[0],
      width: '15%',
      key: 'Entity Name'
    },
    {
      value: ({ item }) => item?.facet[1],
      width: '10%',
      key: 'Local Addr'
    },
    {
      value: ({ item }) => item?.facet[2],
      width: '10%',
      key: 'Local Port'
    },
    {
      value: ({ item }) => item?.facet[2],
      width: '10%',
      key: 'Remote Addr'
    },
    {
      value: ({ item }) => item?.facet[3],
      width: '10%',
      key: 'Remote Port'
    },
    {
      value: ({ item }) => item?.protocol,
      width: '10%',
      key: 'Protocol'
    },
    {
      value: ({ item }) => item?.user,
      width: '10%',
      key: 'User'
    },
    {
      value: ({ item }) => item?.pid,
      width: '10%',
      key: 'PID'
    }
  ];

  return (
    <>
      <TextField
        type={TextField.TYPE.SEARCH}
        placeholder="Search a host or user name"
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
            <TableRowCell>{item.facet[2]}</TableRowCell>
            <TableRowCell>{item.facet[3]}</TableRowCell>
            <TableRowCell>{item.facet[4]}</TableRowCell>
            <TableRowCell>{item.protocol}</TableRowCell>
            <TableRowCell>{item.user}</TableRowCell>
            <TableRowCell>{item.pid}</TableRowCell>
          </TableRow>
        )}
      </Table>
    </>
  );
}
