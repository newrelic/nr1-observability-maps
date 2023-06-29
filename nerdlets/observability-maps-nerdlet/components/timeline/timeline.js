import React from 'react';
import { Rail, Segment, Icon, Menu, Popup } from 'semantic-ui-react';
import { Timeline, TimelineEvent } from 'react-event-timeline';
import { navigation } from 'nr1';
import { DataConsumer } from '../../context/data';

export default class TimelineView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { activeItem: 'all' };
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  renderDeploymentDetails(event) {
    const msg = (title, txt) => (
      <>
        {`${title} ${txt}`}
        <br />
      </>
    );
    return (
      <div style={{ paddingBottom: '5px' }}>
        {event.description ? msg('Description:', event.description) : ''}
        {event.changelog ? msg('Change Log:', event.changelog) : ''}
        {event.user ? msg('User:', event.user) : ''}
      </div>
    );
  }

  renderTimeline(events, height) {
    return (
      <div style={{ overflowY: 'scroll', maxHeight: height - 60 }}>
        <Timeline>
          {events.map((event, i) => {
            const eventType = event.violationId ? 'alert' : 'deployment';
            let title = '';
            const date = new Date(event.timestamp);
            let createdAt = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            let icon = '';
            const bubbleStyle = {};

            if (eventType === 'deployment') {
              title = `${event.description}: ${event.commit}`;
              icon = <Icon style={{ paddingLeft: '2px' }} name="code" />;
            } else if (eventType === 'alert') {
              title = `${event.name}: ${event.label}`;
              icon = <Icon style={{ paddingLeft: '5px' }} name="warning" />;
              if (event.closedAt) {
                const dateClosed = new Date(event.closedAt);
                createdAt = `${createdAt} - ${dateClosed.toLocaleDateString()} ${dateClosed.toLocaleTimeString()}`;
              } else {
                createdAt = `${createdAt} - OPEN`;
                bubbleStyle.backgroundColor = '#FA6E37';
                bubbleStyle.borderColor = '#C6562C';
              }
            }

            return (
              <TimelineEvent
                bubbleStyle={bubbleStyle}
                key={i}
                title={title}
                createdAt={createdAt}
                icon={icon}
              >
                {eventType === 'deployment'
                  ? this.renderDeploymentDetails(event)
                  : ''}
                <a onClick={() => navigation.openStackedEntity(event.guid)}>
                  <Icon name="external" />
                  View Entity
                </a>
                &nbsp;&nbsp;
                {eventType === 'alert' ? (
                  <a onClick={() => window.open(event.violationUrl, '_blank')}>
                    <Icon name="external" />
                    View Violation
                  </a>
                ) : (
                  ''
                )}
                &nbsp;&nbsp;
                {eventType === 'deployment' ? (
                  <a onClick={() => window.open(event.permalink, '_blank')}>
                    <Icon name="external" />
                    View Deployment
                  </a>
                ) : (
                  ''
                )}
              </TimelineEvent>
            );
          })}
        </Timeline>
      </div>
    );
  }

  render() {
    const { height } = this.props;
    const { activeItem } = this.state;

    return (
      <DataConsumer>
        {({ timelineOpen, data }) => {
          // construct data
          const recentAlerts = [];
          const recentDeployments = [];
          if (data && data.nodes && data.nodes.length > 0) {
            for (let i = 0; i < data.nodes.length; i++) {
              if (
                data.nodes[i].recentAlertViolations &&
                data.nodes[i].recentAlertViolations.length > 0
              ) {
                for (
                  let z = 0;
                  z < data.nodes[i].recentAlertViolations.length;
                  z++
                ) {
                  data.nodes[i].recentAlertViolations[z].name =
                    data.nodes[i].name;
                  data.nodes[i].recentAlertViolations[z].guid =
                    data.nodes[i].guid;
                  data.nodes[i].recentAlertViolations[z].timestamp =
                    data.nodes[i].recentAlertViolations[z].openedAt;

                  recentAlerts.push(data.nodes[i].recentAlertViolations[z]);
                }
              }
              if ((data.nodes[i]?.deploymentSearch?.results || []).length > 0) {
                for (
                  let z = 0;
                  z < data.nodes[i].deploymentSearch?.results.length;
                  z++
                ) {
                  data.nodes[i].deploymentSearch.results[z].name =
                    data.nodes[i].name;
                  data.nodes[i].deploymentSearch.results[z].guid =
                    data.nodes[i].guid;
                  recentDeployments.push(
                    data.nodes[i].deploymentSearch?.results[z]
                  );
                }
              }
            }
          }
          recentAlerts.sort((a, b) => b.timestamp - a.timestamp);
          recentDeployments.sort((a, b) => b.timestamp - a.timestamp);
          const allEvents = [...recentAlerts, ...recentDeployments].sort(
            (a, b) => b.timestamp - a.timestamp
          );

          if (timelineOpen) {
            return (
              <Rail
                attached
                internal
                position="right"
                style={{ width: '33%', marginTop: '60px', height: height }}
              >
                <Segment className="map-sidebar" style={{ height: '100%' }}>
                  <Menu pointing secondary>
                    <Menu.Item
                      name="all"
                      active={activeItem === 'all'}
                      onClick={this.handleItemClick}
                    />
                    <Menu.Item
                      name="alerts"
                      active={activeItem === 'alerts'}
                      onClick={this.handleItemClick}
                    />
                    <Popup
                      content="Deployments last day"
                      trigger={
                        <Menu.Item
                          name="deployments"
                          active={activeItem === 'deployments'}
                          onClick={this.handleItemClick}
                        />
                      }
                    />
                  </Menu>
                  {activeItem === 'all'
                    ? this.renderTimeline(allEvents, height)
                    : ''}
                  {activeItem === 'alerts'
                    ? this.renderTimeline(recentAlerts, height)
                    : ''}
                  {activeItem === 'deployments'
                    ? this.renderTimeline(recentDeployments, height)
                    : ''}
                </Segment>
              </Rail>
            );
          }

          return '';
        }}
      </DataConsumer>
    );
  }
}
