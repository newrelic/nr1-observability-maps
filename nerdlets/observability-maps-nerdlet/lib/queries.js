import { ngql } from 'nr1';

export const workloadEntityQuery = cursor => ngql`query workloadsEntityQuery ($workloadGuid: EntityGuid!){
  actor {
    entity(guid: $workloadGuid) {
      ... on WorkloadEntity {
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

export const entityExpansionQuery = cursor => ngql`query entityExpansionQuery($guids: [EntityGuid]!) {
  actor {
    entities(guids: $guids) {
      name
      guid
      domain
      type
      entityType
      relatedEntities(filter: {direction: OUTBOUND} ${
        cursor ? `, cursor: "${cursor}"` : ''
      }) {
        results {
          target {
            entity {
              name
              guid
            }
          }
        }
      }
    }
  }
}`;
