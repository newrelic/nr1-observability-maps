import React from 'react';
import { Modal, Button, Form } from 'semantic-ui-react';
import LinksTable from './links-table';
import { DataConsumer } from '../../context/data';

export default class ManageLinks extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      selectedLinkType: null,
      linkName: '',
      selectedSource: '',
      selectedTarget: ''
    };
    this.save = this.save.bind(this);
    this.manageLink = this.manageLink.bind(this);
  }

  save = async (mapConfig, setParentState) => {
    const { selectedAccount, selectedLinkType, linkName } = this.state;
    this.setState({ open: false });

    switch (selectedLinkType) {
      case 'custom':
        mapConfig.nodeData[linkName] = { nodeType: 'custom' };
        break;
      case 'account':
        // 0 == accountId, 1 == accountName
        const accountSplit = selectedAccount.split(/: (.+)/);
        mapConfig.nodeData[accountSplit[1]] = {
          nodeType: 'account',
          accountId: accountSplit[0]
        };
        break;
    }

    setParentState({ mapConfig }, ['saveMap', 'loadMap']);
  };

  handleOpen = () => this.setState({ open: true });
  handleClose = () =>
    this.setState({ open: false, selectedSource: '', selectedTarget: '' });

  createLinkOptions = mapConfig => {
    const linkOptions = Object.keys((mapConfig || {}).linkData || []).map(
      link => ({
        key: `${mapConfig.linkData[link].source} -> ${mapConfig.linkData[link].target}`,
        text: `${mapConfig.linkData[link].source} -> ${mapConfig.linkData[link].target}`,
        value: `${mapConfig.linkData[link].source} -> ${mapConfig.linkData[link].target}`
      })
    );
    linkOptions.unshift({ key: 'n', text: 'Create a New Link', value: 'new' });
    return linkOptions;
  };

  createNodeOptions = mapConfig => {
    return Object.keys((mapConfig || {}).nodeData || []).map(node => ({
      key: node,
      text: node,
      value: node
    }));
  };

  // clean this up to just send modified mapConfig
  manageLink = async (
    action,
    mapConfig,
    updateDataContextState,
    incomingSelectedSource,
    incomingSelectedTarget
  ) => {
    const selectedSource = incomingSelectedSource || this.state.selectedSource;
    const selectedTarget = incomingSelectedTarget || this.state.selectedTarget;

    if (action === 'add') {
      mapConfig.linkData[`${selectedSource}:::${selectedTarget}`] = {
        source: selectedSource,
        target: selectedTarget
      };
    } else if (action === 'del') {
      delete mapConfig.linkData[`${selectedSource}:::${selectedTarget}`];
    }

    updateDataContextState({ mapConfig }, ['saveMap']);
  };

  render() {
    const {
      open,
      selectedLinkType,
      linkName,
      selectedTarget,
      selectedSource
    } = this.state;

    return (
      <DataConsumer>
        {({ mapConfig, updateDataContextState }) => {
          const nodeOptions = this.createNodeOptions(mapConfig);

          const customLinkErrorContent = { content: '', pointing: 'above' };

          // needs handling for existing nodes
          if (selectedLinkType === 'custom') {
            if (linkName.length === 0) {
              customLinkErrorContent.content = 'Please enter a node name';
            }
          }

          const foundLink = !!(
            mapConfig &&
            mapConfig.linkData &&
            mapConfig.linkData[`${selectedSource}:::${selectedTarget}`]
          );

          return (
            <Modal
              open={open}
              onClose={this.handleClose}
              size="small"
              trigger={
                <Button
                  onClick={() => this.setState({ open: true })}
                  className="filter-button"
                  icon="linkify"
                  content="Links"
                />
              }
              onUnmount={() => updateDataContextState({ closeCharts: false })}
              onMount={() => updateDataContextState({ closeCharts: true })}
            >
              <Modal.Header>Manage Links</Modal.Header>
              <Modal.Content>
                <Form>
                  <Form.Select
                    search
                    // label='Node Source'
                    options={nodeOptions}
                    placeholder="Select Node Source..."
                    value={selectedSource}
                    onChange={(e, d) =>
                      this.setState({ selectedSource: d.value })
                    }
                  />
                  <Form.Group widths={16}>
                    <Form.Select
                      width={13}
                      disabled={!selectedSource}
                      search
                      // label='Node Target'
                      options={nodeOptions}
                      placeholder="Select Node Target..."
                      value={selectedTarget}
                      onChange={(e, d) =>
                        this.setState({ selectedTarget: d.value })
                      }
                      style={{ width: '100%' }}
                    />
                    {foundLink ? (
                      <Form.Button
                        width={3}
                        disabled={!selectedSource || !selectedTarget}
                        style={{ float: 'right', height: '38px' }}
                        content="Delete"
                        icon="minus"
                        onClick={() =>
                          this.manageLink(
                            'del',
                            mapConfig,
                            updateDataContextState
                          )
                        }
                      />
                    ) : (
                      <Form.Button
                        width={3}
                        disabled={!selectedSource || !selectedTarget}
                        style={{ float: 'right', height: '38px' }}
                        content="Add"
                        icon="plus"
                        onClick={() =>
                          this.manageLink(
                            'add',
                            mapConfig,
                            updateDataContextState
                          )
                        }
                      />
                    )}
                  </Form.Group>
                </Form>
                {selectedSource ? (
                  <LinksTable
                    selectedSource={selectedSource}
                    manageLink={this.manageLink}
                  />
                ) : (
                  ''
                )}
              </Modal.Content>
            </Modal>
          );
        }}
      </DataConsumer>
    );
  }
}
