import React from 'react';
import { Modal, Form, Menu } from 'semantic-ui-react';
import { DataConsumer } from '../../../context/data';
import MainChart from './main-chart';
import HoverMetrics from './hover-metrics';
import IconSet from './icon-set';
import CustomAlertSeverity from './custom-alert-severity';

export default class EditNode extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedEditOption: 'hoverMetrics'
    };
  }

  render() {
    const { selectedEditOption } = this.state;

    // if ((((mapConfig || {}).nodeData || {})[selectedNode] || {}).entityType || "" == "CUSTOM_NODE") {
    //     console.log(mapConfig.nodeData[selectedNode].entityType);
    //     editOptions.unshift({ key: "n", text: "Name", value: "name" });
    // }

    return (
      <DataConsumer>
        {({ updateDataContextState, editNodeOpen, selectedNode }) => {
          const componentSelect = () => {
            switch (selectedEditOption) {
              case 'mainChart':
                return <MainChart />;
              case 'hoverMetrics':
                return <HoverMetrics />;
              case 'iconSet':
                return <IconSet />;
              case 'customAlertSeverity':
                return <CustomAlertSeverity />;
              default:
                return '';
            }
          };

          return (
            <Modal
              closeIcon
              size="large"
              open={editNodeOpen}
              onClose={() => updateDataContextState({ editNodeOpen: false })}
              onUnmount={() => updateDataContextState({ closeCharts: false })}
              onMount={() => updateDataContextState({ closeCharts: true })}
            >
              <Modal.Header>Edit Node - {selectedNode}</Modal.Header>

              <Modal.Content>
                <Menu pointing secondary>
                  <Menu.Item
                    name="Hover Metrics"
                    active={selectedEditOption === 'hoverMetrics'}
                    onClick={() =>
                      this.setState({ selectedEditOption: 'hoverMetrics' })
                    }
                  />
                  <Menu.Item
                    name="Main Chart"
                    active={selectedEditOption === 'mainChart'}
                    onClick={() =>
                      this.setState({ selectedEditOption: 'mainChart' })
                    }
                  />
                  <Menu.Item
                    name="Icon Set"
                    active={selectedEditOption === 'iconSet'}
                    onClick={() =>
                      this.setState({ selectedEditOption: 'iconSet' })
                    }
                  />
                  <Menu.Item
                    name="Custom Alerting"
                    active={selectedEditOption === 'customAlertSeverity'}
                    onClick={() =>
                      this.setState({
                        selectedEditOption: 'customAlertSeverity'
                      })
                    }
                  />
                </Menu>

                <Form>{componentSelect()}</Form>
              </Modal.Content>
            </Modal>
          );
        }}
      </DataConsumer>
    );
  }
}
