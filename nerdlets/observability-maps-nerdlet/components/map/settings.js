import React from 'react';
import { Modal, Button, Form } from 'semantic-ui-react';
import { writeUserDocument, writeAccountDocument } from '../../lib/utils';
import { DataConsumer } from '../../context/data';

export default class MapSettings extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      settingsOpen: false,
      backgroundColor: null,
      backgroundImage: null,
      backgroundPosition: null,
      backgroundRepeat: null,
      backgroundSize: null,
      linkType: null
    };
  }

  handleOpen = () => this.setState({ settingsOpen: true });
  handleClose = () => this.setState({ settingsOpen: false });
  handleChange = (e, { value }, formType) =>
    this.setState({ [formType]: value });

  handleSave = async (
    tempState,
    dataFetcher,
    mapConfig,
    selectedMap,
    storageLocation
  ) => {
    const {
      backgroundColor,
      backgroundImage,
      backgroundPosition,
      backgroundRepeat,
      backgroundSize,
      linkType
    } = tempState;

    if (!mapConfig.settings) {
      mapConfig.settings = {};
    }

    mapConfig.settings.backgroundColor =
      this.state.backgroundColor || backgroundColor;

    if (this.state.backgroundImage != null) {
      if (!this.state.backgroundImage.includes(`url("`)) {
        mapConfig.settings.backgroundImage = `url("${this.state.backgroundImage}")`;
      } else {
        mapConfig.settings.backgroundImage =
          this.state.backgroundImage || backgroundImage;
      }
    } else if (backgroundImage) {
      mapConfig.settings.backgroundImage = backgroundImage;
    }

    mapConfig.settings.backgroundPosition =
      this.state.backgroundPosition || backgroundPosition;
    mapConfig.settings.backgroundRepeat =
      this.state.backgroundRepeat || backgroundRepeat;
    mapConfig.settings.backgroundSize =
      this.state.backgroundSize || backgroundSize;
    mapConfig.settings.linkType = this.state.linkType || linkType;

    if (storageLocation.type === 'user') {
      await writeUserDocument(
        'ObservabilityMaps',
        selectedMap.value,
        mapConfig
      );
    } else if (storageLocation.type === 'account') {
      await writeAccountDocument(
        storageLocation.value,
        'ObservabilityMaps',
        selectedMap.value,
        mapConfig
      );
    }

    await dataFetcher(['userMaps', 'accountMaps']);
  };

  onUnmount = updateDataContextState => {
    updateDataContextState({ closeCharts: false });
    this.setState({
      backgroundColor: null,
      backgroundImage: null,
      backgroundPosition: null,
      backgroundRepeat: null,
      backgroundSize: null,
      linkType: null
    });
  };

  render() {
    const { settingsOpen } = this.state;

    return (
      <DataConsumer>
        {({
          updateDataContextState,
          dataFetcher,
          mapConfig,
          selectedMap,
          storageLocation
        }) => {
          const tempState = {
            backgroundColor: '',
            backgroundImage: '',
            backgroundPosition: '',
            backgroundRepeat: '',
            backgroundSize: '',
            linkType: ''
          };

          if (mapConfig.settings) {
            tempState.backgroundColor = mapConfig.settings.backgroundColor;
            tempState.backgroundImage = mapConfig.settings.backgroundImage;
            tempState.backgroundPosition =
              mapConfig.settings.backgroundPosition;
            tempState.backgroundRepeat = mapConfig.settings.backgroundRepeat;
            tempState.backgroundSize = mapConfig.settings.backgroundSize;
            tempState.linkType = mapConfig.settings.linkType;
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
                <Button
                  onClick={this.handleOpen}
                  icon="images outline"
                  content="Settings"
                  style={{ height: '45px' }}
                  className="filter-button"
                />
              }
            >
              <Modal.Header>Map Settings</Modal.Header>
              <Modal.Content>
                <Form>
                  <Form.Group widths="16">
                    <Form.Input
                      onChange={(e, d) =>
                        this.handleChange(e, d, 'backgroundColor')
                      }
                      value={value('backgroundColor')}
                      width="8"
                      fluid
                      label="Background Color"
                      placeholder="#000000"
                    />
                    <Form.Input
                      onChange={(e, d) =>
                        this.handleChange(e, d, 'backgroundImage')
                      }
                      width="8"
                      fluid
                      value={value('backgroundImage')}
                      label="Background Image"
                      placeholder={`url("https://someimage.com/image.jpg")`}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Select
                      fluid
                      label="Background Repeat"
                      width="8"
                      value={value('backgroundRepeat')}
                      options={[
                        { key: 'n', text: 'None', value: '' },
                        { key: 'r', text: 'repeat', value: 'repeat' },
                        { key: 'rx', text: 'repeat-x', value: 'repeat-x' },
                        { key: 'ry', text: 'repeat-y', value: 'repeat-y' },
                        { key: 'nr', text: 'no-repeat', value: 'no-repeat' },
                        { key: 'ini', text: 'initial', value: 'initial' },
                        { key: 'inh', text: 'inherit', value: 'inherit' }
                      ]}
                      onChange={(e, d) =>
                        this.handleChange(e, d, 'backgroundRepeat')
                      }
                    />
                    <Form.Input
                      onChange={(e, d) =>
                        this.handleChange(e, d, 'backgroundPosition')
                      }
                      value={value('backgroundPosition')}
                      width="8"
                      fluid
                      label="Background Position"
                      placeholder="center"
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Input
                      onChange={(e, d) =>
                        this.handleChange(e, d, 'backgroundSize')
                      }
                      value={value('backgroundSize')}
                      width="8"
                      fluid
                      label="Background Size"
                      placeholder="auto"
                    />
                    <Form.Select
                      fluid
                      label="Link Type"
                      width="8"
                      value={value('linkType')}
                      options={[
                        { key: 's', text: 'STRAIGHT', value: 'STRAIGHT' },
                        {
                          key: 'cs',
                          text: 'CURVE_SMOOTH',
                          value: 'CURVE_SMOOTH'
                        },
                        { key: 'cf', text: 'CURVE_FULL', value: 'CURVE_FULL' }
                      ]}
                      onChange={(e, d) => this.handleChange(e, d, 'linkType')}
                    />
                  </Form.Group>
                </Form>
                <br />
                <br />
                <Button
                  positive
                  content="Save"
                  style={{ float: 'right' }}
                  onClick={() =>
                    this.handleSave(
                      tempState,
                      dataFetcher,
                      mapConfig,
                      selectedMap,
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
