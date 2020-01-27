import React from 'react';
import { Modal, Button, Popup, Icon } from 'semantic-ui-react';
import { deleteAccountDocument, deleteUserDocument } from '../../lib/utils';

export default class DeleteMap extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { deleteOpen: false };
    this.save = this.save.bind(this);
  }

  handleOpen = () => this.setState({ deleteOpen: true });
  handleClose = () => this.setState({ deleteOpen: false });

  save = (map, dataFetcher, handleMapMenuChange) => {
    this.setState({ deleteOpen: false });
    switch (map.type) {
      case 'account':
        deleteAccountDocument('ObservabilityMaps', map.value);
        // dataFetcher(["accountMaps"])
        // handleMapMenuChange(null)
        break;
      case 'user':
        deleteUserDocument('ObservabilityMaps', map.value);
        dataFetcher(['userMaps']);
        handleMapMenuChange(null);
        break;
    }
  };

  render() {
    const { deleteOpen } = this.state;
    const {
      selectedMap,
      dataFetcher,
      handleMapMenuChange,
      setParentState
    } = this.props;
    return (
      <Modal
        onUnmount={() => setParentState({ closeCharts: false })}
        onMount={() => setParentState({ closeCharts: true })}
        onClose={this.handleClose}
        open={deleteOpen}
        size="tiny"
        trigger={
          <Popup
            content="Delete Map"
            trigger={
              <Button
                onClick={this.handleOpen}
                style={{ height: '45px' }}
                className="filter-button"
              >
                <Icon.Group
                  size="large"
                  style={{
                    marginTop: '5px',
                    marginLeft: '8px',
                    marginRight: '-10px'
                  }}
                >
                  <Icon name="map" color="red" />
                  <Icon name="minus" color="red" corner="bottom right" />
                </Icon.Group>
              </Button>
            }
          />
        }
      >
        <Modal.Header>Delete Map</Modal.Header>
        <Modal.Content>
          Are you sure you want to delete "{selectedMap.label}" map?
        </Modal.Content>
        <Modal.Actions>
          <Button style={{ float: 'left' }} positive onClick={this.handleClose}>
            Don't Delete
          </Button>

          <Button
            negative
            onClick={() =>
              this.save(selectedMap, dataFetcher, handleMapMenuChange)
            }
          >
            Delete!
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}
