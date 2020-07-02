import React from 'react';
import { Grid } from 'semantic-ui-react';
import MenuBar from './navigation/menu-bar';
import Map from './map/map';
import Info from './info/info';
import NodeHandler from './custom-nodes/handler';
import LinkHandler from './custom-links/handler';
import Sidebar from './sidebar/sidebar';
import EditNode from './node/edit/edit-node';
import EditLink from './link/edit/edit-link';
import { cleanNodeId } from '../lib/helper';
import Timeline from './timeline/timeline';
import { DataConsumer } from '../context/data';

export default class ObservabilityMaps extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarOpen: false
    };
  }

  render() {
    const { sidebarOpen } = this.state;
    const graphWidth = sidebarOpen
      ? (this.props.width / 4) * 3
      : this.props.width;
    const nodeSize = 700; // increasing this will not adjust the icon sizing, it will increase the svg area

    // the graph configuration, you only need to pass down properties
    // that you want to override, otherwise default ones will be used
    const d3MapConfig = {
      staticGraph: false,
      staticGraphWithDragAndDrop: true,
      d3: {
        linkLength: 200
      },
      nodeHighlightBehavior: false, // if this is set to true reset positions doesn't work
      node: {
        color: 'lightgreen',
        size: nodeSize,
        highlightStrokeColor: 'blue',
        fontSize: 16,
        highlightFontSize: 16,
        labelProperty: node => cleanNodeId(node.id),
        fontColor: 'white',
        viewGenerator: node => <NodeHandler node={node} nodeSize={nodeSize} />
      },
      link: {
        highlightColor: 'lightblue',
        type: 'CURVE_SMOOTH',
        renderLabel: true,
        labelProperty: link => <LinkHandler link={link} />,
        fontColor: 'white',
        fontSize: 13,
        fontWeight: 'bold'
      },
      directed: true,
      height: this.props.height - 80,
      width: graphWidth
    };

    return (
      <DataConsumer>
        {({ mapConfig }) => {
          const mainGridStyle = {
            height: this.props.height - 46,
            backgroundColor: 'black',
            marginTop: '0px'
          };

          // dynamically add map settings
          if (mapConfig.settings) {
            Object.keys(mapConfig.settings).forEach(key => {
              if (key.startsWith('background')) {
                mainGridStyle[key] = mapConfig.settings[key];
              }
            });
          }

          return (
            <div style={{ overflowY: 'hidden', overflowX: 'hidden' }}>
              <MenuBar />

              <Grid columns={16} style={mainGridStyle}>
                <Grid.Row style={{ paddingTop: '0px' }}>
                  <Grid.Column width={16}>
                    <Info />
                    <Map
                      d3MapConfig={d3MapConfig}
                      graphWidth={graphWidth}
                      height={this.props.height}
                    />
                  </Grid.Column>
                </Grid.Row>

                <Sidebar height={this.props.height - 60} />
                <Timeline height={this.props.height - 60} />
              </Grid>

              <EditNode />
              <EditLink />
            </div>
          );
        }}
      </DataConsumer>
    );
  }
}
