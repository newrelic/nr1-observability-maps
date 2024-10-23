import React from 'react';
import { Modal, Button, Form, Label } from 'semantic-ui-react';
import { writeUserDocument, deleteUserDocument, writeAccountDocument } from '../../lib/utils';
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

  writeIconSet(dataFetcher, storageLocation) {
    //use condition to save icon settings to User/Account type respectively.
    const { name, green, orange, red, selected } = this.state;
    const documentId = selected === 'new' || name !== '' ? name : selected;
    console.log(storageLocation);
    // writeUserDocument(iconCollection, documentId, { green, orange, red }); // commented to test storage of settings

    if (storageLocation.type === 'user') {
      writeUserDocument(iconCollection, documentId, { green, orange, red });
    } else if (storageLocation.type === 'account') {
      writeAccountDocument(
        storageLocation.value,
        iconCollection, documentId, { green, orange, red }
      );
    }
    dataFetcher(['userIcons']);
    this.handleIconSetChange(null);
  }

  deleteIconSet(selected, dataFetcher) {
    deleteUserDocument(iconCollection, selected);
    dataFetcher(['userIcons']);
    this.handleIconSetChange(null);
  }

  handleIconSetChange(value, userIcons) {
    console.log(userIcons, "icons");
    this.setState({ selected: value });
    if (value === 'new' || !value) {
      this.setState({
        name: '',
        green: '',
        orange: '',
        red: ''
      });
    } else {
      for (let i = 0; i < userIcons.length; i++) {
        if (userIcons[i].id === value) {
          this.setState({
            name: userIcons[i].id,
            green: userIcons[i].document.green,
            orange: userIcons[i].document.orange,
            red: userIcons[i].document.red
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
        {({ userIcons, updateDataContextState, dataFetcher, storageLocation }) => {
          const options = userIcons.map((set, i) => ({
            key: i,
            text: set.id.replaceAll('+', ' ').replaceAll('-', ' '),
            value: set.id,
            data: set.document
          }));
          console.log(userIcons,  'list');
          options.unshift({ key: 'new', text: 'New Icon Set', value: 'new' });
          return (
            <Modal
              closeIcon
              size="large"
              onUnmount={() => updateDataContextState({ closeCharts: false })}
              onMount={() => updateDataContextState({ closeCharts: true })}
              trigger={
                <Button icon="edit" content="Icons" className="filter-button" style={{ height: '35px', width: '60px' }} />
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
                        this.handleIconSetChange(d.value, userIcons)
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
                      onClick={() => this.deleteIconSet(selected, dataFetcher)}
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
                    placeholder="http://somewebsite.com/someWarningIcon.png"
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
                  onClick={() => this.writeIconSet(dataFetcher, storageLocation)}
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
