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
      hm_1_NRQL: null,
      hm_2_NRQL: null,
      hm_3_NRQL: null,
      hm_1_ACC: null,
      hm_2_ACC: null,
      hm_3_ACC: null,
      selectedHoverOption: null
    };
  }

  saveNrql = async (updateDataContextState, mapConfig, linkId, tempState) => {
    const {
      hm_1_NRQL,
      hm_2_NRQL,
      hm_3_NRQL,
      hm_1_ACC,
      hm_2_ACC,
      hm_3_ACC
    } = tempState;

    mapConfig.linkData[linkId].hoverMetrics = {
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
        {({ accounts, mapConfig, selectedLink, updateDataContextState }) => {
          const accountOptions = accounts.map(acc => ({
            key: acc.id,
            value: acc.id,
            text: acc.name
          }));

          const updateHoverType = value => {
            this.setState({ selectedHoverOption: value }, () => {
              mapConfig.linkData[selectedLink].hoverType = value;
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

          if (mapConfig.linkData[selectedLink].hoverType) {
            tempState.selectedHoverOption =
              mapConfig.linkData[selectedLink].hoverType;
          }

          if (
            (((mapConfig || {}).linkData || {})[selectedLink] || {})
              .hoverMetrics ||
            null
          ) {
            if (mapConfig.linkData[selectedLink].hoverMetrics[1]) {
              tempState.hm_1_NRQL =
                mapConfig.linkData[selectedLink].hoverMetrics[1].nrql;
              tempState.hm_1_ACC =
                mapConfig.linkData[selectedLink].hoverMetrics[1].accountId;
            }
            if (mapConfig.linkData[selectedLink].hoverMetrics[2]) {
              tempState.hm_2_NRQL =
                mapConfig.linkData[selectedLink].hoverMetrics[2].nrql;
              tempState.hm_2_ACC =
                mapConfig.linkData[selectedLink].hoverMetrics[2].accountId;
            }
            if (mapConfig.linkData[selectedLink].hoverMetrics[3]) {
              tempState.hm_3_NRQL =
                mapConfig.linkData[selectedLink].hoverMetrics[3].nrql;
              tempState.hm_3_ACC =
                mapConfig.linkData[selectedLink].hoverMetrics[3].accountId;
            }
          }

          const value = name =>
            (this.state[name] != null ? this.state[name] : tempState[name]) ||
            '';

          const selectedHoverOption = value('selectedHoverOption');

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
                          value={value(`hm_${i + 1}_NRQL`)}
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
                          value={value(`hm_${i + 1}_ACC`)}
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
                        selectedLink,
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
