import React from 'react';
import { Modal, Button, Form, Header, Radio } from 'semantic-ui-react';
import { writeUserDocument } from '../lib/utils';

export default class CreateMap extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      mapName: '',
      storeLocation: 'user',
      open: false
    };
    this.save = this.save.bind(this);
  }

  save = dataFetcher => {
    const { mapName, storeLocation } = this.state;
    this.setState({ open: false });
    const payload = {
      nodeData: {},
      linkData: {}
    };

    switch (storeLocation) {
      case 'account':
        // writeAccountDocument("ObservabilityMaps", mapName, payload)
        dataFetcher(['accountMaps']);
        break;
      case 'user':
        writeUserDocument('ObservabilityMaps', mapName, payload);
        dataFetcher(['userMaps']);
        break;
    }
    this.setState({ mapName: '' });
  };

  close = () => this.setState({ open: false });

  render() {
    const { mapName, storeLocation, open } = this.state;
    let { dataFetcher, userMaps, accountMaps } = this.props;
    userMaps = userMaps || [];
    accountMaps = accountMaps || [];
    let mapNameError = false;
    const mapNameErrorContent = { content: '', pointing: 'above' };
    const existingMap = [...userMaps, ...accountMaps].filter(
      map => map.value === mapName
    );
    if (existingMap.length > 0) {
      mapNameErrorContent.content = 'This map name already exists.';
      mapNameError = true;
    } else if (mapName.length === 0) {
      mapNameErrorContent.content = 'Please enter a map name.';
      mapNameError = true;
    } else {
      mapNameError = false;
    }

    return (
      <Modal
        open={open}
        size="tiny"
        trigger={
          <Button
            onClick={() => this.setState({ open: true })}
            className="filter-button"
            icon="cog"
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
              // label='First name'
              value={mapName}
              onChange={e => this.setState({ mapName: e.target.value })}
              placeholder="Name..."
            />
            {/* <Form.Field>
                            <input placeholder='Name...' value={mapName} onChange={(e)=>this.setState({mapName:e.target.value})} />
                        </Form.Field> */}

            <Header>Save Location</Header>
            <Form.Group inline>
              {/* <Form.Field
                                control={Radio}
                                label='Account (public)'
                                value='account'
                                checked={storeLocation === 'account'}
                                onChange={()=>this.setState({storeLocation:'account'})}
                            /> */}
              <Form.Field
                control={Radio}
                label="User (private)"
                value="user"
                checked={storeLocation === 'user'}
                onChange={() => this.setState({ storeLocation: 'user' })}
              />
            </Form.Group>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button
            disabled={mapNameError}
            positive
            onClick={() => this.save(dataFetcher)}
          >
            Create
          </Button>
          <Button style={{ float: 'left' }} negative onClick={this.close}>
            Close
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}
