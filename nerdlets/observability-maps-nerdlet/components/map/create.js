import React from 'react';
import {
  Modal,
  Button,
  Form,
  Header,
  Radio,
  Popup,
  Icon
} from 'semantic-ui-react';
import { writeUserDocument, writeAccountDocument } from '../../lib/utils';
import { DataConsumer } from '../../context/data';

export default class CreateMap extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      mapName: '',
      storeLocation: 'user',
      createOpen: false
    };
    this.save = this.save.bind(this);
  }

  handleOpen = () => this.setState({ createOpen: true });
  handleClose = () => this.setState({ createOpen: false });

  save = async (dataFetcher, selectMap, storageLocation) => {
    const { mapName, storeLocation } = this.state;
    this.setState({ createOpen: false });
    const payload = {
      nodeData: {},
      linkData: {}
    };

    switch (storeLocation) {
      case 'account':
        await writeAccountDocument(
          storageLocation.value,
          'ObservabilityMaps',
          mapName,
          payload
        );
        await dataFetcher(['accountMaps']);
        selectMap(mapName);
        break;
      case 'user':
        await writeUserDocument('ObservabilityMaps', mapName, payload);
        await dataFetcher(['userMaps']);
        selectMap(mapName);
        break;
    }
    this.setState({ mapName: '' });
  };

  render() {
    const { mapName, storeLocation, createOpen } = this.state;

    return (
      <DataConsumer>
        {({
          dataFetcher,
          updateDataContextState,
          selectMap,
          accounts,
          accountMaps,
          userMaps,
          storageLocation
        }) => {
          userMaps = userMaps || [];
          accountMaps = accountMaps || [];
          const existingMap = [...userMaps, ...accountMaps]
            .map(map => ({
              value: map.id,
              label: map.id.replaceAll('+', ' ').replaceAll('-', ' '),
              type: 'user'
            }))
            .filter(
              map =>
                (map.value &&
                  map.value.replaceAll('+', ' ').replaceAll('-', ' ') ===
                    mapName) ||
                map.value === mapName
            );

          let mapNameError = false;
          const mapNameErrorContent = { content: '', pointing: 'above' };

          if (existingMap.length > 0) {
            mapNameErrorContent.content = 'This map name already exists';
            mapNameError = true;
          } else if (mapName.length === 0) {
            mapNameErrorContent.content = 'Please enter a map name';
            mapNameError = true;
          } else {
            mapNameError = false;
          }

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

          // storageOptions.unshift({
          //   key: 'User',
          //   text: 'User (Personal)',
          //   value: 'user',
          //   type: 'user'
          // });

          const setStorageOption = v => {
            const option = storageOptions.filter(s => s.value === v)[0];
            option.label = option.text;
            updateDataContextState({ storageLocation: option });
          };

          return (
            <Modal
              closeIcon
              open={createOpen}
              onUnmount={() => updateDataContextState({ closeCharts: false })}
              onMount={() => updateDataContextState({ closeCharts: true })}
              onClose={this.handleClose}
              size="small"
              trigger={
                <Popup
                  content="Create Map"
                  trigger={
                    <Button
                      onClick={this.handleOpen}
                      style={{ height: '35px', width:'35px' }}
                      className="filter-button"
                    >
                      <Icon.Group
                        size="small"
                        style={{
                           margin:'0px',
                          fontSize:'1rem'
                        }}
                      >
                        <Icon name="map outline" />
                        <Icon corner="bottom right" name="add" />
                      </Icon.Group>
                    </Button>
                  }
                />
              }
            >
              <Modal.Header>Create Map</Modal.Header>
              <Modal.Content>
                <Header>Name</Header>
                <Form>
                  <Form.Input
                    error={mapNameError ? mapNameErrorContent : false}
                    fluid
                    value={mapName}
                    onChange={e => this.setState({ mapName: e.target.value })}
                    placeholder="Name..."
                  />
                  {/* <Form.Field>
                            <input placeholder='Name...' value={mapName} onChange={(e)=>this.setState({mapName:e.target.value})} />
                        </Form.Field> */}

                  <Header>Save Location</Header>
                  <Form.Group inline>
                    <Form.Field
                      control={Radio}
                      label="User (private)"
                      value="user"
                      checked={storeLocation === 'user'}
                      onChange={() =>
                        this.setState(
                          {
                            storeLocation: 'user'
                          },
                          () =>
                            updateDataContextState({
                              storageLocation: {
                                key: 'User',
                                label: 'User (Personal)',
                                value: 'user',
                                type: 'user'
                              }
                            })
                        )
                      }
                    />

                    <Form.Field
                      control={Radio}
                      label="Account (shared)"
                      value="account"
                      checked={storeLocation === 'account'}
                      onChange={() =>
                        this.setState({ storeLocation: 'account' })
                      }
                    />

                    {storeLocation === 'account' ? (
                      <Form.Select
                        search
                        label="Account"
                        options={storageOptions}
                        placeholder="Select Account..."
                        value={storageLocation.value}
                        onChange={(e, d) => setStorageOption(d.value)}
                      />
                    ) : (
                      ''
                    )}
                  </Form.Group>
                </Form>
              </Modal.Content>
              <Modal.Actions>
                <Button
                  disabled={
                    mapNameError ||
                    (storeLocation === 'account' &&
                      storageLocation.type !== 'account')
                  }
                  positive
                  onClick={() =>
                    this.save(dataFetcher, selectMap, storageLocation)
                  }
                >
                  Create
                </Button>
              </Modal.Actions>
            </Modal>
          );
        }}
      </DataConsumer>
    );
  }
}
