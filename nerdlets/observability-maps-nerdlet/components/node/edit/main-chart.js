import React from 'react';
import { Button, Header, Form } from 'semantic-ui-react';
import { DataConsumer } from '../../../context/data';
import { validateNRQL } from '../../../lib/helper';

export default class MainChart extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      mc_1_NRQL: null,
      mc_1_LABEL: null,
      mc_1_ACC: null,
      mc_1_TYPE: null
    };
  }

  saveNrql = async (updateDataContextState, mapConfig, nodeId, tempState) => {
    const { mc_1_NRQL, mc_1_LABEL, mc_1_ACC, mc_1_TYPE } = tempState;
    mapConfig.nodeData[nodeId].mainChart = {
      1: {
        nrql: this.state.mc_1_NRQL || mc_1_NRQL,
        label: this.state.mc_1_LABEL || mc_1_LABEL,
        accountId: this.state.mc_1_ACC || mc_1_ACC,
        type: this.state.mc_1_TYPE || mc_1_TYPE
      }
    };

    await updateDataContextState({ mapConfig }, ['saveMap']);
  };

  handleNrql = (e, i, nrql) => {
    // reset chart type if required
    if (
      (nrql.includes('TIMESERIES') && !e.target.value.includes('TIMESERIES')) ||
      (!nrql.includes('TIMESERIES') && e.target.value.includes('TIMESERIES'))
    ) {
      this.setState({ mc_1_TYPE: '' });
    }
    this.setState({ [`mc_${i + 1}_NRQL`]: e.target.value });
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
            mc_1_NRQL: '',
            mc_1_LABEL: '',
            mc_1_ACC: '',
            mc_1_TYPE: ''
          };

          if (
            ((((mapConfig || {}).nodeData || {})[selectedNode] || {})
              .mainChart || {})[1]
          ) {
            tempState.mc_1_NRQL =
              mapConfig.nodeData[selectedNode].mainChart[1].nrql;
            tempState.mc_1_LABEL =
              mapConfig.nodeData[selectedNode].mainChart[1].label;
            tempState.mc_1_ACC =
              mapConfig.nodeData[selectedNode].mainChart[1].accountId;
            tempState.mc_1_TYPE =
              mapConfig.nodeData[selectedNode].mainChart[1].type;
          }

          const value = name =>
            (this.state[name] != null ? this.state[name] : tempState[name]) ||
            '';

          let chartOptions = [];

          if ((value('mc_1_NRQL') || '').includes('TIMESERIES')) {
            chartOptions = [
              { key: 'line', value: 'line', text: 'Line' },
              { key: 'area', value: 'area', text: 'Area' }
            ];
          } else {
            chartOptions = [
              { key: 'billboard', value: 'billboard', text: 'Billboard' },
              { key: 'pie', value: 'pie', text: 'Pie' },
              { key: 'table', value: 'table', text: 'Table' }
            ];
          }

          return (
            <>
              <Header as="h5">Set up to 1 Custom Chart</Header>

              {[1].map((metric, i) => {
                return (
                  <Form.Group widths={16} key={i}>
                    <Form.Input
                      width={6}
                      fluid
                      label={`Query ${i + 1}`}
                      placeholder={`SELECT average(duration) as 'ms' from Transaction TIMESERIES`}
                      error={
                        validateNRQL(
                          value(`mc_${i + 1}_NRQL`),
                          value(`mc_${i + 1}_TYPE`)
                        ) || null
                      }
                      value={value(`mc_${i + 1}_NRQL`)}
                      onChange={e =>
                        this.handleNrql(e, i, value(`mc_${i + 1}_NRQL`))
                      }
                    />
                    <Form.Input
                      width={3}
                      fluid
                      label="Label"
                      placeholder="Chart name"
                      value={value(`mc_${i + 1}_LABEL`)}
                      onChange={e =>
                        this.setState({ [`mc_${i + 1}_LABEL`]: e.target.value })
                      }
                    />
                    <Form.Select
                      width={3}
                      label="Chart"
                      value={value(`mc_${i + 1}_TYPE`)}
                      options={chartOptions}
                      onChange={(e, d) =>
                        this.setState({ [`mc_${i + 1}_TYPE`]: d.value })
                      }
                    />
                    <Form.Select
                      search
                      width={4}
                      label="Account"
                      value={value(`mc_${i + 1}_ACC`)}
                      options={accountOptions}
                      onChange={(e, d) =>
                        this.setState({ [`mc_${i + 1}_ACC`]: d.value })
                      }
                    />
                  </Form.Group>
                );
              })}

              <Header as="h5">
                Tip: Validate your queries in the chart builder.
              </Header>

              <Button
                positive
                style={{ float: 'right' }}
                disabled={
                  !value('mc_1_NRQL') ||
                  !value('mc_1_ACC') ||
                  !value('mc_1_TYPE') ||
                  value('mc_1_TYPE') === '' ||
                  validateNRQL(value('mc_1_NRQL'), value('mc_1_TYPE')) !== ''
                }
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
