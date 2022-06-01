/* 
eslint no-use-before-define: 0,
no-console: 0,
*/ // --> OFF

import React, { useMemo, useContext } from 'react';
import ObservabilityMap from './observability-map';
import {
  AutoSizer,
  Stack,
  StackItem,
  Layout,
  LayoutItem,
  CollapsibleLayoutItem,
  EmptyState
} from 'nr1';
import LeftSidebar from './leftSidebar';
import DataContext from '../context/data';
import DataDrawer from './data-drawer';

function EntityMode() {
  const {
    dataDrawer,
    leftSidebarOpen,
    updateDataState,
    fetchingData
  } = useContext(DataContext);

  return useMemo(() => {
    return (
      <AutoSizer>
        {({ height, width }) => {
          const maxGraphHeight = dataDrawer ? height * 0.6 : height - 20;
          const maxGraphWidth = leftSidebarOpen ? width : width - 250;
          const maxDrawerHeight = height - maxGraphHeight;

          // console.log('rendering: entity mode', width, maxGraphHeight);

          return (
            <Layout fullHeight>
              <CollapsibleLayoutItem
                collapsed={leftSidebarOpen}
                onChangeCollapsed={() =>
                  updateDataState({ leftSidebarOpen: !leftSidebarOpen })
                }
                triggerType={CollapsibleLayoutItem.TRIGGER_TYPE.INBUILT}
                type={LayoutItem.TYPE.SPLIT_LEFT}
                sizeType={LayoutItem.SIZE_TYPE.SMALL}
              >
                <LeftSidebar />
              </CollapsibleLayoutItem>

              <LayoutItem
                style={{ backgroundColor: '#F3F4F4', height: '100%' }}
              >
                <Stack
                  fullHeight
                  fullWidth
                  directionType={Stack.DIRECTION_TYPE.VERTICAL}
                >
                  <StackItem
                    style={{
                      width: '100%',
                      marginTop: '0px'
                    }}
                  >
                    <div
                      style={{
                        maxHeight: `${maxGraphHeight}px`,
                        maxWidth: `${maxGraphWidth}px`,
                        overflow: 'hidden'
                      }}
                    >
                      {fetchingData ? (
                        <EmptyState
                          title="Hold tight—we’re fetching your data"
                          type={EmptyState.TYPE.LOADING}
                        />
                      ) : (
                        <ObservabilityMap
                          height={maxGraphHeight}
                          width={maxGraphWidth}
                        />
                      )}
                    </div>
                  </StackItem>
                  {dataDrawer && (
                    <DataDrawer
                      height={maxDrawerHeight}
                      width={maxGraphWidth}
                    />
                  )}
                </Stack>
              </LayoutItem>
            </Layout>
          );
        }}
      </AutoSizer>
    );
  }, [dataDrawer, leftSidebarOpen, fetchingData]);
}

export default EntityMode;
