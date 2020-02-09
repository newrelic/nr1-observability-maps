import React from 'react';
import { Button, Header, Form } from 'semantic-ui-react';
import { DataConsumer } from '../../../context/data';

export default class MainChart extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      mc_1_NRQL: '',
      mc_1_ACC: '',
      mc_1_TYPE: ''
    };
  }

  saveNrql = async (
    updateDataContextState,
    mapConfig,
    nodeId,
    mc_1_NRQL,
    mc_1_ACC,
    mc_1_TYPE
  ) => {
    mapConfig.nodeData[nodeId].mainChart = {
      1: {
        nrql: this.state.mc_1_NRQL || mc_1_NRQL,
        accountId: this.state.mc_1_ACC || mc_1_ACC,
        type: this.state.mc_1_TYPE || mc_1_TYPE
      }
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

          const chartOptions = [
            { key: 'line', value: 'line', text: 'Line' },
            { key: 'area', value: 'area', text: 'Area' },
            { key: 'billboard', value: 'billboard', text: 'Billboard' },
            { key: 'pie', value: 'pie', text: 'Pie' },
            { key: 'table', value: 'table', text: 'Table' }
          ];

          let mc_1_NRQL = '';
          let mc_1_ACC = '';
          let mc_1_TYPE = '';

          if (
            ((((mapConfig || {}).nodeData || {})[selectedNode] || {})
              .mainChart || {})[1]
          ) {
            mc_1_NRQL = mapConfig.nodeData[selectedNode].mainChart[1].nrql;
            mc_1_ACC = mapConfig.nodeData[selectedNode].mainChart[1].accountId;
            mc_1_TYPE = mapConfig.nodeData[selectedNode].mainChart[1].type;
          }

          return (
            <>
              <Header as="h5">Set up to 1 Custom Chart</Header>

              {[1].map((metric, i) => {
                return (
                  <Form.Group widths={16} key={i}>
                    <Form.Input
                      width={9}
                      fluid
                      label={`Query ${i + 1}`}
                      placeholder={`SELECT average(duration) as 'ms' from Transaction TIMESERIES`}
                      value={
                        this.state[`mc_${i + 1}_NRQL`] === ''
                          ? mc_1_NRQL
                          : this.state[`mc_${i + 1}_NRQL`]
                      }
                      onChange={e =>
                        this.setState({ [`mc_${i + 1}_NRQL`]: e.target.value })
                      }
                    />
                    <Form.Select
                      width={3}
                      label="Chart"
                      value={
                        this.state[`mc_${i + 1}_TYPE`] === ''
                          ? mc_1_TYPE
                          : this.state[`mc_${i + 1}_TYPE`]
                      }
                      options={chartOptions}
                      onChange={(e, d) =>
                        this.setState({ [`mc_${i + 1}_TYPE`]: d.value })
                      }
                    />
                    <Form.Select
                      search
                      width={4}
                      label="Account"
                      value={
                        this.state[`mc_${i + 1}_ACC`] === ''
                          ? mc_1_ACC
                          : this.state[`mc_${i + 1}_ACC`]
                      }
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
                onClick={() =>
                  this.saveNrql(
                    updateDataContextState,
                    mapConfig,
                    selectedNode,
                    mc_1_NRQL,
                    mc_1_ACC,
                    mc_1_TYPE
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
