import React from 'react';
import { Button, Form, Table, Header, Radio, Input } from 'semantic-ui-react';
import { DataConsumer } from '../../../context/data';
import { nerdGraphQuery, DashboardQuery } from '../../../lib/utils';
import { Spinner } from 'nr1';

export default class DrilldownDashboard extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedAccount: null,
      searchedDashboards: [],
      showSearchMsg: false,
      selectedDash: null,
      searchText: ''
    };
  }

  fetchDashboards = async cursor => {
    let { selectedAccount, searchedDashboards } = this.state;
    // if no cursor its a new search so empty entities
    if (!cursor) {
      searchedDashboards = [];
    }

    const nerdGraphResult = await nerdGraphQuery(
      DashboardQuery(selectedAccount)
    );
    const dashboardSearchResults =
      (((nerdGraphResult || {}).actor || {}).entitySearch || {}).results || {};
    // let foundGuids = ((entitySearchResults || {}).entities || []).map((result)=>result.guid)

    searchedDashboards = [...searchedDashboards, ...dashboardSearchResults.entities];
    this.setState({ searchedDashboards }, () => {
      if (dashboardSearchResults.nextCursor) {
        console.log(
          'collecting next dashboardSearch batch guid:',
          dashboardSearchResults.nextCursor
        );
        this.fetchEntities(dashboardSearchResults.nextCursor);
      } else {
        // console.log("complete", this.state.searchedEntities.length)
      }
      this.setState({ showSearchMsg: true });
    });
  };

  saveDashboard = async (updateDataContextState, mapConfig, nodeId) => {
    mapConfig.nodeData[nodeId].dashboard = this.state.selectedDash;

    await updateDataContextState({ mapConfig }, ['saveMap']);
  };



  render() {
    const { selectedAccount, searchedDashboards, showSearchMsg, selectedDash, searchText } = this.state;

    return (
        <DataConsumer>
          {({ accounts, mapConfig, selectedNode, updateDataContextState }) => {
            const accountOptions = accounts.map(acc => ({
              key: acc.id,
              value: acc.id,
              text: acc.name
            }));

            const addDisabled =
              selectedAccount === null ||
              selectedDash === null

            if (accountOptions) {
              return (
              <>
                <Form.Group widths={8}>
                <Form.Select
                  width={4}
                  search
                  label="Account"
                  options={accountOptions}
                  placeholder="Select Account..."
                  onChange={(e, d) =>
                    this.setState({ selectedAccount: d.value })
                  }
                />
                <Form.Button
                  disabled={!selectedAccount}
                  label="&nbsp;"
                  width="3"
                  content="Fetch Dashboards"
                  onClick={() => {
                    this.fetchDashboards();
                  }}
                />
                </Form.Group>
                <Form.Group
                  style={{
                    display: searchedDashboards.length === 0 ? 'none' : ''
                  }}
                >
                  <Form.Field
                    width="16"
                    control={Input}
                    label="Search"
                    placeholder="My dashboard..."
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
                      searchedDashboards.length === 0 && showSearchMsg
                        ? ''
                        : 'none'
                  }}
                >
                  No entities found with accountId = {selectedAccount}.
                </div>
                <div
                  style={{
                    overflowY: 'scroll',
                    height: '300px',
                    display: searchedDashboards.length === 0 ? 'none' : ''
                  }}
                >
                  <Table compact>
                    <Table.Body>
                      {searchedDashboards
                        .filter(dash =>
                          dash.name
                            ? dash.name
                                .toLowerCase()
                                .includes(searchText.toLowerCase())
                            : false
                        )
                        .map((dash, i) => {
                          return (
                            <Table.Row key={i}>
                              <Table.Cell>{dash.name}</Table.Cell>
                              <Table.Cell>
                                <Radio
                                  value={dash.guid}
                                  checked={selectedDash === dash.guid}
                                  onChange={(e, d) =>
                                    this.setState({ selectedDash: dash.guid})
                                  }
                                />
                              </Table.Cell>
                            </Table.Row>
                          );
                        })
                      }
                    </Table.Body>
                  </Table>
                </div>
                <br />
                <Button
                  style={{float: 'right'}}
                  disabled={addDisabled}
                  positive
                  onClick={() => {
                    this.saveDashboard(
                      updateDataContextState,
                      mapConfig,
                      selectedNode
                    )
                  }}
                >
                  Save
                </Button>
                <br />
              </>
            )
            } else {
              return (
                <Spinner />
              )
            }
          }}
        </DataConsumer>
    );
  }
}
