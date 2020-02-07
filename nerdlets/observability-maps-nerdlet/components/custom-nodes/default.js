/* eslint react/no-access-state-in-setstate: 0 */
import React from 'react';
import { Icon, Popup, Table, Image } from 'semantic-ui-react';
import {
  setAlertDesign,
  setCustomAlertDesign,
  setEntityDesign
} from '../../lib/helper';
import { LineChart, AreaChart, Billboard, PieChart, TableChart } from 'nr1';
import { DataConsumer } from '../../context/data';
import { buildNodeMetrics } from './node-utills';

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

  //   .nr1-dashboards .vz-theme-dark .MosaicWidget {
  //     background-color: #212229;
  //     border: 1px solid transparent;
  // }

  renderContent(metrics) {
    return (
      <>
        {/* <Segment inverted style={{width:"300px", height:"30px"}}>
            test
            </Segment> */}
        <Table inverted compact columns={3} style={{ width: '300px' }}>
          <Table.Body>
            <Table.Row>
              {metrics.map((metric, i) => {
                let value = '';

                // allows support for percentiles
                if (typeof metric.value === 'object' && metric.value !== null) {
                  Object.keys(metric.value).forEach((key, i) => {
                    const isLast = i + 1 === Object.keys(metric.value).length;
                    const keyValue = isNaN(metric.value[key])
                      ? metric.value[key]
                      : metric.value[key].toFixed(4);
                    value = `${value} ${key}: ${keyValue} ${isLast ? '' : '|'}`;
                  });
                } else {
                  value = isNaN(metric.value)
                    ? metric.value
                    : metric.value.toFixed(4);
                }

                return (
                  <Table.Cell key={i}>
                    {value} {metric.unit}
                    <h4>{metric.name}</h4>
                  </Table.Cell>
                );
              })}
            </Table.Row>
          </Table.Body>
        </Table>
      </>
    );
  }

  renderChart(mainChart) {
    if (
      mainChart &&
      mainChart[1] &&
      mainChart[1].nrql &&
      mainChart[1].accountId &&
      mainChart[1].type
    ) {
      switch (mainChart[1].type) {
        case 'line':
          return (
            <LineChart
              className="nr1-dashboards vz-theme-dark MosaicWidget"
              accountId={mainChart[1].accountId}
              query={mainChart[1].nrql}
            />
          );
        case 'area':
          return (
            <AreaChart
              className="nr1-dashboards vz-theme-dark MosaicWidget"
              accountId={mainChart[1].accountId}
              query={mainChart[1].nrql}
            />
          );
        case 'billboard':
          return (
            <Billboard
              className="nr1-dashboards vz-theme-dark MosaicWidget"
              accountId={mainChart[1].accountId}
              query={mainChart[1].nrql}
            />
          );
        case 'pie':
          return (
            <PieChart
              className="nr1-dashboards vz-theme-dark MosaicWidget"
              accountId={mainChart[1].accountId}
              query={mainChart[1].nrql}
            />
          );
        case 'table':
          return (
            <TableChart
              className="nr1-dashboards vz-theme-dark MosaicWidget"
              accountId={mainChart[1].accountId}
              query={mainChart[1].nrql}
            />
          );
        default:
          return 'No Chart Configured';
      }
    } else {
      return 'No Chart Configured';
    }
  }

  renderIcon(userIcons, nodeData, nodeId, isOpen, icon, colorOne, colorTwo) {
    if (nodeData.iconSet) {
      const iconSet = userIcons.filter(set => set.id === nodeData.iconSet)[0];
      if (iconSet && iconSet.document) {
        let iconSrc =
          iconSet.document.red ||
          iconSet.document.orange ||
          iconSet.document.green;

        if (iconSet.document[colorTwo]) {
          iconSrc = iconSet.document[colorTwo];
        }

        if (iconSet) {
          return (
            <Image
              onClick={() =>
                this.setState({
                  [`popup_${nodeId}`]: !this.state[`popup_${nodeId}`]
                })
              }
              className="icon"
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
    userIcons,
    data,
    nodeId,
    metrics,
    icon,
    iconOne,
    colorTwo,
    colorOne,
    closeCharts
  ) => {
    const isOpen = this.state[`popup_${nodeId}`] || false;
    const iconOuter = `circle ${iconOne}`;

    return (
      <Icon.Group size="big">
        {metrics && metrics.length > 0 ? (
          <Popup
            className="popup-custom"
            trigger={
              <Icon loading size="big" color={colorTwo} name={iconOuter} />
            }
            // on="click"
            style={{ borderRadius: 0 }}
            inverted
            hoverable
            mouseLeaveDelay={3000}
            content={this.renderContent(metrics)}
          />
        ) : (
          <Icon loading size="big" color={colorTwo} name={iconOuter} />
        )}

        <Popup
          // className="popup-custom"
          trigger={this.renderIcon(
            userIcons,
            data,
            nodeId,
            isOpen,
            icon,
            colorOne,
            colorTwo
          )}
          on="click"
          style={{ borderRadius: 0 }}
          inverted
          // onClose={() => this.setState({[`popup_${nodeId}`]:false})}
          // onOpen={() => this.setState({[`popup_${nodeId}`]:true})}
          open={this.state[`popup_${nodeId}`] === true && closeCharts === false}
          content={this.renderChart(data.mainChart)}
          position="bottom center"
        />
      </Icon.Group>
    );
  };

  render() {
    const { node, nodeSize } = this.props;

    return (
      <DataConsumer>
        {({ userIcons, mapData, closeCharts }) => {
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
          }

          return (
            <div style={{ height: nodeSize / 10, width: nodeSize / 10 }}>
              <div
                className="centered"
                style={{ height: nodeSize / 10, width: nodeSize / 10 }}
              >
                {this.renderIconGroup(
                  userIcons,
                  data,
                  node.id,
                  metrics,
                  icon,
                  iconOne,
                  colorTwo,
                  colorOne,
                  closeCharts
                )}
              </div>
            </div>
          );
        }}
      </DataConsumer>
    );
  }
}
