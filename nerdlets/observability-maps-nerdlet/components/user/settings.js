import React from 'react';
import { Modal, Button, Form, Popup } from 'semantic-ui-react';
import { writeUserDocument } from '../../lib/utils';
import { DataConsumer } from '../../context/data';
import { toast } from 'react-toastify';

export default class UserSettings extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      settingsOpen: false,
      defaultMap: null
    };
  }

  handleOpen = () => this.setState({ settingsOpen: true });
  handleClose = () => this.setState({ settingsOpen: false });
  handleChange = (e, { value }, formType) =>
    this.setState({ [formType]: value });

  handleSave = async (tempState, dataFetcher, existingUserConfig) => {
    const { defaultMap } = tempState;

    let userConfig = {};
    if (existingUserConfig) {
      userConfig = { ...existingUserConfig };
    }

    userConfig = {
      defaultMap:
        this.state.defaultMap === 'Reset'
          ? null
          : this.state.defaultMap || defaultMap
    };

    this.toastUserConfig = toast(`Saving user config`, {
      containerId: 'B'
    });

    await writeUserDocument('ObservabilityUserConfig', 'v1', userConfig);
    await dataFetcher(['userConfig']);

    toast.dismiss(this.toastUserConfig);
  };

  onUnmount = updateDataContextState => {
    updateDataContextState({ closeCharts: false });
    this.setState({
      defaultMap: null
    });
  };

  render() {
    const { settingsOpen } = this.state;

    return (
      <DataConsumer>
        {({
          updateDataContextState,
          dataFetcher,
          userConfig,
          userMaps,
          accountMaps
        }) => {
          let availableMaps = [];

          if (accountMaps) {
            accountMaps = accountMaps.map(map => ({
              key: map.id,
              value: map.id,
              text: map.id.replace(/\+/g, ' '),
              type: 'account'
            }));
            availableMaps = [...availableMaps, ...accountMaps];
          }
          if (userMaps) {
            userMaps = userMaps.map(map => ({
              key: map.id,
              value: map.id,
              text: map.id.replace(/\+/g, ' '),
              type: 'user'
            }));
            availableMaps = [...availableMaps, ...userMaps];
          }

          availableMaps.unshift({
            key: '---default---',
            value: 'Reset',
            text: 'Reset to default',
            type: 'reset'
          });

          const tempState = {
            defaultMap: null
          };

          if (userConfig) {
            if (userConfig.defaultMap)
              tempState.defaultMap = userConfig.defaultMap;
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
              onMount={() => updateDataContextState({ closeCharts: true })}
              trigger={
                <Popup
                  content="User Settings"
                  trigger={
                    <Button
                      onClick={this.handleOpen}
                      icon="user"
                      style={{ height: '45px' }}
                      className="filter-button"
                    />
                  }
                />
              }
            >
              <Modal.Header>User Settings</Modal.Header>
              <Modal.Content>
                <Form>
                  <Form.Group>
                    <Form.Select
                      fluid
                      label="Default Map"
                      width="16"
                      value={value('defaultMap')}
                      options={availableMaps}
                      onChange={(e, d) => this.handleChange(e, d, 'defaultMap')}
                    />
                  </Form.Group>
                </Form>
                <Button
                  positive
                  content="Save"
                  style={{ float: 'right' }}
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
