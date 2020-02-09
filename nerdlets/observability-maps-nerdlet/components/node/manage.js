/* eslint 
no-console: 0
*/
import React from 'react';
import { Modal, Button, Form, Table, Menu, Input } from 'semantic-ui-react';
import { nerdGraphQuery, entitySearchByAccountQuery } from '../../lib/utils';
import DeleteNode from './delete-node';
import { DataConsumer } from '../../context/data';

const options = [
  { key: 'e', text: 'Entity', value: 'entity' },
  { key: 'a', text: 'Account', value: 'account' },
  { key: 'c', text: 'Custom', value: 'custom' }
];

const domainOptions = [
  { key: 'a', text: 'APM', value: 'APM' },
  { key: 'b', text: 'BROWSER', value: 'BROWSER' },
  { key: 'm', text: 'MOBILE', value: 'MOBILE' },
  { key: 'i', text: 'INFRA', value: 'INFRA' },
  { key: 's', text: 'SYNTH', value: 'SYNTH' }
];

export default class ManageNodes extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      selectedNodeType: null,
      selectedAccount: null,
      customNodeName: '',
      selectedDomain: '',
      searchedEntities: [],
      activeNodeItem: 'Add Node',
      showSearchMsg: false,
      searchText: ''
    };
  }

  action = async (action, mapConfig, updateDataContextState, entity, node) => {
    let { selectedAccount, selectedNodeType, customNodeName } = this.state;
    this.setState({ open: false });

    if (entity) selectedNodeType = 'entity';
    if (node) selectedNodeType = 'node';

    switch (action) {
      case 'add':
        switch (selectedNodeType) {
          case 'custom':
            mapConfig.nodeData[customNodeName] = { entityType: 'CUSTOM_NODE' };
            break;
          case 'account':
            // 0 == accountId, 1 == accountName
            const accountSplit = selectedAccount.split(/: (.+)/);
            mapConfig.nodeData[accountSplit[1]] = {
              accountId: accountSplit[0],
              entityType: 'CUSTOM_ACCOUNT'
            };
            break;
          case 'entity':
            mapConfig.nodeData[`${entity.name} [${entity.domain}]`] = {
              nodeType: 'entity',
              entityType: entity.entityType,
              guid: entity.guid
            };
            break;
        }
        break;
      case 'del':
        // ensure links are deleted first
        switch (selectedNodeType) {
          case 'account':
            // 0 == accountId, 1 == accountName
            const accountSplit = selectedAccount.split(/: (.+)/);

            // clean up links
            Object.keys(mapConfig.linkData).forEach(link => {
              if (
                link.includes(`${accountSplit[1]}:::`) ||
                link.includes(`:::${accountSplit[1]}`)
              ) {
                delete mapConfig.linkData[link];
              }
            });

            delete mapConfig.nodeData[accountSplit[1]];
            break;
          case 'entity':
            // clean up links
            Object.keys(mapConfig.linkData).forEach(link => {
              if (
                link.includes(`${accountSplit[1]}:::`) ||
                link.includes(`:::${accountSplit[1]}`)
              ) {
                delete mapConfig.linkData[link];
              }
            });

            // keep both deletes for backwards compatibility
            delete mapConfig.nodeData[entity.name];
            delete mapConfig.nodeData[`${entity.name} [${entity.domain}]`];
            break;
          case 'node':
            // clean up links
            Object.keys(mapConfig.linkData).forEach(link => {
              if (link.includes(`${node}:::`) || link.includes(`:::${node}`)) {
                delete mapConfig.linkData[link];
              }
            });

            delete mapConfig.nodeData[node];
            break;
        }
        break;
    }

    updateDataContextState({ mapConfig }, ['saveMap']);
    this.setState({
      selectedNodeType: null,
      searchedEntities: [],
      customNodeName: ''
    });
  };

  fetchEntities = async cursor => {
    let { selectedAccount, selectedDomain, searchedEntities } = this.state;
    // if no cursor its a new search so empty entities
    if (!cursor) {
      searchedEntities = [];
    }
    const accountSplit = selectedAccount.split(/: (.+)/);
    const nerdGraphResult = await nerdGraphQuery(
      entitySearchByAccountQuery(
        selectedDomain,
        accountSplit[0] === '0' ? null : accountSplit[0],
        cursor
      )
    );
    const entitySearchResults =
      (((nerdGraphResult || {}).actor || {}).entitySearch || {}).results || {};
    // let foundGuids = ((entitySearchResults || {}).entities || []).map((result)=>result.guid)

    searchedEntities = [...searchedEntities, ...entitySearchResults.entities];
    this.setState({ searchedEntities }, () => {
      if (entitySearchResults.nextCursor) {
        console.log(
          'collecting next entitySearch batch guid:',
          entitySearchResults.nextCursor
        );
        this.fetchEntities(entitySearchResults.nextCursor);
      } else {
        // console.log("complete", this.state.searchedEntities.length)
      }
      this.setState({ showSearchMsg: true });
    });
  };

  handleOpen = () =>
    this.setState({ open: true, searchText: '', customNodeName: '' });

  handleClose = () => this.setState({ open: false, customNodeName: '' });

  handleItemClick = (e, { name }) =>
    this.setState({ activeNodeItem: name, searchText: '' });

  render() {
    const {
      open,
      selectedNodeType,
      customNodeName,
      selectedAccount,
      selectedDomain,
      searchedEntities,
      activeNodeItem,
      showSearchMsg,
      searchText
    } = this.state;

    return (
      <DataConsumer>
        {({ accounts, mapConfig, updateDataContextState }) => {
          const accountOptions = accounts.map(account => ({
            key: account.id,
            text: `${account.id}: ${account.name}`,
            value: `${account.id}: ${account.name}`
          }));

          accountOptions.sort((a, b) => {
            if (a.key < b.key) {
              return -1;
            }
            if (a.key > b.key) {
              return 1;
            }
            return 0;
          });

          accountOptions.unshift({
            key: 'All Accounts',
            text: '0: All Accounts',
            value: '0: All Accounts'
          });

          const customNodeError = { content: '', pointing: 'above' };
          if (selectedNodeType === 'custom') {
            if (customNodeName.length === 0) {
              customNodeError.content = 'Please enter a node name';
            } else if (
              // check for duplicate
              Object.keys(mapConfig.nodeData || {}).filter(
                node => node === customNodeName
              ).length > 0
            ) {
              customNodeError.content = 'Please enter a unique node name';
            }
          }

          const createDisabled =
            !selectedNodeType ||
            selectedNodeType === 'entity' ||
            (selectedNodeType === 'custom' && customNodeError.content !== '') ||
            (selectedNodeType === 'account' && !selectedAccount);

          return (
            <Modal
              closeIcon
              open={open}
              onClose={this.handleClose}
              size="large"
              trigger={
                <Button
                  onClick={() => this.setState({ open: true })}
                  className="filter-button"
                  icon="block layout"
                  content="Nodes"
                  id="nodesbtn"
                />
              }
              onUnmount={() => {
                updateDataContextState({ closeCharts: false });
                this.setState({ showSearchMsg: false });
              }}
              onMount={() => updateDataContextState({ closeCharts: true })}
            >
              <Menu size="huge" pointing secondary>
                <Menu.Item
                  name="Add Node"
                  active={activeNodeItem === 'Add Node'}
                  onClick={this.handleItemClick}
                />
                <Menu.Item
                  name="Delete Node"
                  active={activeNodeItem === 'Delete Node'}
                  onClick={this.handleItemClick}
                />
              </Menu>
              <Modal.Content
                style={{ display: activeNodeItem === 'Add Node' ? '' : 'none' }}
              >
                <Form>
                  <Form.Select
                    label="Type"
                    options={options}
                    placeholder="Select Type..."
                    value={selectedNodeType}
                    onChange={(e, d) =>
                      this.setState({ selectedNodeType: d.value })
                    }
                  />

                  {selectedNodeType === 'entity' ? (
                    <>
                      {' '}
                      <Form.Group widths="16">
                        <Form.Select
                          width="5"
                          label="Domain"
                          options={domainOptions}
                          placeholder="Select Domain..."
                          onChange={(e, d) =>
                            this.setState({ selectedDomain: d.value })
                          }
                        />
                        <Form.Select
                          width="8"
                          search
                          label="Account"
                          options={accountOptions}
                          placeholder="Select Account..."
                          onChange={(e, d) =>
                            this.setState({ selectedAccount: d.value })
                          }
                        />
                        <Form.Button
                          disabled={!selectedAccount || !selectedDomain}
                          label="&nbsp;"
                          width="3"
                          content="Fetch Entities"
                          onClick={() => {
                            this.fetchEntities();
                          }}
                        />
                      </Form.Group>
                      <Form.Group
                        style={{
                          display: searchedEntities.length === 0 ? 'none' : ''
                        }}
                      >
                        <Form.Field
                          width="16"
                          control={Input}
                          label="Search"
                          placeholder="My service..."
                          onChange={e =>
                            this.setState({ searchText: e.target.value })
                          }
                        />
                      </Form.Group>
                      <div
                        style={{
                          overflowY: 'scroll',
                          height: '300px',
                          display:
                            searchedEntities.length === 0 && showSearchMsg
                              ? ''
                              : 'none'
                        }}
                      >
                        No entities found with tags.accountId =
                        {selectedAccount
                          ? ` ${selectedAccount.replace(':', ' for')}`
                          : ''}
                        .
                      </div>
                      <div
                        style={{
                          overflowY: 'scroll',
                          height: '300px',
                          display: searchedEntities.length === 0 ? 'none' : ''
                        }}
                      >
                        <Table compact>
                          <Table.Body>
                            {searchedEntities
                              .filter(entity =>
                                entity.name
                                  ? entity.name
                                      .toLowerCase()
                                      .includes(searchText.toLowerCase())
                                  : false
                              )
                              .map((entity, i) => {
                                // keep both for backwards compatibility
                                const exists =
                                  mapConfig.nodeData[entity.name] ||
                                  mapConfig.nodeData[
                                    `${entity.name} [${entity.domain}]`
                                  ];
                                return (
                                  <Table.Row key={i}>
                                    <Table.Cell>{entity.name}</Table.Cell>
                                    <Table.Cell>
                                      <Button
                                        style={{ float: 'right' }}
                                        onClick={() =>
                                          this.action(
                                            exists ? 'del' : 'add',
                                            mapConfig,
                                            updateDataContextState,
                                            entity
                                          )
                                        }
                                      >
                                        {exists ? 'Delete' : 'Add'}
                                      </Button>
                                    </Table.Cell>
                                  </Table.Row>
                                );
                              })}
                          </Table.Body>
                        </Table>
                      </div>
                    </>
                  ) : (
                    ''
                  )}

                  {selectedNodeType === 'custom' ? (
                    <Form.Input
                      error={
                        customNodeError.content ? customNodeError.content : null
                      }
                      fluid
                      value={customNodeName}
                      onChange={e =>
                        this.setState({ customNodeName: e.target.value })
                      }
                      placeholder="Name..."
                    />
                  ) : (
                    ''
                  )}

                  {selectedNodeType === 'account' ? (
                    <Form.Select
                      search
                      label="Account"
                      options={accountOptions}
                      placeholder="Select Account..."
                      onChange={(e, d) =>
                        this.setState({ selectedAccount: d.value })
                      }
                    />
                  ) : (
                    ''
                  )}
                </Form>
              </Modal.Content>
              <Modal.Content
                style={{
                  display: activeNodeItem === 'Delete Node' ? '' : 'none'
                }}
              >
                <DeleteNode action={this.action} />
              </Modal.Content>
              <Modal.Actions>
                <Button
                  disabled={createDisabled}
                  positive
                  onClick={() =>
                    this.action('add', mapConfig, updateDataContextState)
                  }
                >
                  Create
                </Button>
                <Button
                  style={{ float: 'left' }}
                  negative
                  onClick={this.handleClose}
                >
                  Close
                </Button>
              </Modal.Actions>
            </Modal>
          );
        }}
      </DataConsumer>
    );
  }
}
