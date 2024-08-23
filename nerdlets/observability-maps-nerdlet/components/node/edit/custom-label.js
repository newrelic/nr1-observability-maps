/* eslint
no-console: 0
*/

import React from 'react';
import { Button, Form, Input } from 'semantic-ui-react';
import { DataConsumer } from '../../../context/data';

export default class CustomLabel extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      customLabel: null
    };
  }

  updateDashboard = async (
    updateDataContextState,
    mapConfig,
    nodeId,
    action
  ) => {
    if (action === 'save') {
      if (!this.state.customLabel) {
        delete mapConfig.nodeData[nodeId].customLabel;
      } else {
        mapConfig.nodeData[nodeId].customLabel = this.state.customLabel;
      }
    } else if (action === 'delete') {
      delete mapConfig.nodeData[nodeId].customLabel;
    }
    await updateDataContextState({ mapConfig }, ['saveMap']);
  };

  render() {
    return (
      <DataConsumer>
        {({ mapConfig, selectedNode, updateDataContextState }) => {
          const currentCustomLabel =
            mapConfig.nodeData[selectedNode].customLabel;

          return (
            <>
              <Form.Group>
                <Form.Field
                  width="16"
                  control={Input}
                  value={
                    this.state.customLabel === null
                      ? currentCustomLabel
                      : this.state.customLabel
                  }
                  label="Custom Label"
                  onChange={e => this.setState({ customLabel: e.target.value })}
                />
              </Form.Group>

              {/* <Button
                style={{ float: 'right' }}
                disabled={!currentCustomLabel}
                negative
                onClick={() => {
                  this.updateDashboard(
                    updateDataContextState,
                    mapConfig,
                    selectedNode,
                    'delete'
                  );
                }}
              >
                Clear
              </Button> */}

              <Button
                style={{ float: 'right' }}
                // disabled={addDisabled}
                positive
                onClick={() => {
                  this.updateDashboard(
                    updateDataContextState,
                    mapConfig,
                    selectedNode,
                    'save'
                  );
                }}
              >
                Save
              </Button>

              <br />
            </>
          );
        }}
      </DataConsumer>
    );
  }
}
