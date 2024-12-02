import React from 'react';
import { Modal, Button, Form, Label } from 'semantic-ui-react';
import {
  writeUserDocument,
  deleteUserDocument,
  writeAccountDocument,
  deleteAccountDocument
} from '../../lib/utils';
import { DataConsumer } from '../../context/data';

const iconCollection = 'ObservabilityIcons';

const isValidUrl = string => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export default class ManageIcons extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selected: 'new',
      name: '',
      green: '',
      orange: '',
      red: ''
    };
    this.writeIconSet = this.writeIconSet.bind(this);
    this.handleIconSetChange = this.handleIconSetChange.bind(this);
  }

  writeIconSet(storageLocation, dataFetcher) {
    const { name, green, orange, red, selected } = this.state;
    const documentId = selected === 'new' || name !== '' ? name : selected;

    if (storageLocation?.type === 'account') {
      //
      writeAccountDocument(storageLocation.value, iconCollection, documentId, {
        green,
        orange,
        red
      });
      setTimeout(() => {
        dataFetcher(['accountIcons']);
        this.handleIconSetChange(null);
      }, 1000);
    } else {
      writeUserDocument(iconCollection, documentId, { green, orange, red });
      setTimeout(() => {
        dataFetcher(['userIcons']);
        this.handleIconSetChange(null);
      }, 1000);
    }
  }

  deleteIconSet(storageLocation, selected, dataFetcher) {
    if (storageLocation?.type === 'account') {
      deleteAccountDocument(storageLocation.value, iconCollection, selected);
      setTimeout(() => {
        dataFetcher(['accountIcons']);
        this.handleIconSetChange(null);
      }, 1000);
    } else {
      deleteUserDocument(iconCollection, selected);
      setTimeout(() => {
        dataFetcher(['userIcons']);
        this.handleIconSetChange(null);
      }, 1000);
    }
  }

  handleIconSetChange(storageLocation, value, selectedIcons) {
    this.setState({ selected: value });
    if (value === 'new' || !value) {
      this.setState({
        name: '',
        green: '',
        orange: '',
        red: ''
      });
    } else {
      for (let i = 0; i < selectedIcons.length; i++) {
        if (selectedIcons[i].id === value) {
          this.setState({
            name: selectedIcons[i].id,
            green: selectedIcons[i].document.green,
            orange: selectedIcons[i].document.orange,
            red: selectedIcons[i].document.red
          });
          break;
        }
      }
    }
  }

  render() {
    const { selected, name, green, orange, red } = this.state;

    return (
      <DataConsumer>
        {({
          userIcons,
          accountIcons,
          updateDataContextState,
          dataFetcher,
          storageLocation
        }) => {
          const selectedIcons =
            storageLocation?.type === 'account' ? accountIcons : userIcons;

          const options = selectedIcons.map((set, i) => ({
            key: i,
            text: set.id.replaceAll('+', ' ').replaceAll('-', ' '),
            value: set.id,
            data: set.document
          }));
          options.unshift({ key: 'new', text: 'New Icon Set', value: 'new' });

          return (
            <Modal
              closeIcon
              size="large"
              onUnmount={() => updateDataContextState({ closeCharts: false })}
              onMount={() => updateDataContextState({ closeCharts: true })}
              trigger={
                <Button icon="edit" content="Icons" className="filter-button" />
              }
            >
              <Modal.Header>Manage Icons</Modal.Header>
              <Modal.Content>
                <Form>
                  <Form.Group inline widths="16">
                    <Form.Select
                      width="10"
                      style={{
                        display: 'inline',
                        width: '100%',
                        position: ''
                      }}
                      search
                      fluid
                      options={options}
                      placeholder="Select Icon Set"
                      value={selected}
                      onChange={(e, d) =>
                        this.handleIconSetChange(
                          storageLocation,
                          d.value,
                          selectedIcons
                        )
                      }
                    />
                    <Form.Button
                      width="3"
                      style={{ display: 'inline', width: '100%' }}
                      control={Button}
                      positive
                      disabled={
                        name === '' &&
                        green === '' &&
                        orange === '' &&
                        red === ''
                      }
                      content={selected === 'new' ? 'Clear' : 'Create New'}
                      onClick={() =>
                        this.setState({
                          selected: 'new',
                          name: '',
                          green: '',
                          orange: '',
                          red: ''
                        })
                      }
                    />
                    <Form.Button
                      width="3"
                      style={{ display: 'inline', width: '100%' }}
                      control={Button}
                      negative
                      disabled={selected === '' || selected === 'new'}
                      content="Delete"
                      onClick={() =>
                        this.deleteIconSet(
                          storageLocation,
                          selected,
                          dataFetcher
                        )
                      }
                    />
                  </Form.Group>
                </Form>

                <br />
                <Form.Group widths="16">
                  <Form.Input
                    width={16}
                    fluid
                    label="Name"
                    placeholder="Icon Set Name"
                    value={name.replaceAll('+', ' ').replaceAll('-', ' ')}
                    onChange={e => this.setState({ name: e.target.value })}
                  />
                  <Label
                    style={{
                      display:
                        (selected === 'new' && name === '') ||
                        (selected === '' && name === '' ? '' : 'none')
                    }}
                    color="red"
                    pointing
                  >
                    Please select an existing icon set to update or enter a name
                  </Label>
                  <br />
                  <Form.Input
                    width={16}
                    fluid
                    label="Healthy Icon"
                    placeholder="http://somewebsite.com/someHealthyIcon.png"
                    value={green}
                    onChange={e => this.setState({ green: e.target.value })}
                  />
                  <Label
                    style={{ display: isValidUrl(green) ? 'none' : '' }}
                    color="red"
                    pointing
                  >
                    Please enter a valid URL
                  </Label>
                  <br />
                  <Form.Input
                    width={16}
                    fluid
                    label="Warning Icon"
                    placeholder="selectedIcons"
                    value={orange}
                    onChange={e => this.setState({ orange: e.target.value })}
                  />
                  <Label
                    style={{ display: isValidUrl(orange) ? 'none' : '' }}
                    color="red"
                    pointing
                  >
                    Please enter a valid URL
                  </Label>
                  <br />
                  <Form.Input
                    width={16}
                    fluid
                    label="Critical Icon"
                    placeholder="http://somewebsite.com/someCriticalIcon.png"
                    value={red}
                    onChange={e => this.setState({ red: e.target.value })}
                  />
                  <Label
                    style={{ display: isValidUrl(red) ? 'none' : '' }}
                    color="red"
                    pointing
                  >
                    Please enter a valid URL
                  </Label>
                  <br />
                </Form.Group>
              </Modal.Content>
              <Modal.Actions>
                <Button
                  style={{ float: 'right' }}
                  positive
                  disabled={
                    (selected === 'new' && name === '') ||
                    (selected === '' && name === '') ||
                    !isValidUrl(green)
                  }
                  onClick={() =>
                    this.writeIconSet(storageLocation, dataFetcher)
                  }
                >
                  Save
                </Button>
                <br /> <br />
              </Modal.Actions>
            </Modal>
          );
        }}
      </DataConsumer>
    );
  }
}
