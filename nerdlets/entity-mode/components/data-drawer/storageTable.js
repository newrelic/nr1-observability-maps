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
  TableRowCell,
  MetricTableRowCell
} from 'nr1';

// eslint-disable-next-line no-unused-vars
export default function StorageTable(props) {
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

  const entitiesWithStorageSamples = entityMapData.nodes
    .filter(n =>
      Object.keys(selectedEntities).length > 0
        ? selectedEntities[n?.id] || selectedEntities[n?.name]
        : true
    )
    .filter(n => (n.StorageSamples?.results || []).length > 0)
    .map(e => e.StorageSamples?.results || [])
    .flat()
    .filter(
      e =>
        (e.facet[0] || '').toLowerCase().includes(searchText) ||
        e.facet[1].toLowerCase().includes(searchText)
    )
    .map(r => ({ ...r, sampleSource: 'AGENT' }));

  const entitiesWithAnsibleStorageSamples = entityMapData.nodes
    .filter(n => (n.AnsibleStorageSamples?.results || []).length > 0)
    .map(e => e.AnsibleStorageSamples?.results || [])
    .flat()
    .filter(
      e =>
        (e.facet[0] || '').toLowerCase().includes(searchText) ||
        e.facet[1].toLowerCase().includes(searchText)
    )
    .map(r => ({ ...r, sampleSource: 'ANSIBLE' }));

  const storageSamples = [
    ...entitiesWithStorageSamples,
    ...entitiesWithAnsibleStorageSamples
  ];

  if (storageSamples.length === 0) {
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
      key: 'Mount'
    },
    {
      value: ({ item }) => item?.facet[2],
      width: '10%',
      key: 'Device'
    },
    {
      value: ({ item }) => item?.['diskTotalBytes'],
      width: '10%',
      key: 'Disk Total',
      alignmentType: TableHeaderCell.ALIGNMENT_TYPE.RIGHT
    },
    {
      value: ({ item }) => item?.['diskUsedBytes'],
      width: '10%',
      key: 'Disk Used',
      alignmentType: TableHeaderCell.ALIGNMENT_TYPE.RIGHT
    }
  ];

  return (
    <>
      <TextField
        type={TextField.TYPE.SEARCH}
        placeholder="Search a host or mount point"
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        style={{
          width: width - 3,
          marginTop: '5px',
          marginLeft: '3px'
        }}
      />

      <Table items={storageSamples} style={{ height, width }}>
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
            <MetricTableRowCell
              type={MetricTableRowCell.TYPE.BYTES}
              value={item?.['diskTotalBytes'] || 0}
            />
            <MetricTableRowCell
              type={MetricTableRowCell.TYPE.BYTES}
              value={item?.['diskUsedBytes'] || 0}
            />
          </TableRow>
        )}
      </Table>
    </>
  );
}
