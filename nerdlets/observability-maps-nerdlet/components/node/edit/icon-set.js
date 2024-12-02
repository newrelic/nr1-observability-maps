import React from 'react';
import { Header, Form } from 'semantic-ui-react';
import { DataConsumer } from '../../../context/data';

export default class IconSet extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      iconSet: ''
    };
  }

  saveNrql = async (updateDataContextState, mapConfig, nodeId, iconSet) => {
    mapConfig.nodeData[nodeId].iconSet = iconSet;
    await updateDataContextState({ mapConfig }, ['saveMap']);
  };

  render() {
    return (
      <DataConsumer>
        {({
          userIcons,
          accountIcons,
          mapConfig,
          selectedNode,
          updateDataContextState
        }) => {
          const iconSelection = userIcons.map(set => ({
            key: set.id,
            value: set.id,
            text: set.id
          }));

          accountIcons.forEach(set => {
            iconSelection.push({
              key: `account_${set.id}`,
              value: set.id,
              text: set.id
            });
          });

          iconSelection.unshift({
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
                  options={iconSelection}
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
