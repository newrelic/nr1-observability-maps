import React from 'react';
import { Table, Button } from 'semantic-ui-react';
import { DataConsumer } from '../../context/data';

export default class LinksTable extends React.PureComponent {
  render() {
    const { selectedSource, manageLink } = this.props;

    return (
      <DataConsumer>
        {({ mapConfig, updateDataContextState }) => {
          const links = Object.keys((mapConfig || {}).linkData || []).map(
            link => link
          );

          const renderRows = (links, selectedSource, manageLink) => {
            links = links.filter(link => link.includes(selectedSource));
            return links.map(link => {
              const st = link.split(/:::(.+)/);

              return (
                <Table.Row key={link}>
                  <Table.Cell>
                    {st[0]} &gt; {st[1]}
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      onClick={() =>
                        manageLink(
                          'del',
                          mapConfig,
                          updateDataContextState,
                          st[0],
                          st[1]
                        )
                      }
                      negative
                      style={{ float: 'right' }}
                    >
                      Delete
                    </Button>
                  </Table.Cell>
                </Table.Row>
              );
            });
          };

          return (
            <Table compact basic>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>
                    Current links for {selectedSource}
                  </Table.HeaderCell>
                  <Table.HeaderCell />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {renderRows(links, selectedSource, manageLink)}
              </Table.Body>
            </Table>
          );
        }}
      </DataConsumer>
    );
  }
}
