/* eslint
no-console: 0
*/

import React from 'react';
import { Button, Form, Radio, Input } from 'semantic-ui-react';
import { DataConsumer } from '../../../context/data';
import { nerdGraphQuery, DashboardQuery } from '../../../lib/utils';
import {
  Spinner,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell
} from 'nr1';

export default class DrilldownDashboard extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedAccount: null,
      searchedDashboards: [],
      showSearchMsg: false,
      selectedDash: null,
      searchText: '',
      fetchingDashboards: false
    };
  }

  fetchDashboards = async (init, cursor, incomingResults) => {
    const { selectedAccount } = this.state;

    let results = init ? [] : incomingResults;

    const nerdGraphResult = await nerdGraphQuery(
      DashboardQuery(selectedAccount, cursor)
    );
    const dashboardSearchResults =
      (((nerdGraphResult || {}).actor || {}).entitySearch || {}).results || {};
    // let foundGuids = ((entitySearchResults || {}).entities || []).map((result)=>result.guid)

    results = [...results, ...dashboardSearchResults.entities];

    if (dashboardSearchResults.nextCursor) {
      console.log(
        'collecting next dashboardSearch batch guid:',
        dashboardSearchResults.nextCursor
      );
      this.fetchDashboards(false, dashboardSearchResults.nextCursor, results);
    } else {
      console.log('complete', results.length);
      this.setState({ searchedDashboards: results, fetchingDashboards: false });

      if (results.length === 0) {
        this.setState({ showSearchMsg: true });
      }
    }
  };

  updateDashboard = async (
    updateDataContextState,
    mapConfig,
    nodeId,
    action
  ) => {
    if (action === 'save') {
      mapConfig.nodeData[nodeId].dashboard = this.state.selectedDash;
    } else if (action === 'delete') {
      delete mapConfig.nodeData[nodeId].dashboard;
    }
    await updateDataContextState({ mapConfig }, ['saveMap']);
  };

  render() {
    const {
      selectedAccount,
      searchedDashboards,
      showSearchMsg,
      selectedDash,
      searchText,
      fetchingDashboards
    } = this.state;

    return (
      <DataConsumer>
        {({ accounts, mapConfig, selectedNode, updateDataContextState }) => {
          const accountOptions = accounts.map(acc => ({
            key: acc.id,
            value: acc.id,
            text: acc.name
          }));

          const currentDash = mapConfig.nodeData[selectedNode].dashboard;
          const addDisabled = selectedAccount === null || selectedDash === null;

          const filteredDashboards = searchedDashboards.filter(dash =>
            dash.name
              ? dash.name.toLowerCase().includes(searchText.toLowerCase())
              : false
          );

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
                    disabled={!selectedAccount || fetchingDashboards}
                    label="&nbsp;"
                    width={4}
                    content="Fetch Dashboards"
                    onClick={() => {
                      this.setState(
                        { fetchingDashboards: true, searchedDashboards: [] },
                        () => {
                          this.fetchDashboards(true);
                        }
                      );
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
                    display: fetchingDashboards ? '' : 'none'
                  }}
                >
                  <Spinner />
                </div>
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
                {}
                <div
                  style={{
                    overflowY: 'scroll',
                    height: '300px',
                    display:
                      searchedDashboards.length === 0 || fetchingDashboards
                        ? 'none'
                        : ''
                  }}
                >
                  <Table items={filteredDashboards}>
                    <TableHeader>
                      <TableHeaderCell>Name</TableHeaderCell>
                      <TableHeaderCell>Select</TableHeaderCell>
                    </TableHeader>
                    {({ item }) => (
                      <TableRow key={item.guid}>
                        <TableRowCell>{item.name}</TableRowCell>
                        <TableRowCell>
                          <Radio
                            value={item.guid}
                            checked={
                              (selectedDash || currentDash) === item.guid
                            }
                            onChange={() =>
                              this.setState({ selectedDash: item.guid })
                            }
                          />
                        </TableRowCell>
                      </TableRow>
                    )}
                  </Table>
                </div>
                <br />

                <Button
                  style={{ float: 'right' }}
                  disabled={!currentDash}
                  negative
                  onClick={() => {
                    this.updateDashboard(
                      updateDataContextState,
                      mapConfig,
                      selectedNode,
                      'delete'
                    );
                  }}
                >
                  Clear
                </Button>

                <Button
                  style={{ float: 'right' }}
                  disabled={addDisabled}
                  positive
                  onClick={() => {
                    this.updateDashboard(
                      updateDataContextState,
                      mapConfig,
                      selectedNode,
                      'save'
                    );
                  }}
                >
                  Save
                </Button>

                <br />
              </>
            );
          } else {
            return <Spinner />;
          }
        }}
      </DataConsumer>
    );
  }
}
