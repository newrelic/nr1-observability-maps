import React from 'react';
import { Modal, Button, Form } from 'semantic-ui-react';
import { writeUserDocument } from '../../lib/utils';
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
      backgroundSize: null
    };
  }

  handleOpen = () => this.setState({ settingsOpen: true });
  handleClose = () => this.setState({ settingsOpen: false });
  handleChange = (e, { value }, formType) =>
    this.setState({ [formType]: value });

  handleSave = async (tempState, dataFetcher, mapConfig, selectedMap) => {
    const {
      backgroundColor,
      backgroundImage,
      backgroundPosition,
      backgroundRepeat,
      backgroundSize
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

    await writeUserDocument('ObservabilityMaps', selectedMap.value, mapConfig);
    await dataFetcher(['userMaps']);
  };

  onUnmount = updateDataContextState => {
    updateDataContextState({ closeCharts: false });
    this.setState({
      backgroundColor: null,
      backgroundImage: null,
      backgroundPosition: null,
      backgroundRepeat: null,
      backgroundSize: null
    });
  };

  render() {
    const { settingsOpen } = this.state;

    return (
      <DataConsumer>
        {({ updateDataContextState, dataFetcher, mapConfig, selectedMap }) => {
          const tempState = {
            backgroundColor: '',
            backgroundImage: '',
            backgroundPosition: '',
            backgroundRepeat: '',
            backgroundSize: ''
          };

          if (mapConfig.settings) {
            tempState.backgroundColor = mapConfig.settings.backgroundColor;
            tempState.backgroundImage = mapConfig.settings.backgroundImage;
            tempState.backgroundPosition =
              mapConfig.settings.backgroundPosition;
            tempState.backgroundRepeat = mapConfig.settings.backgroundRepeat;
            tempState.backgroundSize = mapConfig.settings.backgroundSize;
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
                      selectedMap
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
