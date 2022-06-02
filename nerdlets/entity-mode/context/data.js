/* eslint
no-console: 0,
no-async-promise-executor: 0,
no-func-assign: 0,
require-atomic-updates: 0,
no-unused-vars: 0
*/

import React, { Component } from 'react';
import { NerdGraphQuery } from 'nr1';
import { buildEntityMap } from '../lib/map';
import { entityExpansionQuery, workloadEntityQuery } from '../lib/queries';

const async = require('async');

const QUEUE_LIMIT = 5;
const DEFAULT_INTEGRATIONS = require('../../../integrations.json');

const DataContext = React.createContext();

const defaultNodeData = {
  'Select or create a map, to get started!': {
    id: 'Select or create a map, to get started!',
    y: 30,
    x: 300,
    icon: 'arrow up'
  },
  'Tip: Right click on map nodes and links for more options!': {
    id: 'Tip: Right click on map nodes and links for more options!',
    y: 100,
    x: 350,
    icon: 'help'
  }
};

export class DataProvider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fetchingData: false,
      leftSideBarOpen: true,
      dataDrawer: null,
      entityMapData: { nodes: [], links: [] },
      // below should be removed later
      mapConfig: {
        nodeData: { ...defaultNodeData },
        linkData: {}
      },
      mapData: {
        nodeData: {},
        linkData: {}
      },
      gravity: 350,
      linkLength: 150,
      selectedEntities: {},
      integrations: null
    };
  }

  componentDidMount() {
    this.setIntegrations();
    const { workloadGuids } = this.props;
    if (workloadGuids) {
      this.setState({ entityMode: true, workloadGuids }, () =>
        this.handleEntityMode()
      );
    }
  }

  componentDidCatch(err, errInfo) {
    this.setState({ hasError: true, err, errInfo });
  }

  handleEntityMode = () => {
    this.setState({ fetchingData: true }, async () => {
      // get all related entities under a workload
      const workloadData = await this.getWorkloadData();
      // // for every workloads entities, get their related entities and subsequent target entities
      const entityData = await this.getEntityData(workloadData);

      const entityMapData = buildEntityMap(entityData);

      this.setState({ entityMapData, fetchingData: false });
    });
    // console.log(workloadEntityData);
    // // const guidChunks = chunk(workloadGuids, ENTITY_SEARCH_CHUNK_MAX);
    // // const workloadGuidChunks = guidChunks.map(workloadGuidChunk => ({
    // //   workloadGuidChunk
    // // }));
  };

  setIntegrations() {
    return new Promise(resolve => {
      try {
        fetch(
          'https://raw.githubusercontent.com/newrelic-experimental/nr1-gaps/master/integrations.json'
        )
          .then(response => response.json())
          .then(integrations =>
            this.setState({ integrations }, () => resolve())
          )
          .catch(e => {
            console.log('failed to get latest integrations, using defaults');
            console.log(e);
            this.setState({ integrations: DEFAULT_INTEGRATIONS }, () =>
              resolve()
            );
          });
      } catch (e) {
        console.log('failed to get latest integrations, using defaults');
        console.log(e);
        this.setState({ integrations: DEFAULT_INTEGRATIONS }, () => resolve());
      }
    });
  }

  getEntityData = workloadData => {
    return new Promise(resolve => {
      const entitiesToQuery = [];
      Object.keys(workloadData).forEach(wl => {
        const relatedEntities =
          workloadData[wl]?.relatedEntities?.results || [];
        relatedEntities.forEach(relatedEntity => {
          const targetEntity = relatedEntity?.target?.entity;
          entitiesToQuery.push({
            triggerGuid: wl,
            entityGuid: targetEntity.guid,
            targetEntityData: targetEntity
          });
        });
      });

      // get all related entities under a workload
      const entityData = {};
      const entityQueue = async.queue((task, callback) => {
        const { entityGuid, nextCursor, triggerGuid, targetEntityData } = task;

        const { entityType, type } = targetEntityData;

        NerdGraphQuery.query({
          query: entityExpansionQuery(nextCursor, entityType, type),
          variables: { guid: entityGuid }
        }).then(response => {
          if (response.error?.graphQLErrors) {
            console.log(response.error?.graphQLErrors);
          } else {
            const entity = response?.data?.actor?.entity;

            if (entity) {
              entity.triggerGuid = triggerGuid;
              const relatedEntities = entity?.relatedEntities?.results || [];

              if (!entityData[entity.guid]) {
                entityData[entity.guid] = entity;
              } else {
                entityData[entity.guid].relatedEntities.results = [
                  ...entityData[entity.guid].relatedEntities.results,
                  ...(entity?.relatedEntities?.results || [])
                ];
              }

              // check if next cursor and fetch related entities
              if (relatedEntities?.nextCursor) {
                entityQueue.push({
                  entityGuid,
                  triggerGuid,
                  targetEntityData,
                  nextCursor: relatedEntities?.nextCursor
                });
              }

              const nextEntitiesToQuery = relatedEntities
                .map(r => ({
                  entityGuid: r.target.entity.guid,
                  targetEntityData: r?.target?.entity,
                  triggerGuid,
                  sourceGuid: entityGuid
                }))
                .filter(e => !entityData[e.entityGuid]);

              if (nextEntitiesToQuery.length > 0) {
                entityQueue.push(nextEntitiesToQuery);
              }
            } else {
              entityData[entityGuid] = targetEntityData;
            }
          }

          callback();
        });
      }, QUEUE_LIMIT);

      entityQueue.push(entitiesToQuery);

      entityQueue.drain(() => {
        resolve(entityData);
      });
    });
  };

  getWorkloadData = () => {
    const { workloadGuids } = this.state;

    return new Promise(resolve => {
      // do not chunk workload entity guids, work on them separately
      const workloadGuidMap = workloadGuids.map(guid => ({ guid }));

      // get all related entities under a workload
      const workloadData = {};
      const workloadQueue = async.queue((task, callback) => {
        const { guid, nextCursor } = task;

        NerdGraphQuery.query({
          query: workloadEntityQuery(nextCursor),
          variables: { workloadGuid: guid }
        }).then(response => {
          if (response.error?.graphQLErrors) {
            console.log(response.error?.graphQLErrors);
          } else {
            const entity = response?.data?.actor?.entity;

            if (entity) {
              const relatedEntities = entity?.relatedEntities;

              if (!workloadData[entity.guid]) {
                workloadData[entity.guid] = entity;
              } else {
                workloadData[entity.guid].relatedEntities.results = [
                  ...workloadData[entity.guid].relatedEntities.results,
                  ...(entity?.relatedEntities?.results || [])
                ];
              }

              // check if next cursor and fetch related entities
              if (relatedEntities?.nextCursor) {
                workloadQueue.push({
                  guid,
                  nextCursor: relatedEntities?.nextCursor
                });
              }
            }
          }

          callback();
        });
      }, QUEUE_LIMIT);

      workloadQueue.push(workloadGuidMap);

      workloadQueue.drain(() => {
        resolve(workloadData);
      });
    });
  };

  updateDataState = stateData =>
    new Promise(resolve => {
      if (stateData.gravity || stateData.linkLength) {
        const entityMapData = JSON.parse(
          JSON.stringify(this.state.entityMapData)
        );
        this.setState({ entityMapData: { nodes: [], links: [] } }, () => {
          stateData.entityMapData = entityMapData;
          this.setState(stateData, () => {
            resolve();
          });
        });
      } else {
        this.setState(stateData, () => {
          resolve();
        });
      }
    });

  render() {
    // console.log('rendering: data provider');
    const { children } = this.props;

    return (
      <DataContext.Provider
        value={{
          ...this.state,
          updateDataState: this.updateDataState
        }}
      >
        {children}
      </DataContext.Provider>
    );
  }
}

export default DataContext;
export const DataConsumer = DataContext.Consumer;
