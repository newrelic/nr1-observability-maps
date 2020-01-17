/* eslint-disable */
import {
    NerdGraphQuery,
    UserStorageQuery,
    UserStorageMutation,
    AccountStorageQuery,
    AccountStorageMutation
} from "nr1";
import gql from "graphql-tag";

export const nerdGraphQuery = async query => {
    const nerdGraphData = await NerdGraphQuery.query({
        query: gql`
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

export const getAccountCollection = async (collection, documentId) => {
    const payload = { collection };
    if (documentId) payload.documentId = documentId;
    const result = await AccountStorageQuery.query(payload);
    const collectionResult = (result || {}).data || [];
    return collectionResult;
};

export const writeUserDocument = async (collection, documentId, payload) => {
    const result = await UserStorageMutation.mutate({
        actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
        collection,
        documentId,
        document: payload
    });
    return result;
};

export const writeAccountDocument = async (collection, documentId, payload) => {
    const result = await AccountStorageMutation.mutate({
        actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
        collection,
        documentId,
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

export const deleteAccountDocument = async (collection, documentId) => {
    const result = await AccountStorageMutation.mutate({
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
    const nrqlResult = (((((result || {}).data || {}).actor || {}).account || {}).nrql || {}).results || [];
    return nrqlResult;
};

// no need to run directly, nrdbQuery just passes it through
export const gqlNrqlQuery = (accountId, query, timeout) => gql`{
      actor {
        account(id: ${accountId}) {
          nrql(query: "${query}", timeout: ${timeout || 30000}) {
            results
          }
        }
      }
    }`;

// search for entities by domain & account
export const entitySearchByAccountQuery = (domain, accountId, cursor) => gql`{
  actor {
    entitySearch(query: "domain IN ('${domain}') AND reporting = 'true' AND tags.accountId IN ('${accountId}')") {
      query
      results${cursor ? `(cursor: "${cursor}")` : ""} {
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
          }
          name
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
    }
  }
}`;
};
