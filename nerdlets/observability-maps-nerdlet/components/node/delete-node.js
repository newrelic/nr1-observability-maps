/* eslint(array-callback-return): 0 */

import React from 'react';
import { Button, Table, Form } from 'semantic-ui-react';
import { DataConsumer } from '../../context/data';

export default class DeleteNode extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { searchText: '' };
  }

  render() {
    const { action } = this.props;
    const { searchText } = this.state;

    return (
      <DataConsumer>
        {({ mapConfig, updateDataContextState }) => {
          const searchedNodes = [];
          Object.keys((mapConfig || {}).nodeData || {}).forEach(node => {
            if (node.toLowerCase().includes(searchText.toLowerCase())) {
              mapConfig.nodeData[node].id = node;
              searchedNodes.push(mapConfig.nodeData[node]);
            }
          });

          return (
            <div style={{ overflowY: 'scroll', height: '300px' }}>
              <Form>
                <Form.Input
                  width="16"
                  label="Search"
                  placeholder="My service..."
                  value={searchText}
                  onChange={e => this.setState({ searchText: e.target.value })}
                />
              </Form>

              <Table compact>
                <Table.Body>
                  {searchedNodes.map((node, i) => (
                    <Table.Row key={i}>
                      <Table.Cell>{node.id}</Table.Cell>
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
                              node.id
                            )
                          }
                        >
                          Delete
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          );
        }}
      </DataConsumer>
    );
  }
}
