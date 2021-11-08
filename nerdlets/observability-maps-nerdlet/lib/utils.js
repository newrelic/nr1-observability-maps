/* eslint no-use-before-define: 0 */ // --> OFF
import {
  NerdGraphQuery,
  UserStorageQuery,
  UserStorageMutation,
  AccountStorageQuery,
  AccountStorageMutation,
  ngql
} from 'nr1';

export const nerdGraphQuery = async query => {
  const nerdGraphData = await NerdGraphQuery.query({
    query: ngql`
      ${query}
    `
  });
  return nerdGraphData.data;
};

export const getUserCollection = async (collection, documentId) => {
  const payload = { collection };
  if (documentId) payload.documentId = documentId;
  const result = await UserStorageQuery.query(payload);
  const collectionResult = (result || {}).data || [];
  return collectionResult;
};

export const getAccountCollection = async (
  accountId,
  collection,
  documentId
) => {
  const payload = { accountId, collection };
  if (documentId) payload.documentId = documentId;
  const result = await AccountStorageQuery.query(payload);
  const collectionResult = (result || {}).data || [];
  return collectionResult;
};

export const writeUserDocument = async (collection, documentId, payload) => {
  const result = await UserStorageMutation.mutate({
    actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
    collection,
    documentId: documentId.replaceAll(' ', '-'),
    document: payload
  });
  return result;
};

export const writeAccountDocument = async (
  accountId,
  collection,
  documentId,
  payload
) => {
  const result = await AccountStorageMutation.mutate({
    accountId,
    actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
    collection,
    documentId: documentId.replaceAll(' ', '-'),
    document: payload
  });
  return result;
};

export const deleteUserDocument = async (collection, documentId) => {
  const result = await UserStorageMutation.mutate({
    actionType: UserStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
    collection,
    documentId
  });
  return result;
};

export const deleteAccountDocument = async (
  accountId,
  collection,
  documentId
) => {
  const result = await AccountStorageMutation.mutate({
    accountId,
    actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
    collection,
    documentId
  });
  return result;
};

// may remove in favor of direct nrql query component
export const nrdbQuery = async (accountId, query, timeout) => {
  const q = gqlNrqlQuery(accountId, query, timeout);
  const result = await NerdGraphQuery.query({ query: q });
  const nrqlResult =
    (((((result || {}).data || {}).actor || {}).account || {}).nrql || {})
      .results || [];
  return nrqlResult;
};

// no need to run directly, nrdbQuery just passes it through
export const gqlNrqlQuery = (accountId, query, timeout) => ngql`{
      actor {
        account(id: ${accountId}) {
          nrql(query: "${query}", timeout: ${timeout || 30000}) {
            results
          }
        }
      }
    }`;

// search for entities by domain & account
export const entitySearchByAccountQuery = (domain, accountId, cursor) => {
  let subType;
  if (domain.startsWith('EXT-')) {
    const domainSplit = domain.split('-');
    domain = domainSplit[0];
    subType = domainSplit[1];
  }

  return ngql`{
  actor {
    entitySearch(query: "domain IN ('${domain}') ${
    subType ? `AND type = '${subType}'` : ``
  } AND reporting = 'true' ${
    accountId ? `AND tags.accountId IN ('${accountId}')` : ''
  }") {
      query
      results${cursor ? `(cursor: "${cursor}")` : ''} {
        nextCursor
        entities {
          name
          guid
          entityType
          domain
        }
      }
    }
  }
}`;
};

export const singleNrql = (alias, query, accountId) => `
      ${alias}: account(id: ${accountId}) {
        nrql(query: "${query}") {
          results
        }
      }`;

export const entityBatchQuery = guids => {
  return `{
    actor {
      entities(guids: [${guids}]) {
        ... on SyntheticMonitorEntity {
          guid
          name
          monitorSummary {
            locationsRunning
            successRate
            locationsFailing
          }
          alertSeverity
          domain
          entityType
          account {
            name
            id
          }
          monitorType
          monitoredUrl
          recentAlertViolations(count: 5) {
            agentUrl
            alertSeverity
            closedAt
            label
            level
            openedAt
            violationId
            violationUrl
          }
        }
        ... on MobileApplicationEntity {
          name
          guid
          alertSeverity
          applicationId
          domain
          entityType
          account {
            name
            id
          }
          mobileSummary {
            appLaunchCount
            crashCount
            crashRate
            httpErrorRate
            httpRequestCount
            httpRequestRate
            httpResponseTimeAverage
            mobileSessionCount
            networkFailureRate
            usersAffectedCount
          }
          recentAlertViolations(count: 5) {
            agentUrl
            alertSeverity
            label
            closedAt
            level
            openedAt
            violationId
            violationUrl
          }
          relationships {
            source {
              entity {
                account {
                  id
                  name
                }
                domain
                entityType
                guid
                name
                ... on AlertableEntityOutline {
                  alertSeverity
                }
                ... on ApmExternalServiceEntityOutline {
                  entityType
                  guid
                  externalSummary {
                    responseTimeAverage
                    throughput
                  }
                  name
                }
              }
            }
            target {
              entity {
                account {
                  id
                  name
                }
                domain
                entityType
                guid
                name
                ... on AlertableEntityOutline {
                  alertSeverity
                }
                ... on ApmExternalServiceEntityOutline {
                  entityType
                  guid
                  externalSummary {
                    responseTimeAverage
                    throughput
                  }
                  name
                }
              }
            }
          }
        }
        ... on ApmExternalServiceEntity {
          name
          guid
          domain
          entityType
          account {
            name
            id
          }
          relationships {
            source {
              entity {
                account {
                  id
                  name
                }
                domain
                entityType
                guid
                name
                ... on AlertableEntityOutline {
                  alertSeverity
                }
              }
            }
            target {
              entity {
                account {
                  id
                  name
                }
                domain
                entityType
                guid
                name
                ... on AlertableEntityOutline {
                  alertSeverity
                }
                ... on ApmExternalServiceEntityOutline {
                  entityType
                  guid
                  externalSummary {
                    responseTimeAverage
                    throughput
                  }
                  name
                }
              }
            }
          }
          externalSummary {
            responseTimeAverage
            throughput
          }
        }
        ... on BrowserApplicationEntity {
          guid
          name
          account {
            id
            name
          }
          domain
          browserSummary {
            ajaxRequestThroughput
            ajaxResponseTimeAverage
            jsErrorRate
            pageLoadThroughput
            pageLoadTimeAverage
            pageLoadTimeMedian
            spaResponseTimeAverage
            spaResponseTimeMedian
          }
          relationships {
            source {
              entity {
                account {
                  id
                  name
                }
                domain
                guid
                entityType
                name
              }
            }
            target {
              entity {
                account {
                  id
                  name
                }
                domain
                guid
                entityType
                name
              }
            }
          }
          servingApmApplicationId
          recentAlertViolations(count: 5) {
            agentUrl
            alertSeverity
            closedAt
            label
            level
            openedAt
            violationId
            violationUrl
          }
          alertSeverity
          entityType
        }
      }
    }
  }`;
};

export const ApmEntityBatchQuery = guids => {
  return `{
  actor {
    entities(guids: [${guids}]) {
      ... on ApmApplicationEntity {
        name
        language
        guid
        alertSeverity
        applicationId
        domain
        entityType
        settings {
          apdexTarget
        }
        deployments {
          changelog
          description
          permalink
          revision
          timestamp
          user
        }
        apmSummary {
          apdexScore
          errorRate
          hostCount
          instanceCount
          nonWebResponseTimeAverage
          nonWebThroughput
          responseTimeAverage
          throughput
          webResponseTimeAverage
          webThroughput
        }
        account {
          name
          id
        }
        recentAlertViolations(count: 5) {
          agentUrl
          alertSeverity
          label
          closedAt
          level
          openedAt
          violationId
          violationUrl
        }
        relationships {
          source {
            entity {
              account {
                id
                name
              }
              domain
              entityType
              guid
              name
              ... on AlertableEntityOutline {
                alertSeverity
              }
              ... on ApmExternalServiceEntityOutline {
                entityType
                guid
                externalSummary {
                  responseTimeAverage
                  throughput
                }
                name
              }
              ... on ApmDatabaseInstanceEntityOutline {
                guid
                entityType
                name
                host
                vendor
                portOrPath
              }
            }
          }
          target {
            entity {
              account {
                id
                name
              }
              domain
              entityType
              guid
              name
              ... on AlertableEntityOutline {
                alertSeverity
              }
              ... on ApmExternalServiceEntityOutline {
                entityType
                guid
                externalSummary {
                  responseTimeAverage
                  throughput
                }
                name
              }
              ... on ApmDatabaseInstanceEntityOutline {
                guid
                entityType
                name
                host
                vendor
                portOrPath
              }
            }
          }
        }
      }
    }
  }
}`;
};

export const InfraEntityBatchQuery = guids => {
  return `{
    actor {
      entities(guids: [${guids}]) {
        ... on InfrastructureHostEntity {
          account {
            id
            name
          }
          domain
          alertSeverity
          recentAlertViolations(count: 5) {
            agentUrl
            alertSeverity
            closedAt
            label
            level
            openedAt
            violationId
            violationUrl
          }
          relationships {
            source {
              entity {
                account {
                  id
                  name
                }
                domain
                guid
                entityType
                name
              }
            }
            target {
              entity {
                account {
                  id
                  name
                }
                domain
                guid
                entityType
                name
              }
            }
          }
          entityType
          guid
          hostSummary {
            cpuUtilizationPercent
            diskUsedPercent
            memoryUsedPercent
            networkReceiveRate
            servicesCount
            networkTransmitRate
            networkReceiveRate
          }
          name
        }
      }
    }
  }`;
};

export const DashboardQuery = accountId => `{
  actor {
    entitySearch(query: "accountId=${accountId} and type='DASHBOARD'") {
      results {
        entities {
          accountId
          guid
          name
          type
        }
      }
    }
  }
}`;
