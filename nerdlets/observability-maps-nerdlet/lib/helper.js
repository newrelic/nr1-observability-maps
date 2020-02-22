// shared helper utilities

export const setAlertDesign = (alertSeverity, entityType) => {
  switch (entityType) {
    case 'APM_EXTERNAL_SERVICE_ENTITY':
      return { colorOne: 'green', colorTwo: 'green', iconOne: 'outline' };
  }

  switch (alertSeverity) {
    case 'NOT_CONFIGURED':
      return { colorOne: 'grey', colorTwo: 'grey', iconOne: 'notch' };
    case 'CRITICAL':
      return { colorOne: 'red', colorTwo: 'red', iconOne: 'notch' };
    case 'WARNING':
      return { colorOne: 'orange', colorTwo: 'red', iconOne: 'notch' };
    case 'NOT_ALERTING':
      return { colorOne: 'green', colorTwo: 'green', iconOne: 'outline' };
    default:
      return { colorOne: 'grey', colorTwo: 'grey', iconOne: 'notch' };
  }
};

export const setEntityDesign = entityType => {
  switch (entityType) {
    case 'APM_EXTERNAL_SERVICE_ENTITY':
      return { icon: 'globe' };
    case 'APM_APPLICATION_ENTITY':
      return { icon: 'cube' };
    case 'INFRASTRUCTURE_HOST_ENTITY':
      return { icon: 'server' };
    case 'BROWSER_APPLICATION_ENTITY':
      return { icon: 'computer' };
    case 'MOBILE_APPLICATION_ENTITY':
      return { icon: 'mobile' };
    case 'CUSTOM_ACCOUNT':
      return { icon: 'sitemap' };
    default:
      return { icon: 'circle' };
  }
};

export const customAlertCalc = (valueOne, valueTwo, operator) => {
  switch (operator) {
    case '=':
      if (valueOne === valueTwo) return true;
      break;
    case '!=':
      if (valueOne !== valueTwo) return true;
      break;
    case '>':
      if (valueOne > valueTwo) return true;
      break;
    case '<':
      if (valueOne < valueTwo) return true;
      break;
    case '>=':
      if (valueOne >= valueTwo) return true;
      break;
    case '<=':
      if (valueOne <= valueTwo) return true;
      break;
  }
  return false;
};

export const setCustomAlertDesign = (alert, alertData) => {
  if (alertData[0].value || alertData[0].value === 0) {
    if (
      customAlertCalc(
        alertData[0].value,
        alert.alertCritical,
        alert.alertCriticalOperator
      )
    ) {
      return { colorOne: 'red', colorTwo: 'red', iconOne: 'notch' };
    }
    if (
      customAlertCalc(
        alertData[0].value,
        alert.alertWarning,
        alert.alertWarningOperator
      )
    ) {
      return { colorOne: 'orange', colorTwo: 'orange', iconOne: 'notch' };
    }
    if (
      customAlertCalc(
        alertData[0].value,
        alert.alertHealthy,
        alert.alertHealthyOperator
      )
    ) {
      return { colorOne: 'green', colorTwo: 'green', iconOne: 'outline' };
    }
  }
  return { colorOne: 'grey', colorTwo: 'grey', iconOne: 'notch' };
};

// chunking for batching nerdgraph calls
export const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

// strip special domain tags added
export const cleanNodeId = nodeId => {
  [
    '[APM]',
    '[INFRA]',
    '[BROWSER]',
    '[SYNTH]',
    '[MOBILE]',
    '[CUSTOM_NODE]',
    '[CUSTOM_ACC]'
  ].forEach(word => {
    nodeId = nodeId.replace(word, '');
  });
  return nodeId.trim();
};

export const validateNRQL = (nrql, chart) => {
  if (!nrql.includes('SELECT')) {
    return 'SELECT not used';
  }
  if (!nrql.includes('FROM')) {
    return 'FROM not used';
  }

  if (chart) {
    if (
      (chart === 'line' || chart === 'area') &&
      !nrql.includes('TIMESERIES')
    ) {
      return 'TIMESERIES should be used for line or area charts';
    }

    if (
      nrql.includes('TIMESERIES') &&
      (chart === 'billboard' || chart === 'pie' || chart === 'table')
    ) {
      return `TIMESERIES cannot be used for ${chart} chart`;
    }
  }

  return '';
};
