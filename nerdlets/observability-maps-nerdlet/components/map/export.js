import React from 'react';
import { Modal, Button, Popup } from 'semantic-ui-react';
import { DataConsumer } from '../../context/data';

export default class ExportMap extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      exportOpen: false
    };
  }

  handleOpen = () => this.setState({ exportOpen: true });
  handleClose = () => this.setState({ exportOpen: false });

  render() {
    const { exportOpen } = this.state;
    return (
      <DataConsumer>
        {({ updateDataContextState, mapConfig, selectedMap }) => (
          <Modal
            closeIcon
            size="large"
            open={exportOpen}
            onClose={this.handleClose}
            onUnmount={() => updateDataContextState({ closeCharts: false })}
            onMount={() => updateDataContextState({ closeCharts: true })}
            trigger={
              <Popup
                content="Export"
                trigger={
                  <Button
                    onClick={this.handleOpen}
                    icon="download"
                    style={{ height: '45px' }}
                    className="filter-button"
                  />
                }
              />
            }
          >
            <Modal.Header>Export Map - {selectedMap.label}</Modal.Header>
            <Modal.Content>
              <textarea
                readOnly
                name="exportMapConfig"
                style={{ width: '100%', height: '500px' }}
                value={JSON.stringify(mapConfig, null, 2)}
              />
            </Modal.Content>
          </Modal>
        )}
      </DataConsumer>
    );
  }
}
