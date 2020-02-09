import React from 'react';
import { Button, Header, Form, Icon } from 'semantic-ui-react';
import { DataConsumer } from '../../../context/data';

const hoverOptions = [
  { key: 'd', text: 'Default', value: 'default' },
  { key: 'c', text: 'Custom NRQL', value: 'customNrql' }
];

export default class HoverMetrics extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      hm_1_NRQL: '',
      hm_2_NRQL: '',
      hm_3_NRQL: '',
      hm_1_ACC: '',
      hm_2_ACC: '',
      hm_3_ACC: '',
      selectedHoverOption: ''
    };
  }

  saveNrql = async (updateDataContextState, mapConfig, nodeId, tempState) => {
    const {
      hm_1_NRQL,
      hm_2_NRQL,
      hm_3_NRQL,
      hm_1_ACC,
      hm_2_ACC,
      hm_3_ACC
    } = tempState;

    mapConfig.nodeData[nodeId].hoverMetrics = {
      1: {
        nrql: this.state.hm_1_NRQL || hm_1_NRQL,
        accountId: this.state.hm_1_ACC || hm_1_ACC
      },
      2: {
        nrql: this.state.hm_2_NRQL || hm_2_NRQL,
        accountId: this.state.hm_2_ACC || hm_2_ACC
      },
      3: {
        nrql: this.state.hm_3_NRQL || hm_3_NRQL,
        accountId: this.state.hm_3_ACC || hm_3_ACC
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

          const updateHoverType = value => {
            this.setState({ selectedHoverOption: value }, () => {
              mapConfig.nodeData[selectedNode].hoverType = value;
              updateDataContextState({ mapConfig }, ['saveMap']);
            });
          };

          const tempState = {
            hm_1_NRQL: '',
            hm_2_NRQL: '',
            hm_3_NRQL: '',
            hm_1_ACC: '',
            hm_2_ACC: '',
            hm_3_ACC: '',
            selectedHoverOption: ''
          };

          if (mapConfig.nodeData[selectedNode].hoverType) {
            tempState.selectedHoverOption =
              mapConfig.nodeData[selectedNode].hoverType;
          }

          if (
            (((mapConfig || {}).nodeData || {})[selectedNode] || {})
              .hoverMetrics ||
            null
          ) {
            if (mapConfig.nodeData[selectedNode].hoverMetrics[1]) {
              tempState.hm_1_NRQL =
                mapConfig.nodeData[selectedNode].hoverMetrics[1].nrql;
              tempState.hm_1_ACC =
                mapConfig.nodeData[selectedNode].hoverMetrics[1].accountId;
            }
            if (mapConfig.nodeData[selectedNode].hoverMetrics[2]) {
              tempState.hm_2_NRQL =
                mapConfig.nodeData[selectedNode].hoverMetrics[2].nrql;
              tempState.hm_2_ACC =
                mapConfig.nodeData[selectedNode].hoverMetrics[2].accountId;
            }
            if (mapConfig.nodeData[selectedNode].hoverMetrics[3]) {
              tempState.hm_3_NRQL =
                mapConfig.nodeData[selectedNode].hoverMetrics[3].nrql;
              tempState.hm_3_ACC =
                mapConfig.nodeData[selectedNode].hoverMetrics[3].accountId;
            }
          }

          const selectedHoverOption =
            this.state.selectedHoverOption === ''
              ? tempState.selectedHoverOption
              : this.state.selectedHoverOption;

          return (
            <>
              <Form.Group>
                <Form.Select
                  label="Type"
                  options={hoverOptions}
                  placeholder="Select Option"
                  value={selectedHoverOption}
                  onChange={(e, d) => updateHoverType(d.value)}
                />
              </Form.Group>

              {selectedHoverOption === 'customNrql' ? (
                <>
                  <Header as="h4">Set up to 3 NRQL custom queries</Header>
                  <Header as="h5">
                    Tip: Validate your queries in the chart builder.
                  </Header>

                  {[1, 2, 3].map((metric, i) => {
                    return (
                      <Form.Group widths={16} key={i}>
                        <Form.Input
                          width={12}
                          fluid
                          label={`Query ${i + 1}`}
                          placeholder={`SELECT average(duration) as 'ms' from Transaction`}
                          value={
                            this.state[`hm_${i + 1}_NRQL`] === ''
                              ? tempState[`hm_${i + 1}_NRQL`]
                              : this.state[`hm_${i + 1}_NRQL`]
                          }
                          onChange={e =>
                            this.setState({
                              [`hm_${i + 1}_NRQL`]: e.target.value
                            })
                          }
                        />
                        <Form.Select
                          search
                          width={4}
                          label="Account"
                          value={
                            this.state[`hm_${i + 1}_ACC`] === ''
                              ? tempState[`hm_${i + 1}_ACC`]
                              : this.state[`hm_${i + 1}_ACC`]
                          }
                          options={accountOptions}
                          onChange={(e, d) =>
                            this.setState({ [`hm_${i + 1}_ACC`]: d.value })
                          }
                        />
                      </Form.Group>
                    );
                  })}

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
                    <Icon
                      name="spinner"
                      loading
                      style={{
                        backgroundColor: 'transparent',
                        display: this.state.isSaving ? '' : 'none'
                      }}
                    />
                    Save
                  </Button>
                  <br />
                </>
              ) : (
                ''
              )}
            </>
          );
        }}
      </DataConsumer>
    );
  }
}
