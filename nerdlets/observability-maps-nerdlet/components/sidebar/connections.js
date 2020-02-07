import React from 'react';
import { Icon, List, Checkbox, Header, Menu } from 'semantic-ui-react';
import { setAlertDesign, setEntityDesign, cleanNodeId } from '../../lib/helper';
import { DataConsumer } from '../../context/data';

const domains = [
  'APM',
  'INFRA',
  'BROWSER',
  'MOBILE',
  'SYNTH',
  'OTHER',
  'EXTERNAL'
];

const updateLink = (
  checked,
  direction,
  node,
  entity,
  mapConfig,
  updateDataContextState
) => {
  // node is the selected node from the right click
  // the entity, is the entity to be removed

  const name = entity.domain
    ? `${entity.name} [${entity.domain}]`
    : entity.name;

  const linkId =
    direction === 'outgoing' ? `${node}:::${name}` : `${name}:::${node}`;

  if (checked) {
    Object.keys(mapConfig.linkData).forEach(link => {
      if (link.includes(`${entity.name}`)) {
        delete mapConfig.linkData[link];
      }
    });
    delete mapConfig.nodeData[name];
    delete mapConfig.nodeData[entity.name]; // fallback
  } else {
    mapConfig.linkData[linkId] = {
      source: direction === 'outgoing' ? node : name,
      target: direction === 'outgoing' ? name : node
    };
    mapConfig.nodeData[name] = {
      name: entity.name,
      guid: entity.guid,
      entityType: entity.entityType
    };
  }
  updateDataContextState({ mapConfig }, ['saveMap']);
};

export default class SidebarConnections extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      incomingActiveMenuItem: '',
      outgoingActiveMenuItem: ''
    };
  }

  render() {
    let { incomingActiveMenuItem, outgoingActiveMenuItem } = this.state;

    return (
      <DataConsumer>
        {({ updateDataContextState, selectedNode, mapConfig, mapData }) => {
          const renderConnectionsBlock = (title, data) => {
            const activeMenuItem =
              title === 'Incoming'
                ? incomingActiveMenuItem
                : outgoingActiveMenuItem;
            const direction = title === 'Incoming' ? 'source' : 'target';

            return (
              <>
                <Header as="h5" style={{ paddingLeft: '10px' }}>
                  {title}
                </Header>
                {Object.keys(data).length > 0 ? (
                  <Menu pointing secondary style={{ fontSize: '12px' }}>
                    {Object.keys(data).map((domain, i) => {
                      if (data[domain].length > 0) {
                        return (
                          <Menu.Item
                            key={i}
                            name={domain}
                            active={activeMenuItem === domain}
                            onClick={() =>
                              this.setState({
                                [title === 'Incoming'
                                  ? 'incomingActiveMenuItem'
                                  : 'outgoingActiveMenuItem']: domain
                              })
                            }
                          ></Menu.Item>
                        );
                      } else {
                        return '';
                      }
                    })}
                  </Menu>
                ) : (
                  <span style={{ paddingLeft: '10px' }}>No connections</span>
                )}

                {activeMenuItem !== '' ? (
                  <List
                    style={{
                      overflowY: 'scroll',
                      maxHeight: '250px',
                      paddingLeft: '10px'
                    }}
                  >
                    {data[activeMenuItem].map((conn, i) => {
                      const name = conn[direction].entity.domain
                        ? `${conn[direction].entity.name} [${conn[direction].entity.domain}]`
                        : conn[direction].entity.name;

                      const link =
                        title === 'Incoming'
                          ? `${name}:::${selectedNode}`
                          : `${selectedNode}:::${name}`;

                      // fallback
                      const link2 =
                        title === 'Incoming'
                          ? `${conn[direction].entity.name}:::${selectedNode}`
                          : `${selectedNode}:::${conn[direction].entity.name}`;

                      const checked =
                        mapConfig.linkData[link] != null ||
                        mapConfig.linkData[link2] != null;

                      return (
                        <List.Item key={i}>
                          <Icon
                            style={{ float: 'left' }}
                            color={
                              setAlertDesign(
                                conn[direction].entity.alertSeverity,
                                conn[direction].entity.entityType
                              ).colorOne
                            }
                            name={
                              setEntityDesign(conn[direction].entity.entityType)
                                .icon
                            }
                          />{' '}
                          &nbsp;&nbsp;
                          <Checkbox
                            className="truncate-sidebar"
                            checked={checked}
                            onClick={() =>
                              updateLink(
                                checked,
                                title.toLowerCase(),
                                selectedNode,
                                conn[direction].entity,
                                mapConfig,
                                updateDataContextState
                              )
                            }
                            label={conn[direction].entity.name}
                          />
                        </List.Item>
                      );
                    })}
                  </List>
                ) : (
                  ''
                )}
              </>
            );
          };

          // need to filter source and targets correctly
          if (mapData && mapData.nodeData[selectedNode]) {
            const relationships =
              mapData.nodeData[selectedNode].relationships || [];
            if (relationships.length === 0) return 'No connections found';

            const incoming = [];
            const outgoing = [];
            const incomingData = {};
            const outgoingData = {};

            relationships.forEach(conn => {
              const targetName =
                (((conn || {}).target || {}).entity || {}).name || '';
              const sourceName =
                (((conn || {}).source || {}).entity || {}).name || '';

              if (
                targetName === cleanNodeId(selectedNode) &&
                sourceName !== cleanNodeId(selectedNode)
              )
                incoming.push(conn);
              if (
                sourceName === cleanNodeId(selectedNode) &&
                targetName !== cleanNodeId(selectedNode)
              )
                outgoing.push(conn);
            });

            const handleDomain = (conn, dir) => {
              const domain =
                (((conn || {})[dir] || {}).entity || {}).domain || 'OTHER';
              const entityType =
                (((conn || {})[dir] || {}).entity || {}).entityType || '';
              if (entityType.includes('EXTERNAL_SERVICE_ENTITY')) {
                return 'EXTERNAL';
              }
              return domain;
            };

            domains.forEach(domain => {
              incomingData[domain] = incoming.filter(
                conn => handleDomain(conn, 'source') === domain
              );
              outgoingData[domain] = outgoing.filter(
                conn => handleDomain(conn, 'target') === domain
              );

              // set defaults menu items if not set
              if (Object.keys(incomingData[domain]).length === 0) {
                delete incomingData[domain];
              } else if (
                incomingActiveMenuItem === '' &&
                incomingData[domain].length > 0
              )
                incomingActiveMenuItem = domain;
              if (Object.keys(outgoingData[domain]).length === 0) {
                delete outgoingData[domain];
              } else if (
                outgoingActiveMenuItem === '' &&
                outgoingData[domain].length > 0
              )
                outgoingActiveMenuItem = domain;
            });

            return (
              <>
                {renderConnectionsBlock('Incoming', incomingData)}
                {renderConnectionsBlock('Outgoing', outgoingData)}
              </>
            );
          }

          return 'No connections found';
        }}
      </DataConsumer>
    );
  }
}
