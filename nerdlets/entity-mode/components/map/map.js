/* eslint
no-console: 0,
no-unused-vars: 0
*/
import React, { useState, useContext, useMemo } from 'react';
import { Graph } from 'react-d3-graph';
import { Menu, Header, Divider, Button } from 'semantic-ui-react';
import DataContext from '../../context/data';
import { buildContextOptions, rightClick } from './map-utils';
// graph event callbacks
// const onDoubleClickNode = nodeId => {
//   console.log(`Double clicked node ${nodeId}`);
// };

// const onMouseOverNode = nodeId => {
//   console.log(`Mouse over node ${nodeId}`);
// };

// const onMouseOutNode = nodeId => {
//   console.log(`Mouse out node ${nodeId}`);
// };

// const onMouseOverLink = (source, target) => {
//   console.log(`Mouse over in link between ${source} and ${target}`);
// };

// const onMouseOutLink = (source, target) => {
//   console.log(`Mouse out link between ${source} and ${target}`);
// };

// do not allow negative coordinates
const safeCoordinate = coordinate =>
  coordinate <= 0 ? Math.floor(Math.random() * 150) + 1 : coordinate;

function Map(props) {
  const [rightClickType, setRightClickType] = useState('');
  const [menuX, setMenuX] = useState(0);
  const [menuY, setMenuY] = useState(0);
  const [rightClickedNodeId, setRightClickedNodeId] = useState(null);
  const {
    updateDataState,
    mapData,
    mapConfig,
    showContextMenu,
    hasError,
    err,
    errInfo,
    gravity,
    linkLength,
    selectedEntities
  } = useContext(DataContext);

  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     rightClickType: '',
  //     menuX: 0,
  //     menuY: 0,
  //     freezeNodes: false,
  //     rightClickedNodeId: null
  //   };

  // }

  // resetNodesPositions = () => this.refs.graph.resetNodesPositions();
  // logRefs = () => console.log(this.refs);

  const onNodePositionChange = async (
    nodeId,
    x,
    y,
    mapConfig,
    updateDataState
  ) => {
    // // perform a quick artifical update, before coordinates are saved to nerdstore
    // const { data } = this.state;
    // const indexToUpdate = data.nodes.findIndex(o => o.id === nodeId);
    // data.nodes[indexToUpdate].x = x;
    // data.nodes[indexToUpdate].y = y;

    const ignoreNames = ['Select or create a map!', 'Add a node!'];
    if (!ignoreNames.includes(nodeId)) {
      mapConfig.nodeData[nodeId].x = x;
      mapConfig.nodeData[nodeId].y = y;
      updateDataState({ mapConfig: { ...mapConfig } }, ['saveMap']);
    }

    console.log(
      `Node ${nodeId} moved to new position. New position is x= ${x} y= ${y}`
    );
  };

  const onRightClickNode = (event, nodeId, mapConfig, updateDataState) => {
    console.log(`Right clicked node ${(event, nodeId)}`);
    if (mapConfig && mapConfig.nodeData && mapConfig.nodeData[nodeId]) {
      this.setState({
        rightClickedNodeId: nodeId,
        rightClickType: 'node',
        menuX: event.clientX,
        menuY: event.clientY - 75
      });
      updateDataState({
        sidebarOpen: false,
        selectedNode: nodeId,
        showContextMenu: true
      });
    }
  };

  const onClickLink = (source, target) => {
    console.log(`Clicked link between ${source} and ${target}`);
  };

  const onClickGraph = updateDataContextState => {
    console.log(`Clicked the graph background`);
    updateDataState({
      selectedNode: '',
      sidebarOpen: false,
      showContextMenu: false
    });
  };

  const onClickNode = (nodeId, x, y) => {
    console.log(`onClickNode ${nodeId} ${x} ${y}`);
    selectedEntities[nodeId] = true;
    updateDataState({ showContextMenu: false, selectedEntities });
  };

  const onRightClickLink = (
    event,
    source,
    target,
    mapConfig,
    updateDataState
  ) => {
    console.log(`Right clicked link between ${source} and ${target}`);
    const link = `${source}:::${target}`;
    if (mapConfig && mapConfig.linkData && mapConfig.linkData[link]) {
      this.setState({
        rightClickType: 'link',
        menuX: event.clientX,
        menuY: event.clientY - 75
      });
      updateDataState({
        sidebarOpen: false,
        selectedLink: link,
        showContextMenu: true
      });
    }
  };

  // console.log('map render triggered');
  const { d3MapConfig, entityMapData } = props;

  // if (freezeNodes) {
  //   // d3MapConfig.staticGraph = true;
  //   // d3MapConfig.staticGraphWithDragAndDrop = false;
  // } else {
  //   d3MapConfig.staticGraph = false;
  //   d3MapConfig.staticGraphWithDragAndDrop = true;
  // }

  // disable right click
  // document.addEventListener('contextmenu', event => event.preventDefault());

  // manipulate marker location
  // this is quite hacky, consider having these features part of core graph lib
  for (let i = 0; i < document.getElementsByTagName('marker').length; i++) {
    document.getElementsByTagName('marker')[i].setAttribute('refX', '25');
    document
      .getElementsByTagName('marker')
      [i].setAttribute('markerWidth', '12');
    document
      .getElementsByTagName('marker')
      [i].setAttribute('markerHeight', '12');
  }

  // console.log('rendering: map');

  const contextOptions = buildContextOptions(
    mapData,
    rightClickType,
    rightClickedNodeId
  );

  return useMemo(() => {
    return (
      <>
        {' '}
        {showContextMenu && contextOptions.length > 0 ? (
          <div
            style={{
              backgroundColor: 'white',
              position: 'absolute',
              zIndex: 9999,
              top: menuY + 22,
              left: menuX + 22
            }}
          >
            <Menu vertical inverted style={{ borderRadius: '0px' }}>
              {contextOptions.map((item, i) => {
                return (
                  <Menu.Item
                    key={i}
                    link
                    onClick={() =>
                      rightClick(
                        item,
                        rightClickedNodeId,
                        updateDataState,
                        mapData,
                        mapConfig
                      )
                    }
                  >
                    <span
                      style={{
                        color: item.name === 'Delete' ? 'red' : 'white'
                      }}
                    >
                      {item.name}
                    </span>
                  </Menu.Item>
                );
              })}
            </Menu>
          </div>
        ) : (
          ''
        )}
        {hasError ? (
          <div style={{ padding: '15px' }}>
            <Header
              as="h3"
              content="Something went wrong :("
              style={{ color: 'white' }}
            />
            <Button
              color="blue"
              content="Clear Error"
              icon="info"
              size="large"
              onClick={
                () => window.location.reload()
                // updateDataContextState({
                //   selectedMap: null,
                //   hasError: false,
                //   err: null,
                //   errInfo: null,
                //   mapConfig: { nodeData: {}, linkData: {} },
                //   mapData: {
                //     nodeData: {},
                //     linkData: {}
                //   }
                // })
              }
            />
            <Divider />

            <Header
              as="h5"
              content="Error:"
              style={{
                color: 'white',
                paddingBottom: '0px',
                paddingTop: '0px'
              }}
            />
            <textarea
              style={{
                color: 'white',
                height: d3MapConfig.height / 6
              }}
              value={err}
              readOnly
            />

            <Header
              as="h5"
              content="Error Info:"
              style={{
                color: 'white',
                paddingBottom: '0px',
                paddingTop: '0px'
              }}
            />
            <textarea
              style={{
                color: 'white',
                height: d3MapConfig.height / 6
              }}
              value={JSON.stringify(errInfo)}
              readOnly
            />
            <Header
              as="h5"
              content="Map Config:"
              color="white"
              style={{
                color: 'white',
                paddingBottom: '0px',
                paddingTop: '0px'
              }}
            />
            <textarea
              style={{ height: d3MapConfig.height / 2.5, color: 'white' }}
              value={JSON.stringify(mapConfig)}
              readOnly
            />
          </div>
        ) : (
          <Graph
            id="graphid" // id is mandatory, if no id is defined rd3g will throw an error
            // ref="graph"
            data={entityMapData}
            config={d3MapConfig}
            onClickNode={(n, x, y) => onClickNode(n, x, y)}
            // onRightClickNode={(e, n) =>
            //   this.onRightClickNode(
            //     e,
            //     n,
            //     mapConfig,
            //     updateDataContextState
            //   )
            // }
            // onClickGraph={() => this.onClickGraph(updateDataContextState)}
            // onClickLink={this.onClickLink}
            // onRightClickLink={(e, s, t) =>
            //   this.onRightClickLink(
            //     e,
            //     s,
            //     t,
            //     mapConfig,
            //     updateDataContextState
            //   )
            // }
            // onMouseOverNode={onMouseOverNode}
            // onMouseOutNode={onMouseOutNode}
            // onMouseOverLink={onMouseOverLink}
            // onMouseOutLink={onMouseOutLink}
            // onNodePositionChange={(nodeId, x, y) =>
            //   this.onNodePositionChange(
            //     nodeId,
            //     safeCoordinate(x),
            //     safeCoordinate(y),
            //     mapConfig,
            //     updateDataContextState
            //   )
            // }
          />
        )}
      </>
    );
  }, [entityMapData, gravity, linkLength]);
}

export default Map;
