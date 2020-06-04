import React from 'react';
import { Modal, Form, Menu } from 'semantic-ui-react';
import { DataConsumer } from '../../../context/data';
import { cleanNodeId } from '../../../lib/helper';
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

          const splitLink = selectedLink.split(':::');
          const linkTxt =
            splitLink.length === 2
              ? `${cleanNodeId(splitLink[0])} > ${cleanNodeId(splitLink[1])}`
              : selectedLink;

          return (
            <Modal
              closeIcon
              size="fullscreen"
              open={editLinkOpen}
              onClose={() => updateDataContextState({ editLinkOpen: false })}
              onUnmount={() => updateDataContextState({ closeCharts: false })}
              onMount={() => updateDataContextState({ closeCharts: true })}
            >
              <Modal.Header>Edit Link - {linkTxt}</Modal.Header>

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
