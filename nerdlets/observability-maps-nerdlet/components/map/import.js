import React from 'react';
import {
  Modal,
  Button,
  Input,
  TextArea,
  Label,
  Popup
} from 'semantic-ui-react';
import { writeUserDocument } from '../../lib/utils';

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
    this.saveMap = this.saveMap.bind(this);
  }

  handleOpen = () => this.setState({ importOpen: true });
  handleClose = () => this.setState({ importOpen: false });

  async saveMap() {
    const { mapName, mapImport } = this.state;
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
        x: jsonData.nodeData[node].x,
        y: jsonData.nodeData[node].y
      };
    });
    jsonData.nodeData = newNodeData;

    await writeUserDocument('ObservabilityMaps', mapName, jsonData);
    this.props.dataFetcher(['userMaps']);
    this.setState({ mapImport: '', mapName: '' });
  }

  render() {
    const { mapImport, mapName, importOpen } = this.state;
    const { setParentState } = this.props;

    return (
      <Modal
        size="large"
        open={importOpen}
        onClose={this.handleClose}
        onUnmount={() => setParentState({ closeCharts: false })}
        onMount={() => setParentState({ closeCharts: true })}
        trigger={
          <Popup
            content="Import"
            trigger={
              <Button
                onClick={this.handleOpen}
                icon="upload"
                style={{ height: '45px' }}
                className="filter-button"
              />
            }
          />
        }
      >
        <Modal.Header>Import Map</Modal.Header>
        <Modal.Content>
          <Input
            placeholder="Enter Map Name..."
            value={mapName}
            onChange={e => this.setState({ mapName: e.target.value })}
            style={{ width: '100%' }}
          />
          <Label
            style={{ display: mapName === '' ? '' : 'none' }}
            color="red"
            pointing
          >
            Please enter a map name
          </Label>
          <br />
          <br />
          <TextArea
            name="importMapConfig"
            style={{ width: '100%', height: '500px' }}
            value={mapImport}
            onChange={e => this.setState({ mapImport: e.target.value })}
            className="txtarea"
          />
          <Label
            style={{ display: isValidJson(mapImport) ? 'none' : '' }}
            color="red"
            pointing
          >
            Please enter valid json map configuration
          </Label>
          <br />
          <br />
          <Button
            icon="download"
            disabled={isValidJson(mapImport) === false || mapName === ''}
            positive
            content="Save Map"
            style={{ float: 'right' }}
            onClick={() => this.saveMap()}
          />
          <br /> <br />
        </Modal.Content>
      </Modal>
    );
  }
}
