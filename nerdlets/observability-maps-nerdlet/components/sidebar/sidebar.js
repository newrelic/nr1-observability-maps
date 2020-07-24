import React from 'react';
import { Rail, Segment, Icon, Menu } from 'semantic-ui-react';
import SidebarConnections from './connections';
import { DataConsumer } from '../../context/data';

export default class Sidebar extends React.PureComponent {
  render() {
    const { height } = this.props;

    return (
      <DataConsumer>
        {({ updateDataContextState, selectedNode, sidebarView, sidebarOpen }) =>
          sidebarOpen ? (
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
                    updateDataContextState({
                      sidebarOpen: false,
                      selectedNode: ''
                    })
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
                    onClick={() =>
                      updateDataContextState({ sidebarView: 'connections' })
                    }
                  />
                </Menu>
                <div>
                  {sidebarView === 'connections' ? <SidebarConnections /> : ''}
                </div>
              </Segment>
            </Rail>
          ) : (
            ''
          )
        }
      </DataConsumer>
    );
  }
}
