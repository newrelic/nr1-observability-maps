/* eslint react/no-access-state-in-setstate: 0 */
import React from 'react';
import { Icon, Popup, Image } from 'semantic-ui-react';
import {
  setAlertDesign,
  setCustomAlertDesign,
  setEntityDesign
} from '../../lib/helper';
import { DataConsumer } from '../../context/data';
import { buildNodeMetrics } from './node-utils';
import MainChart from './main-chart';
import HoverContent from './hover-content';
// const languageIcons = {
//   java: "https://image.flaticon.com/icons/svg/226/226777.svg",
//   nodejs: "https://image.flaticon.com/icons/svg/919/919825.svg",
//   golang:
//     "https://d2btr9yg6upxbz.cloudfront.net//wp-content/uploads/2019/01/icon_go_new.svg",
//   python: "https://image.flaticon.com/icons/svg/1387/1387537.svg",
// };

export default class CustomNode extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.renderIcon = this.renderIcon.bind(this);
  }

  renderIcon(
    accountIcons,
    userIcons,
    nodeData,
    nodeId,
    isOpen,
    icon,
    colorOne
  ) {
    if (nodeData.iconSet) {
      const iconSet = [...userIcons, ...accountIcons].filter(
        set => set.id === nodeData.iconSet
      )[0];
      if (iconSet && iconSet.document) {
        let iconSrc =
          iconSet.document.red ||
          iconSet.document.orange ||
          iconSet.document.green;

        if (iconSet.document[colorOne]) {
          iconSrc = iconSet.document[colorOne];
        }

        if (iconSet) {
          return (
            <Image
              onClick={() =>
                this.setState({
                  [`popup_${nodeId}`]: !this.state[`popup_${nodeId}`]
                })
              }
              className="om-icon icon"
              style={{
                zIndex: 999999,
                height: '35px',
                width: '35px',
                borderRadius: '50%'
              }}
              src={iconSrc}
            />
          );
        }
      }
    }
    return (
      <Icon
        onClick={() => this.setState({ [`popup_${nodeId}`]: !isOpen })}
        name={icon}
        color={colorOne}
      />
    );
  }

  renderIconGroup = (
    accountIcons,
    userIcons,
    data,
    nodeId,
    metrics,
    icon,
    iconOne,
    colorTwo,
    colorOne,
    closeCharts,
    iconSpinSpeed
  ) => {
    const isOpen = this.state[`popup_${nodeId}`] || false;
    const iconOuter = `circle ${iconOne}`;

    return (
      <Icon.Group size="big">
        {metrics && metrics.length > 0 ? (
          <Popup
            className="popup-custom"
            trigger={
              <Icon
                loading
                size="big"
                className={`spin-speed-${iconSpinSpeed}`}
                color={colorTwo}
                name={iconOuter}
              />
            }
            // on="click"
            style={{ borderRadius: 0 }}
            inverted
            hoverable
            mouseLeaveDelay={3000}
            content={<HoverContent metrics={metrics} />}
          />
        ) : (
          <Icon
            className={`spin-speed-${iconSpinSpeed}`}
            loading
            size="big"
            color={colorTwo}
            name={iconOuter}
          />
        )}

        <Popup
          // className="popup-custom"
          trigger={this.renderIcon(
            accountIcons,
            userIcons,
            data,
            nodeId,
            isOpen,
            icon,
            colorOne
          )}
          on="click"
          style={{ borderRadius: 0 }}
          inverted
          open={this.state[`popup_${nodeId}`] === true && closeCharts === false}
          content={<MainChart mainChart={data.mainChart} />}
          position="bottom center"
        />
      </Icon.Group>
    );
  };

  render() {
    const { node, nodeSize } = this.props;

    return (
      <DataConsumer>
        {({ userIcons, accountIcons, mapData, closeCharts, mapConfig }) => {
          const data = ((mapData || {}).nodeData || {})[node.id] || {};
          const icon = data.icon || setEntityDesign(data.entityType).icon;
          const metrics = buildNodeMetrics(data);

          let { colorOne, colorTwo, iconOne } = setAlertDesign(
            data.alertSeverity,
            data.entityType
          );
          if (
            data.customAlert &&
            data.customAlertData &&
            data.customAlertData[0]
          ) {
            const customAlertDesign = setCustomAlertDesign(
              data.customAlert,
              data.customAlertData
            );
            colorOne = customAlertDesign.colorOne;
            colorTwo = customAlertDesign.colorTwo;
            iconOne = customAlertDesign.iconOne;
          }

          const iconSpinSpeed = mapConfig?.settings?.iconSpinSpeed || '2';

          return (
            <div style={{ height: nodeSize / 10, width: nodeSize / 10 }}>
              <div
                className="centered"
                style={{ height: nodeSize / 10, width: nodeSize / 10 }}
              >
                {this.renderIconGroup(
                  accountIcons,
                  userIcons,
                  data,
                  node.id,
                  metrics,
                  icon,
                  iconOne,
                  colorTwo,
                  colorOne,
                  closeCharts,
                  iconSpinSpeed
                )}
              </div>
            </div>
          );
        }}
      </DataConsumer>
    );
  }
}
