import React from 'react';
import { Button, Table } from 'semantic-ui-react';
import { DataConsumer } from '../../context/data';

export default class DeleteNode extends React.PureComponent {
  render() {
    const { action } = this.props;
    return (
      <DataConsumer>
        {({ mapConfig, updateDataContextState }) => {
          return (
            <div style={{ overflowY: 'scroll', height: '300px' }}>
              <Table compact>
                <Table.Body>
                  {Object.keys((mapConfig || {}).nodeData || {}).map(
                    (node, i) => {
                      return (
                        <Table.Row key={i}>
                          <Table.Cell>{node}</Table.Cell>
                          <Table.Cell>
                            <Button
                              negative
                              style={{ float: 'right' }}
                              onClick={() =>
                                action(
                                  'del',
                                  mapConfig,
                                  updateDataContextState,
                                  null,
                                  node
                                )
                              }
                            >
                              Delete
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      );
                    }
                  )}
                </Table.Body>
              </Table>
            </div>
          );
        }}
      </DataConsumer>
    );
  }
}
