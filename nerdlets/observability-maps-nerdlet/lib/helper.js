// shared helper utilities

export const setAlertDesign = (alertSeverity, entityType) => {
  switch (entityType) {
    case 'APM_EXTERNAL_SERVICE_ENTITY':
      return { colorOne: 'green', colorTwo: 'green', iconOne: 'outline' };
  }

  switch (alertSeverity) {
    case 'NOT_CONFIGURED':
      return { colorOne: 'grey', colorTwo: 'orange', iconOne: 'notch' };
    case 'CRITICAL':
      return { colorOne: 'red', colorTwo: 'red', iconOne: 'notch' };
    case 'WARNING':
      return { colorOne: 'orange', colorTwo: 'red', iconOne: 'notch' };
    case 'NOT_ALERTING':
      return { colorOne: 'green', colorTwo: 'green', iconOne: 'outline' };
    default:
      return { colorOne: 'grey', colorTwo: 'orange', iconOne: 'notch' };
  }
};

export const setEntityDesign = entityType => {
  switch (entityType) {
    case 'APM_EXTERNAL_SERVICE_ENTITY':
      return { icon: 'globe' };
    case 'APM_APPLICATION_ENTITY':
      return { icon: 'box' };
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
      return { colorOne: 'red', colorTwo: 'red' };
    }
    if (
      customAlertCalc(
        alertData[0].value,
        alert.alertWarning,
        alert.alertWarningOperator
      )
    ) {
      return { colorOne: 'orange', colorTwo: 'orange' };
    }
    if (
      customAlertCalc(
        alertData[0].value,
        alert.alertHealthy,
        alert.alertHealthyOperator
      )
    ) {
      return { colorOne: 'green', colorTwo: 'green' };
    }
  }
  return { colorOne: 'grey', colorTwo: 'orange' };
};

// chunking for batching nerdgraph calls
export const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

// strip special domain tags added
export const cleanNodeId = nodeId => {
  ['[APM]', '[INFRA]', '[BROWSER]', '[SYNTH]', '[MOBILE]'].forEach(word => {
    nodeId = nodeId.replace(word, '');
  });
  return nodeId.trim();
};
