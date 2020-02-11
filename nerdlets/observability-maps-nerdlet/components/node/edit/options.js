import React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { DataConsumer } from '../../../context/data';
import { cleanNodeId } from '../../../lib/helper';

export default class Options extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      editName: null
    };
  }

  saveNrql = async (
    updateDataContextState,
    mapConfig,
    selectedNode,
    tempState
  ) => {
    const { editName } = tempState;
    const newName = `${this.state.editName || editName} [CUSTOM_NODE]`;

    // copy old node details to new name
    mapConfig.nodeData[newName] = {
      ...mapConfig.nodeData[selectedNode]
    };

    // recurse links, to create new ones
    Object.keys(mapConfig.linkData).forEach(link => {
      if (
        link.includes(`${selectedNode}:::`) ||
        link.includes(`:::${selectedNode}`)
      ) {
        const newLink = link.replace(selectedNode, newName);

        // create new link
        mapConfig.linkData[newLink] = { ...mapConfig.linkData[link] };
        mapConfig.linkData[newLink].source = mapConfig.linkData[
          newLink
        ].source.replace(selectedNode, newName);
        mapConfig.linkData[newLink].target = mapConfig.linkData[
          newLink
        ].target.replace(selectedNode, newName);

        // delete old link
        delete mapConfig.linkData[link];
      }
    });

    // delete old node last
    delete mapConfig.nodeData[selectedNode];

    await updateDataContextState({ mapConfig }, ['saveMap']);
  };

  render() {
    return (
      <DataConsumer>
        {({ mapConfig, selectedNode, updateDataContextState }) => {
          const tempState = {
            editName: cleanNodeId(selectedNode)
          };

          const value = name =>
            (this.state[name] != null ? this.state[name] : tempState[name]) ||
            '';

          return (
            <>
              <Form.Group widths={16}>
                <Form.Input
                  width={6}
                  fluid
                  label="Rename"
                  placeholder="New Node Name"
                  value={value('editName')}
                  onChange={e => this.setState({ editName: e.target.value })}
                />
              </Form.Group>

              <Button
                positive
                style={{ float: 'right' }}
                onClick={() =>
                  this.saveNrql(
                    updateDataContextState,
                    mapConfig,
                    selectedNode,
                    tempState
                  )
                }
              >
                Save
              </Button>
              <br />
            </>
          );
        }}
      </DataConsumer>
    );
  }
}
