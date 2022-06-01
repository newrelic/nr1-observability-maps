import { ngql } from 'nr1';

export const workloadEntityQuery = cursor => ngql`query workloadsEntityQuery ($workloadGuid: EntityGuid!){
  actor {
    entity(guid: $workloadGuid) {
      ... on WorkloadEntity {
        alertSeverity
        reporting
        guid
        name
        account {
          id
          name
        }
        relatedEntities(filter: {direction: OUTBOUND} ${
          cursor ? `, cursor: "${cursor}"` : ''
        }) {
          results {
            target {
              entity {
                name
                account {
                  id
                  name
                }
                domain
                entityType
                type
              }
              guid
            }
          }
          nextCursor
        }
      }
    }
  }
}`;

export const entityExpansionQuery = (cursor, entityType, type) => {
  let extraNrql = null;
  if (type === 'HOST') extraNrql = addHostNrql;

  return ngql`query entityExpansionQuery($guid: EntityGuid!) {
    actor {
      entity(guid: $guid) {
        alertSeverity
        reporting
        name
        guid
        domain
        type
        entityType
        ${extraNrql || ''}
        relatedEntities(filter: {direction: OUTBOUND} ${
          cursor ? `, cursor: "${cursor}"` : ''
        }) {
          results {
            target {
              entity {
                name
                guid
                ... on ApmExternalServiceEntityOutline {
                  externalSummary {
                    throughput
                    responseTimeAverage
                  }
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

export const addHostNrql = `ProcessSamples: nrdbQuery(nrql: "FROM ProcessSample SELECT count(*), latest(parentProcessId), latest(processId), latest(entityGuid) FACET entityName, processDisplayName WHERE contained = 'false' and processDisplayName NOT LIKE '%contain%' LIMIT MAX", timeout: 120) {
  results
}
StorageSamples: nrdbQuery(nrql: "FROM StorageSample SELECT latest(diskUsedPercent), latest(diskTotalBytes) as 'diskTotalBytes', latest(diskUsedBytes) as 'diskUsedBytes', latest(inodesTotal), latest(inodesUsed), latest(inodesFree) FACET entityName, mountPoint, device LIMIT MAX", timeout: 120) {
  results
}
AnsibleStorageSamples: nrdbQuery(nrql: "FROM AnsibleStorageSample SELECT latest(blockTotal), latest(blockSize), latest(blockUsed), latest(blockAvailable), latest(sizeAvailable) as 'diskUsedBytes', latest(sizeTotal) as 'diskTotalBytes', latest(inodeAvailable), latest(inodeTotal), latest(inodeUsed) FACET entity.name, mount, device LIMIT MAX", timeout: 120) {
  results
}
AnsibleNetstatSamples: nrdbQuery(nrql: "FROM AnsibleNetstatSample SELECT count(*), latest(pid) as 'pid', latest(protocol) as 'protocol', latest(state) as 'state', latest(user) as 'user' FACET entity.name, localAddress, localPort, remoteAddress, remotePort LIMIT MAX", timeout: 120) {
  results
}
AnsibleServiceSamples: nrdbQuery(nrql: "FROM AnsibleServiceSample SELECT latest(state) as 'state', latest(status) as 'status', latest(source) as 'source' FACET entity.name, name LIMIT MAX", timeout: 120) {
  results
}
AnsibleDiskIOSamples: nrdbQuery(nrql: "FROM AnsibleDiskIOSample SELECT latest(iopsReadPerSec) as 'iopsReadPerSec', latest(iopsWritePerSec) as 'iopsWritePerSec', latest(major) as 'major', latest(minor) as 'minor', latest(timeInterval) as 'timeInterval' FACET entity.name, device, namespace  LIMIT MAX", timeout: 120) {
  results
}
AnsibleVmSystemSamples: nrdbQuery(nrql: "FROM AnsibleVmSystemSample SELECT count(*) FACET entity.name, datacenter, cluster, esxiHostname, ipAddress LIMIT MAX", timeout: 120) {
  results
}`;
