/* eslint 
no-console: 0,
react/no-did-update-set-state: 0,
react/no-string-refs: 0
*/

import React from 'react';
import { Button, Modal, Header, Form, Divider, Icon } from 'semantic-ui-react';

export default class EditNode extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isSaving: false,
      selectedEditOption: '',
      selectedHoverOption: null,
      loaded: '',
      hm_1_NRQL: '',
      hm_2_NRQL: '',
      hm_3_NRQL: '',
      hm_1_ACC: '',
      hm_2_ACC: '',
      hm_3_ACC: '',
      mc_1_NRQL: '',
      mc_1_ACC: '',
      mc_1_TYPE: '',
      iconSet: 'default',
      alertNrql: '',
      alertNrqlAcc: '',
      alertCritical: '',
      alertCriticalOperator: '',
      alertWarning: '',
      alertWarningOperator: '',
      alertHealthy: '',
      alertHealthyOperator: ''
    };
    this.saveNrql = this.saveNrql.bind(this);
  }

  componentDidUpdate() {
    const { mapConfig, selectedNode } = this.props;
    const { loaded } = this.state;

    if (mapConfig && mapConfig.nodeData && mapConfig.nodeData[selectedNode]) {
      if (loaded !== selectedNode) {
        this.setState({
          loaded: selectedNode,
          hm_1_NRQL: '',
          hm_2_NRQL: '',
          hm_3_NRQL: '',
          hm_1_ACC: '',
          hm_2_ACC: '',
          hm_3_ACC: '',
          mc_1_NRQL: '',
          mc_1_ACC: '',
          mc_1_TYPE: '',
          iconSet: 'default',
          alertNrql: '',
          alertNrqlAcc: '',
          alertCritical: '',
          alertCriticalOperator: '',
          alertWarning: '',
          alertWarningOperator: '',
          alertHealthy: '',
          alertHealthyOperator: ''
        });
        if (mapConfig.nodeData[selectedNode].hoverMetrics) {
          this.setState({
            hm_1_NRQL: mapConfig.nodeData[selectedNode].hoverMetrics[1].nrql,
            hm_2_NRQL: mapConfig.nodeData[selectedNode].hoverMetrics[2].nrql,
            hm_3_NRQL: mapConfig.nodeData[selectedNode].hoverMetrics[3].nrql,
            hm_1_ACC:
              mapConfig.nodeData[selectedNode].hoverMetrics[1].accountId,
            hm_2_ACC:
              mapConfig.nodeData[selectedNode].hoverMetrics[2].accountId,
            hm_3_ACC: mapConfig.nodeData[selectedNode].hoverMetrics[3].accountId
          });
        }
        if (mapConfig.nodeData[selectedNode].mainChart) {
          this.setState({
            mc_1_NRQL: mapConfig.nodeData[selectedNode].mainChart[1].nrql,
            mc_1_ACC: mapConfig.nodeData[selectedNode].mainChart[1].accountId,
            mc_1_TYPE: mapConfig.nodeData[selectedNode].mainChart[1].type
          });
        }
        if (mapConfig.nodeData[selectedNode].iconSet) {
          this.setState({
            iconSet: mapConfig.nodeData[selectedNode].iconSet
          });
        }
        if (mapConfig.nodeData[selectedNode].customAlert) {
          this.setState({
            alertNrql: mapConfig.nodeData[selectedNode].customAlert.alertNrql,
            alertNrqlAcc:
              mapConfig.nodeData[selectedNode].customAlert.alertNrqlAcc,
            alertCritical:
              mapConfig.nodeData[selectedNode].customAlert.alertCritical,
            alertCriticalOperator:
              mapConfig.nodeData[selectedNode].customAlert
                .alertCriticalOperator,
            alertWarning:
              mapConfig.nodeData[selectedNode].customAlert.alertWarning,
            alertWarningOperator:
              mapConfig.nodeData[selectedNode].customAlert.alertWarningOperator,
            alertHealthy:
              mapConfig.nodeData[selectedNode].customAlert.alertHealthy,
            alertHealthyOperator:
              mapConfig.nodeData[selectedNode].customAlert.alertHealthyOperator
          });
        }
      }
    }
  }

  async saveNrql(setParentState, mapConfig, nodeId, val) {
    await this.setState({ isSaving: true });
    const {
      selectedEditOption,
      hm_1_NRQL,
      hm_2_NRQL,
      hm_3_NRQL,
      hm_1_ACC,
      hm_2_ACC,
      hm_3_ACC,
      mc_1_ACC,
      mc_1_NRQL,
      mc_1_TYPE,
      alertNrql,
      alertNrqlAcc,
      alertCritical,
      alertCriticalOperator,
      alertWarning,
      alertWarningOperator,
      alertHealthy,
      alertHealthyOperator
    } = this.state;

    if (selectedEditOption === 'hoverMetrics') {
      mapConfig.nodeData[nodeId].hoverMetrics = {
        1: { nrql: hm_1_NRQL, accountId: hm_1_ACC },
        2: { nrql: hm_2_NRQL, accountId: hm_2_ACC },
        3: { nrql: hm_3_NRQL, accountId: hm_3_ACC }
      };
    } else if (selectedEditOption === 'mainChart') {
      mapConfig.nodeData[nodeId].mainChart = {
        1: { nrql: mc_1_NRQL, accountId: mc_1_ACC, type: mc_1_TYPE }
      };
    } else if (selectedEditOption === 'iconSet') {
      this.setState({ iconSet: val });
      if (val === 'default') {
        delete mapConfig.nodeData[nodeId].iconSet;
      } else {
        mapConfig.nodeData[nodeId].iconSet = val;
      }
    } else if (selectedEditOption === 'customAlertSeverity') {
      mapConfig.nodeData[nodeId].customAlert = {
        alertNrql,
        alertNrqlAcc,
        alertCritical,
        alertCriticalOperator,
        alertWarning,
        alertWarningOperator,
        alertHealthy,
        alertHealthyOperator
      };
    }

    await setParentState({ mapConfig }, ['saveMap']);
    await this.setState({ isSaving: false });
  }

  render() {
    const {
      mapConfig,
      setParentState,
      editNodeOpen,
      selectedNode,
      accounts
    } = this.props;
    const { selectedEditOption, selectedHoverOption } = this.state;

    const editOptions = [
      { key: 'hm', text: 'Hover Metrics', value: 'hoverMetrics' },
      { key: 'mc', text: 'Main Chart', value: 'mainChart' },
      { key: 'i', text: 'Icon Set', value: 'iconSet' },
      {
        key: 'ca',
        text: 'Custom Alert Severity',
        value: 'customAlertSeverity'
      }
      // { key: 'cxy', text: 'Coordinates', value: 'coordinates' }
    ];

    // if ((((mapConfig || {}).nodeData || {})[selectedNode] || {}).entityType || "" == "CUSTOM_NODE") {
    //     console.log(mapConfig.nodeData[selectedNode].entityType);
    //     editOptions.unshift({ key: "n", text: "Name", value: "name" });
    // }

    const hoverOptions = [
      { key: 'd', text: 'Default', value: 'default' },
      { key: 'c', text: 'Custom NRQL', value: 'customNrql' }
    ];

    const updateHoverType = value => {
      this.setState({ selectedHoverOption: value });
      mapConfig.nodeData[selectedNode].hoverType = value;
      setParentState({ mapConfig }, ['saveMap']);
    };

    const hoverOption =
      mapConfig && mapConfig.nodeData[selectedNode]
        ? mapConfig.nodeData[selectedNode].hoverType
        : selectedHoverOption;

    const onEditDropDown = () => {
      this.setState({
        selectedEditOption: '',
        selectedHoverOption: ''
      });
      setParentState({ editNodeOpen: false });
    };

    const renderCustomNrql = () => {
      const accountOptions = accounts.map(acc => ({
        key: acc.id,
        value: acc.id,
        text: acc.name
      }));
      return (
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
                  value={this.state[`hm_${i + 1}_NRQL`]}
                  onChange={e =>
                    this.setState({ [`hm_${i + 1}_NRQL`]: e.target.value })
                  }
                />
                <Form.Select
                  width={4}
                  label="Account"
                  value={this.state[`hm_${i + 1}_ACC`]}
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
              this.saveNrql(setParentState, mapConfig, selectedNode)
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
      );
    };

    const renderMainChart = () => {
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

      return (
        <>
          <Header as="h4">Set up to 1 Custom Chart</Header>
          <Header as="h5">
            Tip: Validate your queries in the chart builder.
          </Header>

          {[1].map((metric, i) => {
            return (
              <Form.Group widths={16} key={i}>
                <Form.Input
                  width={9}
                  fluid
                  label={`Query ${i + 1}`}
                  placeholder={`SELECT average(duration) as 'ms' from Transaction TIMESERIES`}
                  value={this.state[`mc_${i + 1}_NRQL`]}
                  onChange={e =>
                    this.setState({ [`mc_${i + 1}_NRQL`]: e.target.value })
                  }
                />
                <Form.Select
                  width={3}
                  label="Chart"
                  value={this.state[`mc_${i + 1}_TYPE`]}
                  options={chartOptions}
                  onChange={(e, d) =>
                    this.setState({ [`mc_${i + 1}_TYPE`]: d.value })
                  }
                />
                <Form.Select
                  width={4}
                  label="Account"
                  value={this.state[`mc_${i + 1}_ACC`]}
                  options={accountOptions}
                  onChange={(e, d) =>
                    this.setState({ [`mc_${i + 1}_ACC`]: d.value })
                  }
                />
              </Form.Group>
            );
          })}

          <Button
            positive
            style={{ float: 'right' }}
            onClick={() =>
              this.saveNrql(setParentState, mapConfig, selectedNode)
            }
          >
            Save
          </Button>
          <br />
        </>
      );
    };

    const renderIconSet = () => {
      const userIcons = this.props.userIcons.map(set => ({
        key: set.id,
        value: set.id,
        text: set.id
      }));
      userIcons.unshift({ key: 'default', text: 'Default', value: 'default' });

      return (
        <>
          <Header as="h4">Select an Icon Set</Header>

          <Form.Group inline widths="16">
            <Form.Select
              width="16"
              style={{ display: 'inline', width: '100%' }}
              search
              options={userIcons}
              placeholder="Select Icon Set"
              value={this.state.iconSet}
              onChange={(e, d) =>
                this.saveNrql(setParentState, mapConfig, selectedNode, d.value)
              }
            />
          </Form.Group>
          <br />
        </>
      );
    };

    const renderCustomAlerting = () => {
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

      const accountOptions = accounts.map(acc => ({
        key: acc.id,
        value: acc.id,
        text: acc.name
      }));

      return (
        <>
          <Divider />

          <Header as="h4">Configure Custom Alerting</Header>
          <Header as="h5">
            Set a NRQL query that returns a single numeric value to assess, then
            set the value option as a numeric.
          </Header>

          <Divider />

          <Form.Group widths="16">
            <Form.Input
              width="10"
              fluid
              label="NRQL"
              placeholder={`SELECT average(duration) from Transaction from 'myApp'`}
              value={this.state.alertNrql}
              onChange={e => this.setState({ alertNrql: e.target.value })}
            />
            <Form.Select
              width="6"
              label="Account"
              value={this.state.alertNrqlAcc}
              options={accountOptions}
              onChange={(e, d) => this.setState({ alertNrqlAcc: d.value })}
            />
          </Form.Group>

          {options.map((option, i) => {
            return (
              <div key={i}>
                <Header as="h4">{option.label}</Header>
                <Form.Group inline widths="16">
                  <Form.Select
                    label="Operator"
                    width="8"
                    style={{ display: 'inline', width: '100%' }}
                    options={operators}
                    placeholder="Select Operator"
                    value={this.state[option.op]}
                    onChange={(e, d) => this.setState({ [option.op]: d.value })}
                  />
                  <Form.Input
                    width="8"
                    fluid
                    label="Value"
                    placeholder="20"
                    value={this.state[option.val]}
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
            onClick={async () => {
              await this.setState({
                alertNrql: '',
                alertNrqlAcc: '',
                alertCritical: '',
                alertCriticalOperator: '',
                alertWarning: '',
                alertWarningOperator: '',
                alertHealthy: '',
                alertHealthyOperator: ''
              });
              this.saveNrql(setParentState, mapConfig, selectedNode);
            }}
          >
            Clear
          </Button>

          <Button
            positive
            style={{ float: 'right' }}
            onClick={() =>
              this.saveNrql(setParentState, mapConfig, selectedNode)
            }
          >
            Save
          </Button>

          <br />
        </>
      );
    };

    return (
      <Modal
        size="large"
        open={editNodeOpen}
        onUnmount={() => setParentState({ closeCharts: false })}
        onMount={() => setParentState({ closeCharts: true })}
      >
        <Modal.Header>Edit Node - {selectedNode}</Modal.Header>

        <Modal.Content>
          <Form>
            <Form.Group>
              <Form.Select
                label="Edit"
                options={editOptions}
                placeholder="Select Option"
                onChange={(e, d) =>
                  this.setState({ selectedEditOption: d.value })
                }
              />
              {selectedEditOption === 'hoverMetrics' ? (
                <Form.Select
                  label="Type"
                  options={hoverOptions}
                  placeholder="Select Option"
                  value={hoverOption}
                  onChange={(e, d) => updateHoverType(d.value)}
                />
              ) : (
                ''
              )}
            </Form.Group>

            {selectedEditOption === 'hoverMetrics' &&
            hoverOption === 'customNrql'
              ? renderCustomNrql()
              : ''}
            {selectedEditOption === 'mainChart' ? renderMainChart() : ''}
            {selectedEditOption === 'iconSet' ? renderIconSet() : ''}
            {selectedEditOption === 'customAlertSeverity'
              ? renderCustomAlerting()
              : ''}
          </Form>
        </Modal.Content>

        <Modal.Actions>
          <Button negative onClick={onEditDropDown}>
            Close
          </Button>
          {/* <Button positive onClick={()=>this.save(setParentState, mapConfig)}>Save</Button> */}
        </Modal.Actions>
      </Modal>
    );
  }
}
