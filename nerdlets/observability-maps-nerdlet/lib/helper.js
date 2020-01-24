// shared helper utilities

export const setAlertDesign = (alertSeverity, entityType) => {
    switch (entityType) {
        case "APM_EXTERNAL_SERVICE_ENTITY":
            return { colorOne: "green", colorTwo: "green", iconOne: "outline" };
    }

    switch (alertSeverity) {
        case "NOT_CONFIGURED":
            return { colorOne: "grey", colorTwo: "orange", iconOne: "notch" };
        case "CRITICAL":
            return { colorOne: "red", colorTwo: "red", iconOne: "notch" };
        case "WARNING":
            return { colorOne: "orange", colorTwo: "red", iconOne: "notch" };
        case "NOT_ALERTING":
            return { colorOne: "green", colorTwo: "green", iconOne: "outline" };
        default:
            return { colorOne: "grey", colorTwo: "orange", iconOne: "notch" };
    }
};

export const setEntityDesign = entityType => {
    switch (entityType) {
        case "APM_EXTERNAL_SERVICE_ENTITY":
            return { icon: "globe" };
        case "APM_APPLICATION_ENTITY":
            return { icon: "box" };
        case "INFRASTRUCTURE_HOST_ENTITY":
            return { icon: "server" };
        case "MOBILE_APPLICATION_ENTITY":
            return { icon: "mobile" };
        case "CUSTOM_ACCOUNT":
            return { icon: "sitemap" };
        default:
            return { icon: "circle" };
    }
};

export const setLinkData = (link, linkData) => {
    let id = `${link.source}:::${link.target}`;
    let text = "";

    if (linkData[id]) {
        if (linkData[id].hoverData && linkData[id].hoverData.length > 0) {
            linkData[id].hoverData.forEach(metric => {
                // allows support for percentiles
                if (typeof metric.value === "object" && metric.value !== null) {
                    Object.keys(metric.value).forEach((key, i) => {
                        let isLast = i + 1 == Object.keys(metric.value).length;
                        let keyValue = isNaN(metric.value[key]) ? metric.value[key] : metric.value[key].toFixed(2);
                        text = text + ` ${key}: ${keyValue} ${isLast ? "" : "|"}`;
                    });
                } else {
                    let metricValue = isNaN(metric.value) ? metric.value : metric.value.toFixed(2);
                    text = text + `${metricValue} ${metric.name} `;
                }
            });
        } else if (linkData[id].externalSummary) {
            if (linkData[id].externalSummary.throughput) text += ` ${linkData[id].externalSummary.throughput} rpm`;
            if (linkData[id].externalSummary.responseTimeAverage)
                text += ` ${linkData[id].externalSummary.responseTimeAverage} ms`;
        }
    }

    return text;
};

export const customAlertCalc = (valueOne, valueTwo, operator) => {
    switch (operator) {
        case "=":
            if (valueOne == valueTwo) return true;
            break;
        case "!=":
            if (valueOne != valueTwo) return true;
            break;
        case ">":
            if (valueOne > valueTwo) return true;
            break;
        case "<":
            if (valueOne < valueTwo) return true;
            break;
        case ">=":
            if (valueOne >= valueTwo) return true;
            break;
        case "<=":
            if (valueOne <= valueTwo) return true;
            break;
    }
    return false;
};

export const setCustomAlertDesign = (alert, alertData) => {
    if (alertData[0].value) {
        if (customAlertCalc(alertData[0].value, alert.alertCritical, alert.alertCriticalOperator)) {
            return { colorOne: "red", colorTwo: "red" };
        }
        if (customAlertCalc(alertData[0].value, alert.alertWarning, alert.alertWarningOperator)) {
            return { colorOne: "orange", colorTwo: "orange" };
        }
        if (customAlertCalc(alertData[0].value, alert.alertHealthy, alert.alertHealthyOperator)) {
            return { colorOne: "green", colorTwo: "green" };
        }
    }
    return { colorOne: "grey", colorTwo: "orange" };
};
