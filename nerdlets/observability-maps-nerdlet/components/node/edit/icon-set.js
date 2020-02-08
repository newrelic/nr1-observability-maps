import React from 'react';
import { Header, Form } from 'semantic-ui-react';
import { DataConsumer } from '../../../context/data';

export default class IconSet extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      iconSet: '',
      isSaving: false
    };
  }

  saveNrql = async (updateDataContextState, mapConfig, nodeId, iconSet) => {
    this.setState({ isSaving: true }, async () => {
      mapConfig.nodeData[nodeId].iconSet = iconSet;
      await updateDataContextState({ mapConfig }, ['saveMap']);
      this.setState({ isSaving: false });
    });
  };

  render() {
    return (
      <DataConsumer>
        {({ userIcons, mapConfig, selectedNode, updateDataContextState }) => {
          const userIconSelection = userIcons.map(set => ({
            key: set.id,
            value: set.id,
            text: set.id
          }));
          userIconSelection.unshift({
            key: 'default',
            text: 'Default',
            value: 'default'
          });

          const tempState = {
            iconSet: ''
          };

          if (mapConfig.nodeData[selectedNode].iconSet) {
            tempState.iconSet = mapConfig.nodeData[selectedNode].iconSet;
          }

          return (
            <>
              <Header as="h4">Select an Icon Set</Header>

              <Form.Group inline widths="16">
                <Form.Select
                  width="16"
                  style={{ display: 'inline', width: '100%' }}
                  search
                  options={userIconSelection}
                  placeholder="Select Icon Set"
                  value={
                    this.state.iconSet === ''
                      ? tempState.iconSet
                      : this.state.iconSet
                  }
                  onChange={(e, d) =>
                    this.saveNrql(
                      updateDataContextState,
                      mapConfig,
                      selectedNode,
                      d.value
                    )
                  }
                />
              </Form.Group>
              <br />
            </>
          );
        }}
      </DataConsumer>
    );
  }
}
