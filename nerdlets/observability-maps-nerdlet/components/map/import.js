import React from 'react';
import { Modal, Button, Form, TextArea, Label, Popup } from 'semantic-ui-react';
import { writeUserDocument, writeAccountDocument } from '../../lib/utils';
import { DataConsumer } from '../../context/data';
import { toast } from 'react-toastify';

function isValidJson(json) {
  try {
    JSON.parse(json);
    return true;
  } catch (e) {
    return false;
  }
}

export default class ImportMap extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      mapImport: 'Paste map config here!',
      mapName: '',
      importOpen: false
    };
  }

  handleOpen = () => this.setState({ importOpen: true });
  handleClose = () => this.setState({ importOpen: false });

  saveMap = async (dataFetcher, findMap, selectMap, storageLocation) => {
    const { mapName, mapImport } = this.state;

    this.toastImportMap = toast(`Importing Map: ${mapName}`, {
      containerId: 'B'
    });

    try {
      const jsonData = JSON.parse(mapImport);

      // cleanse node data
      const newNodeData = {};
      Object.keys(jsonData.nodeData).forEach(node => {
        newNodeData[node] = {
          name: jsonData.nodeData[node].name,
          domain: jsonData.nodeData[node].domain,
          entityType: jsonData.nodeData[node].entityType,
          guid: jsonData.nodeData[node].guid,
          hoverType: jsonData.nodeData[node].hoverType,
          iconSet: jsonData.nodeData[node].iconSet,
          mainChart: jsonData.nodeData[node].mainChart,
          customAlert: jsonData.nodeData[node].customAlert,
          dashboard: jsonData.nodeData[node].dashboard,
          x: jsonData.nodeData[node].x,
          y: jsonData.nodeData[node].y
        };
      });
      jsonData.nodeData = newNodeData;

      if (storageLocation.type === 'user') {
        await writeUserDocument('ObservabilityMaps', mapName, jsonData);
      } else if (storageLocation.type === 'account') {
        await writeAccountDocument(
          storageLocation.value,
          'ObservabilityMaps',
          mapName,
          jsonData
        );
      }

      await dataFetcher(['userMaps', 'accountMaps']);
    } catch (e) {
      toast.update(this.toastImportMap, {
        render: `Failed to import: ${mapName}`,
        type: toast.TYPE.ERROR,
        autoClose: 3000,
        containerId: 'B'
      });
    } finally {
      if (findMap(mapName)) {
        toast.update(this.toastImportMap, {
          render: `Import success: ${mapName}`,
          type: toast.TYPE.SUCCESS,
          autoClose: 3000,
          containerId: 'B'
        });
        selectMap(mapName);
        this.setState({ importOpen: false, mapImport: '', mapName: '' });
      } else {
        this.setState({ mapImport: '', mapName: '' });
      }
    }
  };

  render() {
    const { mapImport, mapName, importOpen } = this.state;

    return (
      <DataConsumer>
        {({
          dataFetcher,
          updateDataContextState,
          availableMaps,
          findMap,
          selectMap,
          storageLocation
        }) => {
          let mapNameError = false;
          const mapNameErrorContent = {
            content: '',
            pointing: 'above'
          };
          const existingMap = [...availableMaps].filter(
            map =>
              map.id.replaceAll('+', ' ').replaceAll('-', ' ') === mapName ||
              map.id === mapName
          );
          if (existingMap.length > 0) {
            mapNameErrorContent.content = 'This map name already exists';
            mapNameError = true;
          } else if (mapName.length === 0) {
            mapNameErrorContent.content = 'Please enter a map name';
            mapNameError = true;
          } else {
            mapNameError = false;
          }

          return (
            <Modal
              closeIcon
              size="large"
              open={importOpen}
              onClose={this.handleClose}
              onUnmount={() => updateDataContextState({ closeCharts: false })}
              onMount={() => updateDataContextState({ closeCharts: true })}
              trigger={
                <Popup
                  content="Import"
                  trigger={
                    <Button
                      onClick={this.handleOpen}
                      icon="upload"
                      style={{ height: '35px', width:'35px' }}
                      className="filter-button"
                    />
                  }
                />
              }
            >
              <Modal.Header>Import Map</Modal.Header>
              <Modal.Content>
                <Form>
                  <Form.Input
                    error={mapNameError ? mapNameErrorContent : false}
                    fluid
                    value={mapName}
                    onChange={e => this.setState({ mapName: e.target.value })}
                    placeholder="Enter Map Name..."
                    color="red"
                  />
                </Form>
                <br />
                <br />
                <Form>
                  <Form.Field>
                    <TextArea
                      name="importMapConfig"
                      style={{ width: '100%', height: '500px' }}
                      value={mapImport}
                      onChange={e =>
                        this.setState({ mapImport: e.target.value })
                      }
                      className="txtarea"
                    />
                    <Label
                      style={{ display: isValidJson(mapImport) ? 'none' : '' }}
                      pointing
                      prompt
                    >
                      Please enter valid json map configuration
                    </Label>
                  </Form.Field>
                </Form>
                <br />
                <br />
                <Button
                  icon="download"
                  disabled={isValidJson(mapImport) === false || mapNameError}
                  positive
                  content="Save Map"
                  style={{ float: 'right' }}
                  onClick={() =>
                    this.saveMap(
                      dataFetcher,
                      findMap,
                      selectMap,
                      storageLocation
                    )
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
