import React, { useState, useContext } from 'react';
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
import DataContext from '../context/data';

import {
  AutoSizer,
  Stack,
  StackItem,
  Card,
  CardBody,
  HeadingText,
  Layout,
  LayoutItem,
  CollapsibleLayoutItem
} from 'nr1';
import DataDrawer from './data-drawer';

const MENU_HEIGHT = 60;

function ObservabilityMaps(props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    drawerOpen,
    mapConfig,
    userMaps,
    accountMaps,
    vizMapName,
    vizMapStorage,
    vizAccountId,
    entityMode
  } = useContext(DataContext);

  console.log(props);

  const { isWidget, vizConfig, height } = props;
  console.log(height);
  // const graphWidth = sidebarOpen ? (props.width / 4) * 3 : props.width;
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
      // fontColor: 'white',
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
    height,
    width: '100%'
  };

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
    // height: props.height - 46,
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
    <AutoSizer>
      {({ height }) => {
        const mainHeight = height - (!entityMode ? 0 : MENU_HEIGHT);
        const drawerHeight = drawerOpen ? mainHeight * 0.4 : 0;
        const graphHeight = mainHeight - drawerHeight;

        return (
          <div>
            <Layout fullHeight>
              <CollapsibleLayoutItem
                triggerType={CollapsibleLayoutItem.TRIGGER_TYPE.INBUILT}
                type={LayoutItem.TYPE.SPLIT_LEFT}
                sizeType={LayoutItem.SIZE_TYPE.SMALL}
              >
                <div className="nr1-Box">Navigation</div>
              </CollapsibleLayoutItem>

              <LayoutItem
                style={{ backgroundColor: '#F3F4F4', height: '100%' }}
              >
                <Stack
                  fullHeight
                  fullWidth
                  directionType={Stack.DIRECTION_TYPE.VERTICAL}
                >
                  {errors.length > 0 &&
                    EmptyState(
                      errors,
                      vizMapStorage === 'user' ? userMaps : accountMaps,
                      vizMapStorage
                    )}
                  {/* dmake sure this is flagged to disabled later */}
                  {entityMode && (
                    <StackItem grow style={{ width: '100%', marginTop: '0px' }}>
                      <MenuBar isWidget={isWidget} />
                    </StackItem>
                  )}

                  <StackItem
                    grow
                    style={{
                      width: '100%',
                      minHeight: `${graphHeight}px`,
                      marginTop: '0px'
                    }}
                  >
                    <Map d3MapConfig={d3MapConfig} graphWidth={null} />
                  </StackItem>

                  {drawerOpen && (
                    <StackItem
                      grow
                      style={{
                        width: '100%',
                        backgroundColor: 'white',
                        minHeight: `${drawerHeight}px`,
                        marginTop: '0px'
                      }}
                    >
                      <DataDrawer />
                    </StackItem>
                  )}
                </Stack>
              </LayoutItem>

              {/* <CollapsibleLayoutItem
              triggerType={CollapsibleLayoutItem.TRIGGER_TYPE.INBUILT}
              type={LayoutItem.TYPE.SPLIT_RIGHT}
            >
              <div className="nr1-Box">Activity stream</div>
            </CollapsibleLayoutItem> */}
            </Layout>
          </div>
        );
      }}
    </AutoSizer>
    // <div style={{ overflowY: 'hidden', overflowX: 'hidden' }}>
    //   {errors.length > 0 &&
    //     EmptyState(
    //       errors,
    //       vizMapStorage === 'user' ? userMaps : accountMaps,
    //       vizMapStorage
    //     )}
    //   <MenuBar isWidget={isWidget} />

    //   <Grid columns={16} style={mainGridStyle}>
    //     <Grid.Row style={{ paddingTop: '0px' }}>
    //       <Grid.Column width={16}>
    //         <Map d3MapConfig={d3MapConfig} graphWidth={graphWidth} />
    //       </Grid.Column>
    //     </Grid.Row>

    //     <Sidebar height={props.height - 60} />
    //     <Timeline height={props.height - 60} />
    //   </Grid>

    //   <EditNode />
    //   <EditLink />
    // </div>
  );
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

export default ObservabilityMaps;
