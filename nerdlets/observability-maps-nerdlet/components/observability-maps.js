import React from 'react';
import { Grid } from 'semantic-ui-react';
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
import { Card, CardBody, HeadingText } from 'nr1';

export default class ObservabilityMaps extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarOpen: false
    };
  }

  render() {
    const { sidebarOpen } = this.state;
    const { isWidget, vizConfig } = this.props;
    const graphWidth = sidebarOpen
      ? (this.props.width / 4) * 3
      : this.props.width;
    const nodeSize = 700; // increasing this will not adjust the icon sizing, it will increase the svg area

    // the graph configuration, you only need to pass down properties
    // that you want to override, otherwise default ones will be used
    const d3MapConfig = {
      initialZoom: vizConfig?.initialZoom || null,
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
        {({
          mapConfig,
          userMaps,
          accountMaps,
          vizMapName,
          vizMapStorage,
          vizAccountId
        }) => {
          const errors = [];

          if (isWidget) {
            if (!vizMapStorage) {
              errors.push('Map storage not selected');
            }

            if (vizMapStorage === 'user') {
              if (
                !userMaps.find(
                  map =>
                    map.id.replaceAll('+', ' ') === vizMapName ||
                    map.id.replaceAll('-', ' ') === vizMapName
                )
              ) {
                errors.push(`User map: ${vizMapName} not found`);
              }
            } else if (vizMapStorage === 'account') {
              if (!vizAccountId) {
                errors.push('Account not selected');
              } else if (
                !accountMaps.find(
                  map =>
                    map.id.replaceAll('+', ' ') === vizMapName ||
                    map.id.replaceAll('-', ' ') === vizMapName
                )
              ) {
                errors.push(`Account map: ${vizMapName} not found`);
              }
            }
          }

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
              {errors.length > 0 &&
                EmptyState(
                  errors,
                  vizMapStorage === 'user' ? userMaps : accountMaps,
                  vizMapStorage
                )}
              <MenuBar isWidget={isWidget} />

              <Grid columns={16} style={mainGridStyle}>
                <Grid.Row style={{ paddingTop: '0px' }}>
                  <Grid.Column width={16}>
                    <Map d3MapConfig={d3MapConfig} graphWidth={graphWidth} />
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

const EmptyState = (errors, maps, mapStorage) => (
  <Card className="EmptyState">
    <CardBody className="EmptyState-cardBody">
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.SMALL]}
        type={HeadingText.TYPE.HEADING_3}
      >
        Create your Observability Map in the standard application before setting
        the custom visualization widget.
      </HeadingText>
      <br />
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.SMALL]}
        type={HeadingText.TYPE.HEADING_3}
      >
        Please amend any errors and supply the base configuration...
      </HeadingText>
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.SMALL]}
        type={HeadingText.TYPE.HEADING_4}
      >
        When this message clears your configuration is ready to be added
      </HeadingText>
      <div>
        {errors.map((error, i) => {
          return (
            <HeadingText
              key={i}
              spacingType={[HeadingText.SPACING_TYPE.MEDIUM]}
              type={HeadingText.TYPE.HEADING_4}
            >
              {error}
            </HeadingText>
          );
        })}
      </div>

      <br />
      {mapStorage && (
        <>
          <HeadingText
            spacingType={[HeadingText.SPACING_TYPE.LARGE]}
            type={HeadingText.TYPE.HEADING_3}
          >
            {`Available ${mapStorage} maps`}
          </HeadingText>
          <div>
            {(maps || []).map((map, i) => {
              return (
                <HeadingText
                  key={i}
                  spacingType={[HeadingText.SPACING_TYPE.MEDIUM]}
                  type={HeadingText.TYPE.HEADING_4}
                >
                  {map.id.replaceAll('+', ' ').replaceAll('-', ' ')}
                </HeadingText>
              );
            })}
          </div>
        </>
      )}
    </CardBody>
  </Card>
);
