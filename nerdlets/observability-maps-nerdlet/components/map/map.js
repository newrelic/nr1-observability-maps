import React from "react";
import { Graph } from "react-d3-graph";
import { Menu, Button } from "semantic-ui-react";
import { navigation } from "nr1";

// graph event callbacks
const onDoubleClickNode = nodeId => {
    console.log(`Double clicked node ${nodeId}`);
};

const onMouseOverNode = nodeId => {
    // window.alert(`Mouse over node ${nodeId}`);
};

const onMouseOutNode = nodeId => {
    // window.alert(`Mouse out node ${nodeId}`);
};

const onMouseOverLink = (source, target) => {
    // window.alert(`Mouse over in link between ${source} and ${target}`);
};

const onMouseOutLink = (source, target) => {
    // window.alert(`Mouse out link between ${source} and ${target}`);
};

export default class Map extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showContextMenu: false,
            rightClickType: "",
            rightClickedLinkId: "",
            menuX: 0,
            menuY: 0,
            freezeNodes: false,
            rightClickedNodeId: null
        };

        this.onClickLink = this.onClickLink.bind(this);
        this.onClickGraph = this.onClickGraph.bind(this);
        this.onClickNode = this.onClickNode.bind(this);
        this.onNodePositionChange = this.onNodePositionChange.bind(this);
        this.onRightClickLink = this.onRightClickLink.bind(this);
    }

    // resetNodesPositions = () => this.refs.graph.resetNodesPositions();
    logRefs = () => console.log(this.refs);

    onNodePositionChange = async (nodeId, x, y, mapConfig, setParentState) => {
        await this.setState({ freezeNodes: true });
        const ignoreNames = ["Select or create a map!", "Add a node!"];
        if (!ignoreNames.includes(nodeId)) {
            mapConfig.nodeData[nodeId].x = x;
            mapConfig.nodeData[nodeId].y = y;
            setParentState({ mapConfig }, ["saveMap"]);
        }
        await this.setState({ freezeNodes: false });
        console.log(`Node ${nodeId} is moved to new position. New position is x= ${x} y= ${y}`);
    };

    onRightClickNode = (event, nodeId, mapConfig, setParentState) => {
        console.log(`Right clicked node ${(event, nodeId)}`);
        if (mapConfig && mapConfig.nodeData && mapConfig.nodeData[nodeId]) {
            this.setState({
                rightClickedNodeId: nodeId,
                rightClickType: "node",
                showContextMenu: true,
                menuX: event.clientX,
                menuY: event.clientY - 75
            });
            setParentState({ sidebarOpen: false, selectedNode: nodeId });
        }
    };

    onClickLink = (source, target) => {
        console.log(`Clicked link between ${source} and ${target}`);
    };

    onClickGraph = setParentState => {
        console.log(`Clicked the graph background`);
        this.setState({ showContextMenu: false });
        setParentState({ selectedNode: "", sidebarOpen: false });
    };

    onClickNode = (nodeId, x, y) => {
        console.log(`onClickNode ${nodeId}`);
        this.setState({ showContextMenu: false });
    };

    onRightClickLink = (event, source, target, mapConfig, setParentState) => {
        console.log(`Right clicked link between ${source} and ${target}`);
        let link = `${source}:::${target}`;
        if (mapConfig && mapConfig.linkData && mapConfig.linkData[link]) {
            this.setState({
                rightClickedLinkId: link,
                rightClickType: "link",
                showContextMenu: true,
                menuX: event.clientX,
                menuY: event.clientY - 75
            });
            setParentState({ sidebarOpen: false, selectedLink: link });
        }
    };

    componentDidMount() {
        if (this.props.mapData) {
            this.setState({ mapData: this.props.mapData });
        }
    }

    componentDidUpdate() {
        if (this.props.mapData != this.state.mapData) {
            this.setState({ showContextMenu: false, mapData: this.props.mapData });
        }
    }

    render() {
        let { setParentState, d3MapConfig, mapConfig } = this.props;
        let {
            showContextMenu,
            menuX,
            menuY,
            mapData,
            freezeNodes,
            rightClickedNodeId,
            rightClickedLinkId,
            rightClickType
        } = this.state;

        if (freezeNodes) {
            // d3MapConfig.staticGraph = true;
            // d3MapConfig.staticGraphWithDragAndDrop = false;
        } else {
            d3MapConfig.staticGraph = false;
            d3MapConfig.staticGraphWithDragAndDrop = true;
        }

        // disable right click
        document.addEventListener("contextmenu", event => event.preventDefault());

        // manipulate marker location
        // this is quite hacky, consider having these features part of core graph lib
        for (let i = 0; i < document.getElementsByTagName("marker").length; i++) {
            document.getElementsByTagName("marker")[i].setAttribute("refX", "25");
            document.getElementsByTagName("marker")[i].setAttribute("markerWidth", "12");
            document.getElementsByTagName("marker")[i].setAttribute("markerHeight", "12");
        }

        let contextOptions = [];
        if (mapData) {
            if (rightClickType == "node" && mapData.nodeData[rightClickedNodeId]) {
                const ignoreEntityTypes = ["APM_EXTERNAL_SERVICE_ENTITY"];
                if (
                    !ignoreEntityTypes.includes(mapData.nodeData[rightClickedNodeId].entityType) &&
                    mapData.nodeData[rightClickedNodeId].guid
                ) {
                    contextOptions.push({
                        name: "View Entity",
                        action: "openStackedEntity",
                        value: mapData.nodeData[rightClickedNodeId].guid
                    });
                }

                if (
                    mapData.nodeData[rightClickedNodeId].relationships &&
                    mapData.nodeData[rightClickedNodeId].relationships.length > 0
                ) {
                    contextOptions.push({
                        name: "View Connected Entities",
                        action: "viewConnectedEntities",
                        view: "connections"
                    });
                }
            } else if (rightClickType == "link") {
                contextOptions.push({ name: "Edit", action: "editLink" });
            }
        }

        const ignoreNames = ["Select or create a map!", "Add a node!"];
        if (rightClickType == "node" && !ignoreNames.includes(rightClickedNodeId)) {
            contextOptions.push({ name: "Edit", action: "editNode" });
            contextOptions.push({ name: "Delete", action: "deleteNode" });
        }

        const rightClick = item => {
            switch (item.action) {
                case "openStackedEntity":
                    navigation.openStackedEntity(item.value);
                    break;
                case "viewConnectedEntities":
                    setParentState({ sidebarOpen: true, sidebarView: item.view });
                    break;
                case "editNode":
                    setParentState({ editNodeOpen: true });
                    break;
                case "editLink":
                    setParentState({ editLinkOpen: true });
                    break;
                case "deleteNode":
                    delete mapConfig.nodeData[rightClickedNodeId];
                    Object.keys(mapConfig.linkData).forEach(link => {
                        if (link.includes(rightClickedNodeId + ":::") || link.includes(":::" + rightClickedNodeId)) {
                            delete mapConfig.linkData[link];
                        }
                    });
                    setParentState({ mapConfig }, ["saveMap"]);
                    break;
            }
            this.setState({ showContextMenu: false });
        };

        return (
            <>
                {" "}
                {showContextMenu && contextOptions.length > 0 ? (
                    <div
                        style={{
                            backgroundColor: "white",
                            position: "absolute",
                            zIndex: 9999,
                            top: menuY + 22,
                            left: menuX + 22
                        }}
                    >
                        <Menu vertical inverted style={{ borderRadius: "0px" }}>
                            {contextOptions.map((item, i) => {
                                return (
                                    <Menu.Item key={i} link onClick={() => rightClick(item)}>
                                        {item.name}
                                    </Menu.Item>
                                );
                            })}
                        </Menu>
                    </div>
                ) : (
                    ""
                )}
                {/* <Button onClick={this.logRefs}>restart sim</Button> */}
                <Graph
                    id="graphid" // id is mandatory, if no id is defined rd3g will throw an error
                    ref="graph"
                    data={this.props.data}
                    config={d3MapConfig}
                    onClickNode={this.onClickNode}
                    onRightClickNode={(e, n) => this.onRightClickNode(e, n, mapConfig, setParentState)}
                    onClickGraph={() => this.onClickGraph(setParentState)}
                    onClickLink={this.onClickLink}
                    onRightClickLink={(e, s, t) => this.onRightClickLink(e, s, t, mapConfig, setParentState)}
                    onMouseOverNode={onMouseOverNode}
                    onMouseOutNode={onMouseOutNode}
                    onMouseOverLink={onMouseOverLink}
                    onMouseOutLink={onMouseOutLink}
                    onNodePositionChange={(nodeId, x, y) =>
                        this.onNodePositionChange(nodeId, x, y, mapConfig, setParentState)
                    }
                />
            </>
        );
    }
}
