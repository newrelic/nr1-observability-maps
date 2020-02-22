export const buildNodeMetrics = data => {
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
  } else if (data.monitorSummary) {
    if (data.monitorSummary.successRate)
      metrics.push({
        value: data.monitorSummary.successRate,
        unit: '%',
        name: 'success rate'
      });
    if (data.monitorSummary.locationsFailing)
      metrics.push({
        value: data.monitorSummary.locationsFailing,
        unit: '',
        name: 'locations failing'
      });
    if (data.monitorSummary.locationsRunning)
      metrics.push({
        value: data.monitorSummary.locationsRunning,
        unit: '',
        name: 'locations running'
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
  } else if (data.dbSummary) {
    if (data.dbSummary.host)
      metrics.push({
        value: data.dbSummary.host,
        unit: '',
        name: ''
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

  return metrics;
};
