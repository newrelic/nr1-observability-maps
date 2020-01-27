/* eslint react/no-access-state-in-setstate: 0 */
import React from 'react';
import { Icon, Popup, Table, Image } from 'semantic-ui-react';
import {
  setAlertDesign,
  setCustomAlertDesign,
  setEntityDesign
} from '../../lib/helper';
import { LineChart, AreaChart, Billboard, PieChart, TableChart } from 'nr1';

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

  renderIcon(nodeData, nodeId, isOpen, icon, colorOne, colorTwo) {
    if (nodeData.iconSet) {
      const iconSet = this.props.userIcons.filter(
        set => set.id === nodeData.iconSet
      )[0];
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

  render() {
    const { node, mapData, nodeSize, closeCharts } = this.props;
    const data = ((mapData || {}).nodeData || {})[node.id] || {};

    // need logic to determine node health
    const style = {
      borderRadius: 0
      // opacity: 0.7,
      // padding: '2em',
    };

    const icon = data.icon || setEntityDesign(data.entityType).icon;
    const metrics = [];

    if (
      data.hoverType === 'customNrql' &&
      data.hoverData &&
      data.hoverData.length > 0
    ) {
      data.hoverData.forEach(item => {
        metrics.push({ value: item.value, name: item.name, unit: '' });
      });
    } else if (data.apmSummary) {
      if (data.apmSummary.throughput)
        metrics.push({
          value: data.apmSummary.throughput,
          unit: 'rpm',
          name: 'throughput'
        });
      if (data.apmSummary.responseTimeAverage)
        metrics.push({
          value: data.apmSummary.responseTimeAverage,
          unit: 'ms',
          name: 'latency'
        });
      if (data.apmSummary.errorRate)
        metrics.push({
          value: data.apmSummary.errorRate,
          unit: '%',
          name: 'errors'
        });
    } else if (data.mobileSummary) {
      if (data.mobileSummary.httpRequestRate)
        metrics.push({
          value: data.mobileSummary.httpRequestRate,
          unit: 'rpm',
          name: 'request rate'
        });
      if (data.mobileSummary.httpResponseTimeAverage)
        metrics.push({
          value: data.mobileSummary.httpResponseTimeAverage,
          unit: 'ms',
          name: 'latency'
        });
      if (data.mobileSummary.httpErrorRate)
        metrics.push({
          value: data.mobileSummary.httpErrorRate,
          unit: '%',
          name: 'errors'
        });
    } else if (data.externalSummary) {
      if (data.externalSummary.throughput)
        metrics.push({
          value: data.externalSummary.throughput,
          unit: 'rpm',
          name: 'throughput'
        });
      if (data.externalSummary.responseTimeAverage)
        metrics.push({
          value: data.externalSummary.responseTimeAverage,
          unit: 'ms',
          name: 'latency'
        });
    } else if (data.browserSummary) {
      // ajaxRequestThroughput: 49
      // ajaxResponseTimeAverage: 0.156681
      // jsErrorRate: 9.375
      // pageLoadThroughput: 53.333333
      // pageLoadTimeAverage: 1.292042
      // pageLoadTimeMedian: 0.857
      // spaResponseTimeAverage: 1.204
      // spaResponseTimeMedian: 0.871
      if (data.browserSummary.spaResponseTimeAverage)
        metrics.push({
          value: data.browserSummary.spaResponseTimeAverage,
          unit: 'ms',
          name: 'spa latency'
        });
      if (data.browserSummary.pageLoadTimeAverage)
        metrics.push({
          value: data.browserSummary.pageLoadTimeAverage,
          unit: 'ms',
          name: 'page latency'
        });
      if (data.browserSummary.pageLoadThroughput)
        metrics.push({
          value: data.browserSummary.pageLoadThroughput,
          unit: 'rpm',
          name: 'page load throughput'
        });
      if (data.browserSummary.jsErrorRate)
        metrics.push({
          value: data.browserSummary.jsErrorRate,
          unit: '%',
          name: 'js errors'
        });
    }

    let { colorOne, colorTwo, iconOne } = setAlertDesign(
      data.alertSeverity,
      data.entityType
    );
    if (data.customAlert && data.customAlertData && data.customAlertData[0]) {
      const customAlertDesign = setCustomAlertDesign(
        data.customAlert,
        data.customAlertData
      );
      colorOne = customAlertDesign.colorOne;
      colorTwo = customAlertDesign.colorTwo;
    }

    const renderIconGroup = (
      data,
      nodeId,
      metrics,
      icon,
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
              style={style}
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
              data,
              nodeId,
              isOpen,
              icon,
              colorOne,
              colorTwo
            )}
            on="click"
            style={style}
            inverted
            // onClose={() => this.setState({[`popup_${nodeId}`]:false})}
            // onOpen={() => this.setState({[`popup_${nodeId}`]:true})}
            open={
              this.state[`popup_${nodeId}`] === true && closeCharts === false
            }
            content={this.renderChart(data.mainChart)}
            position="bottom center"
          />
        </Icon.Group>
      );
    };

    return (
      <div style={{ height: nodeSize / 10, width: nodeSize / 10 }}>
        <div
          className="centered"
          style={{ height: nodeSize / 10, width: nodeSize / 10 }}
        >
          {renderIconGroup(
            data,
            node.id,
            metrics,
            icon,
            colorTwo,
            colorOne,
            closeCharts
          )}
        </div>
      </div>
    );
  }
}
