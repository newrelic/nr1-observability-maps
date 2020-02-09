/* eslint 
no-console: 0,
no-async-promise-executor: 0,
no-func-assign: 0,
require-atomic-updates: 0,
no-unused-vars: 0
*/

import React from 'react';
import { Grid, Popup, Button } from 'semantic-ui-react';
import MenuBar from './navigation/menu-bar';
import Map from './map/map';
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
        // renderLabel: false,
        fontColor: 'white',
        // viewGenerator: node => <Popup basic pinned on={"click"} content={node} trigger={<Button color="green" icon='add' />} />
        viewGenerator: node => <NodeHandler node={node} nodeSize={nodeSize} />
      },
      link: {
        highlightColor: 'lightblue',
        type: 'CURVE_SMOOTH',
        renderLabel: true,
        labelProperty: link => <LinkHandler link={link} />,
        fontColor: '#21ba45',
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
            height: this.props.height - 60,
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
            <div>
              <MenuBar />

              <Grid columns={16} style={mainGridStyle}>
                <Grid.Row style={{ paddingTop: '0px' }}>
                  <Grid.Column width={16}>
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
