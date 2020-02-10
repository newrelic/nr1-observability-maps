import React from 'react';
import { Modal, Form, Menu } from 'semantic-ui-react';
import { DataConsumer } from '../../../context/data';
// import MainChart from './main-chart';
import HoverMetrics from './hover-metrics';
// import IconSet from './icon-set';
// import CustomAlertSeverity from './custom-alert-severity';

export default class EditLink extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedEditOption: 'hoverMetrics'
    };
  }

  render() {
    const { selectedEditOption } = this.state;

    // if ((((mapConfig || {}).linkData || {})[selectedLink] || {}).entityType || "" == "CUSTOM_NODE") {
    //     console.log(mapConfig.linkData[selectedLink].entityType);
    //     editOptions.unshift({ key: "n", text: "Name", value: "name" });
    // }

    return (
      <DataConsumer>
        {({ updateDataContextState, editLinkOpen, selectedLink }) => {
          const componentSelect = () => {
            switch (selectedEditOption) {
              case 'hoverMetrics':
                return <HoverMetrics />;
              default:
                return '';
            }
          };

          return (
            <Modal
              closeIcon
              size="large"
              open={editLinkOpen}
              onClose={() => updateDataContextState({ editLinkOpen: false })}
              onUnmount={() => updateDataContextState({ closeCharts: false })}
              onMount={() => updateDataContextState({ closeCharts: true })}
            >
              <Modal.Header>Edit Link - {selectedLink}</Modal.Header>

              <Modal.Content>
                <Menu pointing secondary>
                  <Menu.Item
                    name="Hover Metrics"
                    active={selectedEditOption === 'hoverMetrics'}
                    onClick={() =>
                      this.setState({ selectedEditOption: 'hoverMetrics' })
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
