import React from 'react';
import { Modal, Button, Form, Popup, Header } from 'semantic-ui-react';
import { writeUserDocument, getAccountCollection } from '../../lib/utils';
import { DataConsumer } from '../../context/data';
import { toast } from 'react-toastify';

export default class UserSettings extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      settingsOpen: false,
      mapStore: null,
      loadingMaps: false,
      defaultMap: null,
      accountMaps: [],
      saving: false
    };
  }

  handleOpen = () => this.setState({ settingsOpen: true });
  handleClose = () =>
    this.setState({ settingsOpen: false, mapStore: null, defaultMap: null });

  handleChange = async (e, { value }, formType) => {
    if (formType === 'mapStore') {
      if (value !== 'user') {
        this.setState({ loadingMaps: true }, async () => {
          const accountMaps = await getAccountCollection(
            value,
            'ObservabilityMaps'
          );
          this.setState({
            accountMaps,
            [formType]: value,
            defaultMap: null,
            loadingMaps: false
          });
        });
      } else {
        this.setState({ [formType]: value, defaultMap: null });
      }
    } else {
      this.setState({ [formType]: value });
    }
  };

  handleSave = (tempState, dataFetcher, existingUserConfig) => {
    this.setState({ saving: true }, async () => {
      const { defaultMap, mapStore } = tempState;

      let userConfig = {};
      if (existingUserConfig) {
        userConfig = { ...existingUserConfig };
      }

      userConfig = {
        defaultMap:
          this.state.defaultMap === 'Reset'
            ? null
            : this.state.defaultMap || defaultMap,
        mapStore:
          this.state.defaultMap === 'Reset'
            ? null
            : this.state.mapStore || mapStore
      };

      this.toastUserConfig = toast(`Saving user config`, {
        containerId: 'B'
      });

      await writeUserDocument('ObservabilityUserConfig', 'v1', userConfig);
      await dataFetcher(['userConfig']);

      toast.dismiss(this.toastUserConfig);

      if (this.state.defaultMap === 'Reset') {
        this.setState({ saving: false, mapStore: null, defaultMap: null });
      } else {
        this.setState({ saving: false });
      }
    });
  };

  onUnmount = updateDataContextState => {
    updateDataContextState({ closeCharts: false });
    this.setState({
      defaultMap: null,
      mapStore: null
    });
  };

  onMount = async updateDataContextState => {
    this.setState({ mapStore: null }, () =>
      updateDataContextState({ closeCharts: true })
    );
  };

  render() {
    const { settingsOpen, mapStore, saving, loadingMaps } = this.state;
    let { accountMaps } = this.state;

    return (
      <DataConsumer>
        {({
          updateDataContextState,
          dataFetcher,
          userConfig,
          userMaps,
          accounts
        }) => {
          const storageOptions = accounts.map(acc => ({
            key: acc.id,
            text: acc.name,
            value: acc.id,
            type: 'account'
          }));

          storageOptions.sort((a, b) => {
            if (a.label < b.label) {
              return -1;
            }
            if (a.label > b.label) {
              return 1;
            }
            return 0;
          });

          storageOptions.unshift({
            key: 'User',
            text: 'User (Personal)',
            value: 'user',
            type: 'user'
          });

          let availableMaps = [];

          if (accountMaps && mapStore !== 'user') {
            accountMaps = accountMaps
              .filter(map => map.id)
              .map(map => ({
                key: map.id,
                value: map.id,
                text: (map.id || '').replaceAll('+', ' ').replaceAll('-', ' '),
                type: 'account'
              }));
            availableMaps = [...accountMaps];
          }

          if (userMaps && mapStore === 'user') {
            userMaps = userMaps.map(map => ({
              key: map.id,
              value: map.id,
              text: map.id.replaceAll('+', ' ').replaceAll('-', ' '),
              type: 'user'
            }));
            availableMaps = [...userMaps];
          }

          availableMaps.unshift({
            key: '---default---',
            value: 'Reset',
            text: 'Reset to default',
            type: 'reset'
          });

          const tempState = {
            defaultMap: null,
            mapStore: null
          };

          if (userConfig) {
            if (userConfig.defaultMap) {
              tempState.defaultMap = userConfig.defaultMap;
            }
            if (userConfig.mapStore) {
              tempState.mapStore = userConfig.mapStore;
            }
          }

          const value = name =>
            (this.state[name] != null ? this.state[name] : tempState[name]) ||
            '';

          return (
            <Modal
              closeIcon
              size="large"
              open={settingsOpen}
              onClose={this.handleClose}
              onUnmount={() => this.onUnmount(updateDataContextState)}
              onMount={() => this.onMount(updateDataContextState)}
              trigger={
                <Popup
                  content="User Settings"
                  trigger={
                    <Button
                      onClick={this.handleOpen}
                      icon="user"
                      style={{ height: '35px', width: '40px' }}
                      className="filter-button"
                    />
                  }
                />
              }
            >
              <Modal.Header>User Settings</Modal.Header>
              <Modal.Content>
                <Form>
                  <Header
                    style={{ marginBottom: '3px' }}
                    as="h3"
                    content="Default Map Selection"
                  />

                  {value('defaultMap') ? (
                    <Header as="h5" style={{ marginTop: '3px' }}>
                      Current:{' '}
                      {value('defaultMap')
                        .replaceAll('+', ' ')
                        .replaceAll('-', ' ')}
                    </Header>
                  ) : (
                    ``
                  )}
                  <Form.Group>
                    <Form.Select
                      fluid
                      label="Storage Location"
                      width="6"
                      value={value('mapStore')}
                      options={storageOptions}
                      onChange={(e, d) => this.handleChange(e, d, 'mapStore')}
                    />
                    <Form.Select
                      fluid
                      label="Select Map"
                      width="10"
                      value={value('defaultMap')}
                      options={availableMaps}
                      loading={loadingMaps}
                      onChange={(e, d) => this.handleChange(e, d, 'defaultMap')}
                      onClick={() => {
                        if (
                          availableMaps.length === 1 &&
                          !isNaN(value('mapStore'))
                        ) {
                          this.setState({ loadingMaps: true }, async () => {
                            const accountMaps = await getAccountCollection(
                              value('mapStore'),
                              'ObservabilityMaps'
                            );
                            this.setState({
                              accountMaps,
                              loadingMaps: false
                            });
                          });
                        }
                      }}
                    />
                  </Form.Group>
                </Form>
                <Button
                  positive
                  content="Save"
                  style={{ float: 'right' }}
                  loading={saving}
                  onClick={() =>
                    this.handleSave(tempState, dataFetcher, userConfig)
                  }
                />
                <br /> <br />
              </Modal.Content>
            </Modal>
          );
        }}
      </DataConsumer>
    );
  }
}
