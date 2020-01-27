import React from 'react';
import { Button, Table } from 'semantic-ui-react';

export default class DeleteNode extends React.PureComponent {
  render() {
    const { action, mapConfig, setParentState } = this.props;
    return (
      <div style={{ overflowY: 'scroll', height: '300px' }}>
        <Table compact>
          <Table.Body>
            {Object.keys((mapConfig || {}).nodeData || {}).map((node, i) => {
              return (
                <Table.Row key={i}>
                  <Table.Cell>{node}</Table.Cell>
                  <Table.Cell>
                    <Button
                      negative
                      style={{ float: 'right' }}
                      onClick={() =>
                        action('del', mapConfig, setParentState, null, node)
                      }
                    >
                      Delete
                    </Button>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>
    );
  }
}
