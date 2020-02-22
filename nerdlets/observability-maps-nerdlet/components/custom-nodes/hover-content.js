import React from 'react';
import { Table } from 'semantic-ui-react';

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

                // allows support for percentiles
                if (typeof metric.value === 'object' && metric.value !== null) {
                  Object.keys(metric.value).forEach((key, i) => {
                    const isLast = i + 1 === Object.keys(metric.value).length;
                    const keyValue = isNaN(metric.value[key])
                      ? metric.value[key]
                      : metric.value[key].toFixed(4);
                    value = `${value} ${key}: ${keyValue} ${isLast ? '' : '|'}`;
                  });
                } else if (metric.value) {
                  value = isNaN(metric.value)
                    ? metric.value
                    : metric.value.toFixed(2);
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
}
