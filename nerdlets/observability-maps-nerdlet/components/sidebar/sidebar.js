import React from 'react';
import { Rail, Segment, Icon, Menu } from 'semantic-ui-react';
import SidebarConnections from './connections';

export default class Sidebar extends React.PureComponent {
  render() {
    const {
      sidebarOpen,
      sidebarView,
      setParentState,
      mapData,
      mapConfig,
      selectedNode,
      height
    } = this.props;

    if (sidebarOpen) {
      return (
        <Rail
          attached
          internal
          position="right"
          style={{ width: '400px', marginTop: '60px', height: height }}
        >
          <Segment className="map-sidebar" style={{ height: '100%' }}>
            <span className="siderbar-header">{selectedNode}</span>
            <Icon
              name="close"
              onClick={() =>
                setParentState({ sidebarOpen: false, selectedNode: '' })
              }
              style={{
                float: 'right',
                cursor: 'pointer',
                paddingRight: '10px',
                paddingTop: '10px'
              }}
            />
            <br />
            <Menu pointing secondary>
              <Menu.Item
                name="connections"
                active={sidebarView === 'connections'}
                onClick={() => setParentState({ sidebarView: 'connections' })}
              />
            </Menu>
            <div>
              {sidebarView === 'connections' ? (
                <SidebarConnections
                  mapData={mapData}
                  mapConfig={mapConfig}
                  selectedNode={selectedNode}
                  setParentState={setParentState}
                />
              ) : (
                ''
              )}
            </div>
          </Segment>
        </Rail>
      );
    }

    return '';
  }
}
