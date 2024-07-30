import React from 'react';
import { Table } from 'semantic-ui-react';
import { niceMetricName } from '../../lib/helper';

export default class HoverContent extends React.PureComponent {
  render() {
    const { metrics } = this.props;
    return (
      <>
        <Table inverted compact columns={3} style={{ width: '300px' }}>
          <Table.Body>
            <Table.Row>
              {metrics.map((metric, i) => {
                let value = '';

                if (metric.value) {
                  // allows support for percentiles
                  if (
                    typeof metric.value === 'object' &&
                    metric.value !== null
                  ) {
                    Object.keys(metric.value).forEach((key, i) => {
                      const isLast = i + 1 === Object.keys(metric.value).length;
                      const keyValue = isNaN(metric.value[key])
                        ? metric.value[key]
                        : metric.value[key].toFixed(4);
                      value = `${value} ${key}: ${keyValue} ${
                        isLast ? '' : '|'
                      }`;
                    });
                  } else if (metric.value || metric.value === 0) {
                    value = isNaN(metric.value)
                      ? metric.value
                      : parseFloat(metric.value)
                          .toFixed(2)
                          .toString();
                  }
                }

                return (
                  <Table.Cell key={i}>
                    {value} {metric.unit}
                    <h5 style={{ color: 'white' }}>
                      {niceMetricName(metric.name)}
                    </h5>
                  </Table.Cell>
                );
              })}
            </Table.Row>
          </Table.Body>
        </Table>
      </>
    );
  }
}
