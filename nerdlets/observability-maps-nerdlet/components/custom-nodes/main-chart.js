import React from 'react';
import {
  LineChart,
  AreaChart,
  BillboardChart,
  PieChart,
  TableChart
} from 'nr1';

export default class MainChart extends React.PureComponent {
  render() {
    const { mainChart } = this.props;

    const chart = mainChart => {
      switch (mainChart[1].type) {
        case 'line':
          return (
            <LineChart
              className="nr1-dashboards vz-theme-dark MosaicWidget"
              accountIds={[mainChart[1].accountId]}
              query={mainChart[1].nrql}
            />
          );
        case 'area':
          return (
            <AreaChart
              className="nr1-dashboards vz-theme-dark MosaicWidget"
              accountIds={[mainChart[1].accountId]}
              query={mainChart[1].nrql}
            />
          );
        case 'billboard':
          if (!mainChart[1].nrql.includes('TIMESERIES')) {
            return (
              <BillboardChart
                className="nr1-dashboards vz-theme-dark MosaicWidget"
                accountIds={[mainChart[1].accountId]}
                query={mainChart[1].nrql}
              />
            );
          }
          return 'Misconfigured Chart';
        case 'pie':
          if (!mainChart[1].nrql.includes('TIMESERIES')) {
            return (
              <PieChart
                className="nr1-dashboards vz-theme-dark MosaicWidget"
                accountIds={[mainChart[1].accountId]}
                query={mainChart[1].nrql}
              />
            );
          }
          return 'Misconfigured Chart';
        case 'table':
          if (!mainChart[1].nrql.includes('TIMESERIES')) {
            return (
              <TableChart
                className="nr1-dashboards vz-theme-dark MosaicWidget"
                accountIds={[mainChart[1].accountId]}
                query={mainChart[1].nrql}
              />
            );
          }
          return 'Misconfigured Chart';
        default:
          return 'No Chart Configured';
      }
    };

    return mainChart &&
      mainChart[1] &&
      mainChart[1].nrql &&
      mainChart[1].accountId &&
      mainChart[1].type
      ? chart(mainChart)
      : 'No Chart Configured';
  }
}
