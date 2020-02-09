import React from 'react';
import { Button, Header, Form, Divider } from 'semantic-ui-react';
import { DataConsumer } from '../../../context/data';

const operators = [
  { key: 'e', text: '=', value: '=' },
  { key: 'nq', text: '!=', value: '!=' },
  { key: 'gt', text: '>', value: '>' },
  { key: 'lt', text: '<', value: '<' },
  { key: 'gte', text: '>=', value: '>=' },
  { key: 'lte', text: '<=', value: '<=' }
];

const options = [
  {
    label: 'Critical',
    op: 'alertCriticalOperator',
    val: 'alertCritical'
  },
  { label: 'Warning', op: 'alertWarningOperator', val: 'alertWarning' },
  { label: 'Healthy', op: 'alertHealthyOperator', val: 'alertHealthy' }
];

export default class CustomAlertSeverity extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      alertNrql: '',
      alertNrqlAcc: '',
      alertCritical: '',
      alertCriticalOperator: '',
      alertWarning: '',
      alertWarningOperator: '',
      alertHealthy: '',
      alertHealthyOperator: ''
    };
  }

  saveNrql = async (updateDataContextState, mapConfig, nodeId, tempState) => {
    const {
      alertNrql,
      alertNrqlAcc,
      alertCritical,
      alertCriticalOperator,
      alertWarning,
      alertWarningOperator,
      alertHealthy,
      alertHealthyOperator
    } = tempState;

    mapConfig.nodeData[nodeId].customAlert = {
      alertNrql: this.state.alertNrql || alertNrql,
      alertNrqlAcc: this.state.alertNrqlAcc || alertNrqlAcc,
      alertCritical: this.state.alertCritical || alertCritical,
      alertCriticalOperator:
        this.state.alertCriticalOperator || alertCriticalOperator,
      alertWarning: this.state.alertWarning || alertWarning,
      alertWarningOperator:
        this.state.alertWarningOperator || alertWarningOperator,
      alertHealthy: this.state.alertHealthy || alertHealthy,
      alertHealthyOperator:
        this.state.alertHealthyOperator || alertHealthyOperator
    };

    await updateDataContextState({ mapConfig }, ['saveMap']);
  };

  render() {
    return (
      <DataConsumer>
        {({ accounts, mapConfig, selectedNode, updateDataContextState }) => {
          const accountOptions = accounts.map(acc => ({
            key: acc.id,
            value: acc.id,
            text: acc.name
          }));

          const tempState = {
            alertNrql: '',
            alertNrqlAcc: '',
            alertCritical: '',
            alertCriticalOperator: '',
            alertWarning: '',
            alertWarningOperator: '',
            alertHealthy: '',
            alertHealthyOperator: ''
          };

          if (mapConfig.nodeData[selectedNode].customAlert) {
            tempState.alertNrql =
              mapConfig.nodeData[selectedNode].customAlert.alertNrql;
            tempState.alertNrqlAcc =
              mapConfig.nodeData[selectedNode].customAlert.alertNrqlAcc;
            tempState.alertCritical =
              mapConfig.nodeData[selectedNode].customAlert.alertCritical;
            tempState.alertCriticalOperator =
              mapConfig.nodeData[
                selectedNode
              ].customAlert.alertCriticalOperator;
            tempState.alertWarning =
              mapConfig.nodeData[selectedNode].customAlert.alertWarning;
            tempState.alertWarningOperator =
              mapConfig.nodeData[selectedNode].customAlert.alertWarningOperator;
            tempState.alertHealthy =
              mapConfig.nodeData[selectedNode].customAlert.alertHealthyOperator;
          }

          return (
            <>
              <Divider />

              <Header as="h4">Configure Custom Alerting</Header>
              <Header as="h5">
                Set a NRQL query that returns a single numeric value to assess,
                then set the value option as a numeric.
              </Header>

              <Divider />

              <Form.Group widths="16">
                <Form.Input
                  width="10"
                  fluid
                  label="NRQL"
                  placeholder={`SELECT average(duration) from Transaction from 'myApp'`}
                  value={
                    this.state.alertNrql === ''
                      ? tempState.alertNrql
                      : this.state.alertNrql
                  }
                  onChange={e => this.setState({ alertNrql: e.target.value })}
                />
                <Form.Select
                  search
                  width="6"
                  label="Account"
                  value={
                    this.state.alertNrqlAcc === ''
                      ? tempState.alertNrqlAcc
                      : this.state.alertNrqlAcc
                  }
                  options={accountOptions}
                  onChange={(e, d) => this.setState({ alertNrqlAcc: d.value })}
                />
              </Form.Group>

              <Header as="h5">
                Note: Critical will take precedence over all other conditions
                set.
              </Header>

              {options.map((option, i) => {
                return (
                  <div key={i}>
                    <Header as="h4">{option.label}</Header>
                    <Form.Group inline widths="16">
                      <Form.Select
                        search
                        label="Operator"
                        width="8"
                        style={{ display: 'inline', width: '100%' }}
                        options={operators}
                        placeholder="Select Operator"
                        value={
                          this.state[option.op] === ''
                            ? tempState[option.op]
                            : this.state[option.op]
                        }
                        onChange={(e, d) =>
                          this.setState({ [option.op]: d.value })
                        }
                      />
                      <Form.Input
                        width="8"
                        fluid
                        label="Value"
                        placeholder="20"
                        value={
                          this.state[option.val] === ''
                            ? tempState[option.val]
                            : this.state[option.val]
                        }
                        onChange={e =>
                          this.setState({ [option.val]: e.target.value })
                        }
                      />
                    </Form.Group>
                  </div>
                );
              })}

              <Button
                negative
                style={{ float: 'right' }}
                onClick={() =>
                  this.saveNrql(
                    updateDataContextState,
                    mapConfig,
                    selectedNode,
                    {
                      alertNrql: '',
                      alertNrqlAcc: '',
                      alertCritical: '',
                      alertCriticalOperator: '',
                      alertWarning: '',
                      alertWarningOperator: '',
                      alertHealthy: '',
                      alertHealthyOperator: ''
                    }
                  )
                }
              >
                Clear
              </Button>

              <Button
                positive
                style={{ float: 'right' }}
                onClick={() =>
                  this.saveNrql(
                    updateDataContextState,
                    mapConfig,
                    selectedNode,
                    tempState
                  )
                }
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
