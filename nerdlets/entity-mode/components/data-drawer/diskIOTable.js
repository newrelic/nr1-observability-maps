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
export default function DiskIOTable(props) {
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
    .filter(n => (n.AnsibleDiskIOSamples?.results || []).length > 0)
    .map(e => e.AnsibleDiskIOSamples?.results || [])
    .flat()
    .filter(
      e =>
        e.facet[0].toLowerCase().includes(searchText) ||
        e.facet[1].toLowerCase().includes(searchText) ||
        e.facet[2].toLowerCase().includes(searchText)
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
      key: 'Device'
    },
    {
      value: ({ item }) => item?.facet[2],
      width: '10%',
      key: 'Namespace'
    },
    {
      value: ({ item }) => item?.iopsReadPerSec,
      width: '10%',
      key: 'IOPS Read PerSec'
    },
    {
      value: ({ item }) => item?.iopsWritePerSec,
      width: '10%',
      key: 'IOPS Write PerSec'
    },
    {
      value: ({ item }) => item?.major,
      width: '10%',
      key: 'Major'
    },
    {
      value: ({ item }) => item?.minor,
      width: '10%',
      key: 'Minor'
    },
    {
      value: ({ item }) => item?.timeInterval,
      width: '10%',
      key: 'Time Interval'
    }
  ];

  return (
    <>
      <TextField
        type={TextField.TYPE.SEARCH}
        placeholder="Search a host. device or namespace"
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
            <TableRowCell>{item.iopsReadPerSec}</TableRowCell>
            <TableRowCell>{item.iopsWritePerSec}</TableRowCell>
            <TableRowCell>{item.major}</TableRowCell>
            <TableRowCell>{item.minor}</TableRowCell>
            <TableRowCell>{item.timeInterval}</TableRowCell>
          </TableRow>
        )}
      </Table>
    </>
  );
}
