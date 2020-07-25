/* eslint 
no-unused-vars: 0
*/
import React from 'react';
import { Button, Header, Form, Icon } from 'semantic-ui-react';
import { DataConsumer } from '../../../context/data';

import AceEditor from 'react-ace';
import CustomNrqlMode from '../../../lib/customNrqlMode';

import 'ace-builds/src-noconflict/theme-monokai';

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
      selectedHoverOption: null,
      editorsSet: false
    };
  }

  componentDidMount() {
    const customMode = new CustomNrqlMode();
    this.aceEditor0.editor.getSession().setMode(customMode);
    this.aceEditor1.editor.getSession().setMode(customMode);
    this.aceEditor2.editor.getSession().setMode(customMode);
  }

  saveNrqlMulti = async (
    updateDataContextState,
    mapConfig,
    linkId,
    tempState
  ) => {
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

  deleteNrql = (updateDataContextState, mapConfig, linkId, no) => {
    delete mapConfig.linkData[linkId].hoverMetrics[no];
    this.setState(
      { [`hm_${no}_NRQL`]: null, [`hm_${no}_ACC`]: null },
      async () => {
        await updateDataContextState({ mapConfig }, ['saveMap']);
      }
    );
  };

  saveNrql = async (
    updateDataContextState,
    mapConfig,
    linkId,
    tempState,
    no
  ) => {
    mapConfig.linkData[linkId].hoverMetrics = {
      [no]: {
        nrql: this.state[`hm_${no}_NRQL`] || tempState[[`hm_${no}_NRQL`]],
        accountId: this.state[`hm_${no}_ACC`] || tempState[`hm_${no}_ACC`]
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
              <div
                style={{
                  display: selectedHoverOption === 'customNrql' ? '' : 'none'
                }}
              >
                <Header as="h4">Set up to 3 NRQL custom queries</Header>
                <Header as="h5">
                  Tip: Validate your queries in the chart builder.
                </Header>

                {[1, 2, 3].map((metric, i) => {
                  return (
                    <React.Fragment key={i}>
                      <Form.Group widths={16}>
                        <Form.Field width={11}>
                          <label>Query {i + 1}</label>
                          <div
                            className="App"
                            style={{
                              backgroundColor: '#202020',
                              paddingTop: '10px'
                            }}
                          >
                            <AceEditor
                              ref={c => {
                                this[`aceEditor${i}`] = c;
                              }}
                              height="27px"
                              width="100%"
                              mode="text"
                              theme="monokai"
                              name={`hm_${i + 1}_NRQL`}
                              editorProps={{ $blockScrolling: false }}
                              // maxLines={1}
                              fontFamily="monospace"
                              fontSize={14}
                              showGutter={false}
                              value={value(`hm_${i + 1}_NRQL`)}
                              onChange={str =>
                                this.setState({
                                  [`hm_${i + 1}_NRQL`]: str
                                })
                              }
                            />
                          </div>
                        </Form.Field>

                        <Form.Select
                          search
                          width={3}
                          label="Account"
                          value={value(`hm_${i + 1}_ACC`)}
                          options={accountOptions}
                          onChange={(e, d) =>
                            this.setState({ [`hm_${i + 1}_ACC`]: d.value })
                          }
                        />

                        <Form.Field width={2}>
                          <label>&nbsp;</label>
                          <div style={{ textAlign: 'right' }}>
                            <Button
                              style={{ maxWidth: '52px' }}
                              icon="check"
                              positive
                              onClick={() =>
                                this.saveNrql(
                                  updateDataContextState,
                                  mapConfig,
                                  selectedLink,
                                  tempState,
                                  i + 1
                                )
                              }
                            />
                            <Button
                              style={{ maxWidth: '52px' }}
                              icon="delete"
                              negative
                              onClick={() =>
                                this.deleteNrql(
                                  updateDataContextState,
                                  mapConfig,
                                  selectedLink,
                                  i + 1
                                )
                              }
                            />
                          </div>
                        </Form.Field>
                      </Form.Group>
                    </React.Fragment>
                  );
                })}

                {/* <Button
                    positive
                    style={{ float: 'right' }}
                    onClick={() =>
                      this.saveNrqlMulti(
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
                  </Button> */}
                <br />
              </div>
            </>
          );
        }}
      </DataConsumer>
    );
  }
}
