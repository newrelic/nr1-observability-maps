import React from "react";
import { Grid, Popup, Button } from "semantic-ui-react";
import MenuBar from "./navigation/menu-bar";
import Map from "./map/map";
import { NerdGraphQuery } from "nr1";
import {
    getUserCollection,
    getAccountCollection,
    entityBatchQuery,
    nerdGraphQuery,
    writeUserDocument,
    singleNrql,
    ApmEntityBatchQuery
} from "../lib/utils";
import NodeHandler from "./custom-nodes/handler";
import CustomLabel from "./node/custom-label";
import Sidebar from "./sidebar/sidebar";
import EditNode from "./node/edit-node";
import EditLink from "./link/edit-link";
import { setLinkData } from "../lib/helper";
import Timeline from "./timeline/timeline";

const collectionName = "ObservabilityMaps";
const userConfig = "ObservabilityUserConfig";
const iconCollection = "ObservabilityIcons";

const chunk = (arr, size) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));

export default class ObservabilityMaps extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            bucketMs: { key: 1, label: "30 sec", value: 30000 },
            selectedMap: null,
            selectedNode: "",
            selectedLink: "",
            mapConfig: {
                nodeData: {
                    "Select or create a map, to get started!": { y: 30, x: 300, icon: "arrow up" },
                    "Tip: Right click on map nodes for more options!": { y: 100, x: 350, icon: "help" }
                },
                linkData: {}
            },
            mapData: {
                nodeData: {},
                linkData: {}
            },
            data: {
                nodes: [],
                links: []
            },
            userIcons: [],
            entityData: {},
            storeLocation: "user",
            userConfig: null,
            accountMaps: null,
            userMaps: null,
            accounts: [],
            sidebarOpen: false,
            timelineOpen: false,
            sidebarView: "",
            editNodeOpen: false,
            editLinkOpen: false,
            isRefreshing: false,
            closeCharts: false
        };
        this.dataFetcher = this.dataFetcher.bind(this);
        this.setParentState = this.setParentState.bind(this);
        this.handleMapData = this.handleMapData.bind(this);
        this.fetchNrql = this.fetchNrql.bind(this);
        this.refreshData = this.refreshData.bind(this);
    }

    setParentState(stateData, actions) {
        return new Promise(async resolve => {
            await this.setState(stateData);

            if (actions && actions.length > 0) {
                actions.forEach(async action => {
                    switch (action) {
                        case "loadMap":
                            console.log(stateData["selectedMap"]);
                            if (stateData["selectedMap"]) {
                                switch (stateData["selectedMap"].type) {
                                    case "user":
                                        let { userMaps } = this.state;
                                        for (let i = 0; i < userMaps.length; i++) {
                                            if (userMaps[i].id == stateData["selectedMap"].value) {
                                                let mapConfig = JSON.parse(JSON.stringify(userMaps[i].document));
                                                await this.setState({ mapConfig });
                                                break;
                                            }
                                        }
                                        break;
                                }
                            } else {
                                await this.setState({
                                    mapConfig: {
                                        nodeData: {
                                            "Select or create a map, to get started!": {
                                                y: 30,
                                                x: 300,
                                                icon: "arrow up"
                                            },
                                            "Tip: Right click on map nodes for more options!": {
                                                y: 100,
                                                x: 350,
                                                icon: "help"
                                            }
                                        },
                                        linkData: {}
                                    }
                                });
                            }

                            this.handleMapData();

                            break;
                        case "saveMap":
                            let { storeLocation, selectedMap } = this.state;
                            switch (storeLocation) {
                                case "account":
                                    // not implemented yet
                                    // writeAccountDocument("ObservabilityMaps", mapName, payload)
                                    // dataFetcher(["accountMaps"])
                                    break;
                                case "user":
                                    if (stateData.mapConfig) {
                                        let mapConfig = JSON.parse(JSON.stringify(stateData.mapConfig));
                                        console.log("savingMap", mapConfig);
                                        await writeUserDocument("ObservabilityMaps", selectedMap.value, mapConfig);
                                        await this.dataFetcher(["userMaps"]);
                                        this.handleMapData();
                                    }

                                    break;
                            }
                            break;
                    }
                });
            }

            resolve();
        });
    }

    async componentDidMount() {
        await this.dataFetcher(["userConfig", "userMaps", "accountMaps", "accounts", "userIcons"]);
        this.handleMapData();
        this.refreshData();
    }

    refreshData() {
        let interval = this.state.bucketMs.value;
        Do = Do.bind(this);
        this.refresh = setInterval(async () => Do(), interval);

        async function Do() {
            if (interval != this.state.bucketMs.value) {
                console.log(`Updating... (timer: ${interval}ms to ${this.state.bucketMs.value}ms)`);
                interval = this.state.bucketMs.value;
                clearInterval(this.refresh);
                this.refresh = setInterval(async () => Do(), interval);
            }
            if (!this.state.isRefreshing) {
                console.log(`Refreshing... (timer: ${interval}ms) ${new Date().getTime()}`);
                await this.setState({ isRefreshing: true });
                await this.handleMapData();
                await this.setState({ isRefreshing: false });
            } else {
                console.log(
                    `Already refreshing... waiting for next cycle (timer: ${interval}ms) ${new Date().getTime()}`
                );
            }
        }
    }

    // transforms mapConfig => mapData => d3 format & decorates
    handleMapData() {
        return new Promise(async resolve => {
            // avoid nested references in mapConfig using parse & stringify
            let mapData = JSON.parse(JSON.stringify(this.state.mapConfig));

            let nodePromises = Object.keys(mapData.nodeData).map(nodeId => {
                return new Promise(async resolve => {
                    // // decorate nrql hover metrics
                    let nrqlHoverData = await this.fetchNrql(mapData.nodeData[nodeId], "hover");
                    if (nrqlHoverData) mapData.nodeData[nodeId].hoverData = nrqlHoverData;

                    // // decorate nrql hover metrics
                    let nrqlAlertData = await this.fetchNrql(mapData.nodeData[nodeId], "customAlert");
                    if (nrqlAlertData) mapData.nodeData[nodeId].customAlertData = nrqlAlertData;
                    resolve();
                });
            });
            await Promise.all(nodePromises);

            let linkPromises = Object.keys(mapData.linkData).map(linkId => {
                return new Promise(async resolve => {
                    // // decorate nrql hover metrics
                    let nrqlHoverData = await this.fetchNrql(mapData.linkData[linkId], "hover");
                    if (nrqlHoverData) mapData.linkData[linkId].hoverData = nrqlHoverData;

                    // // decorate nrql hover metrics
                    let nrqlAlertData = await this.fetchNrql(mapData.linkData[linkId], "customAlert");
                    if (nrqlAlertData) mapData.linkData[linkId].customAlertData = nrqlAlertData;
                    resolve();
                });
            });
            await Promise.all(linkPromises);

            // fetchEntityData
            let allEntityData = await this.fetchEntityData(mapData);

            let entityPromises = allEntityData.map(entity => {
                return new Promise(async resolve => {
                    for (let z = 0; z < Object.keys(mapData.nodeData).length; z++) {
                        let key = Object.keys(mapData.nodeData)[z];

                        // decorate entity data
                        if (entity.guid && entity.guid == mapData.nodeData[key].guid) {
                            mapData.nodeData[key] = Object.assign(mapData.nodeData[key], entity);
                            break;
                        }

                        // decorate external entity data that is tied from APM Service <> External across the link
                        if (mapData.nodeData[key].relationships && mapData.nodeData[key].relationships.length > 0) {
                            mapData.nodeData[key].relationships.forEach(conn => {
                                let sourceEntityType = (((conn || {}).source || {}).entity || {}).entityType || "";
                                if (sourceEntityType == "APM_EXTERNAL_SERVICE_ENTITY") {
                                    if (mapData.nodeData[conn.source.entity.name]) {
                                        let link = `${conn.source.entity.name}:::${key}`;
                                        if (mapData.linkData[link]) {
                                            mapData.linkData[link].externalSummary = Object.assign(
                                                {},
                                                conn.source.entity.externalSummary
                                            );
                                        }
                                    }
                                }
                                let targetEntityType = (((conn || {}).target || {}).entity || {}).entityType || "";
                                if (targetEntityType == "APM_EXTERNAL_SERVICE_ENTITY") {
                                    if (mapData.nodeData[conn.target.entity.name]) {
                                        let link = `${key}:::${conn.target.entity.name}`;
                                        if (mapData.linkData[link]) {
                                            mapData.linkData[link].externalSummary = Object.assign(
                                                {},
                                                conn.target.entity.externalSummary
                                            );
                                        }
                                    }
                                }
                            });
                        }
                    }
                    resolve();
                });
            });

            await Promise.all(entityPromises);

            let links = [];
            // reconstruct node data for graph
            let nodes = Object.keys((mapData || {}).nodeData || {}).map(node => {
                let obj = Object.assign({ id: node }, mapData.nodeData[node]);

                // randomize node location if no x / y coordinates have been set
                if (!obj.x) obj.x = Math.floor(Math.random() * 500) + 50;
                if (!obj.y) obj.y = Math.floor(Math.random() * 500) + 50;
                mapData.nodeData[node].x = obj.x;
                mapData.nodeData[node].y = obj.y;

                // self link so it appears in center
                // needed when not using static graphs
                // links.push({source: node, target: node})
                return obj;
            });

            // add dummy node if none exists
            let element = document.getElementById("nodesbtn");
            let dummyX = element ? element.getBoundingClientRect().x + 40 : 400;

            if (nodes.length == 0) nodes = [{ id: "Add a node!", y: 30, x: dummyX, icon: "arrow up" }];

            // reconstruct link data for graph
            let mapLinks = Object.keys((mapData || {}).linkData || {}).map(link => {
                return {
                    source: mapData.linkData[link].source,
                    target: mapData.linkData[link].target
                };
            });

            links = [...links, ...mapLinks];
            let data = { nodes, links };

            console.log("decorated mapData", mapData);

            this.setState({ data, mapData });
            resolve();
        });
    }

    // nodeData should be renamed to something generic
    fetchNrql(nodeData, fetch) {
        return new Promise(async resolve => {
            let nrqlQueries = [];

            if (fetch == "hover" && nodeData.hoverType == "customNrql") {
                if (nodeData.hoverMetrics) {
                    nrqlQueries = Object.keys(nodeData.hoverMetrics)
                        .map(i => {
                            if (nodeData.hoverMetrics[i].nrql && nodeData.hoverMetrics[i].accountId) {
                                return nodeData.hoverMetrics[i];
                            }
                        })
                        .filter(nrql => nrql);
                }
            } else if (
                fetch == "customAlert" &&
                nodeData.customAlert &&
                nodeData.customAlert.alertNrql &&
                nodeData.customAlert.alertNrqlAcc
            ) {
                nrqlQueries.push({
                    nrql: nodeData.customAlert.alertNrql,
                    accountId: nodeData.customAlert.alertNrqlAcc
                });
            }

            if (nrqlQueries.length > 0) {
                let query = `{ actor {`;
                let keys = [];

                nrqlQueries.forEach((q, i) => {
                    query += singleNrql(`nrql${i}`, q.nrql, q.accountId);
                    keys.push(`nrql${i}`);
                });
                query += `}}`;

                let ngResults = await nerdGraphQuery(query);
                let finalResults = [];

                if (ngResults.actor) {
                    keys.forEach(key => {
                        let results = ((ngResults.actor[key] || {}).nrql || {}).results || [];
                        if (results.length == 1) {
                            Object.keys(results[0]).forEach(item => {
                                finalResults.push({
                                    name: item,
                                    value: results[0][item]
                                });
                            });
                        }
                    });
                }

                resolve(finalResults);
            } else {
                resolve();
            }
        });
    }

    async fetchEntityData(mapData) {
        return new Promise(async resolve => {
            let apmEntityGuids = [];
            let otherEntityGuids = [];
            Object.keys((mapData || {}).nodeData || {}).forEach(node => {
                if (mapData.nodeData[node].entityType == "APM_APPLICATION_ENTITY") {
                    apmEntityGuids.push(mapData.nodeData[node].guid);
                } else {
                    if (mapData.nodeData[node].guid) otherEntityGuids.push(mapData.nodeData[node].guid);
                }
            });

            let entityChunks = chunk(otherEntityGuids, 25);
            let entityPromises = entityChunks.map(chunk => {
                return new Promise(async resolve => {
                    let guids = `"` + chunk.join(`","`) + `"`;
                    let nerdGraphResult = await nerdGraphQuery(entityBatchQuery(guids));
                    resolve(nerdGraphResult);
                });
            });

            let apmEntityChunks = chunk(apmEntityGuids, 25);
            let apmEntityPromises = apmEntityChunks.map(chunk => {
                return new Promise(async resolve => {
                    let guids = `"` + chunk.join(`","`) + `"`;
                    let nerdGraphResult = await nerdGraphQuery(ApmEntityBatchQuery(guids));
                    resolve(nerdGraphResult);
                });
            });

            await Promise.all([...entityPromises, ...apmEntityPromises]).then(values => {
                let entityData = [];
                values.forEach(async value => {
                    let entitiesResult = ((value || {}).actor || {}).entities || [];
                    entityData = [...entityData, ...entitiesResult];
                });
                resolve(entityData);
            });
        });
    }

    // fetch data as required, supply array things to fetch
    async dataFetcher(actions) {
        return new Promise(async resolve => {
            await this.setState({ loading: true });
            let dataPromises = [];
            let content = [];

            actions.forEach(action => {
                switch (action) {
                    case "userMaps":
                        content.push(action);
                        dataPromises.push(getUserCollection(collectionName));
                        break;
                    case "userIcons":
                        content.push(action);
                        dataPromises.push(getUserCollection(iconCollection));
                        break;
                    case "accountMaps":
                        content.push(action);
                        dataPromises.push(getAccountCollection(collectionName));
                        break;
                    case "userConfig":
                        content.push(action);
                        dataPromises.push(getUserCollection(userConfig, userConfig));
                        break;
                    case "accounts":
                        content.push(action);
                        const accountsQuery = `{actor {accounts {name id}}}`;
                        dataPromises.push(NerdGraphQuery.query({ query: accountsQuery }));
                        break;
                }
            });

            await Promise.all(dataPromises).then(async values => {
                let data = { loading: false };
                values.forEach((value, i) => {
                    switch (content[i]) {
                        case "userMaps":
                            data[content[i]] = value;
                            break;
                        case "userIcons":
                            data[content[i]] = value;
                            break;
                        case "accountMaps":
                            data[content[i]] = value;
                            break;
                        case "userConfig":
                            data.userConfig = value.length > 0 ? value : {};
                            break;
                        case "accounts":
                            data.accounts = (((value || {}).data || {}).actor || {}).accounts || [];
                            break;
                    }
                });

                await this.setState(data);
                resolve();
            });
        });
    }

    // generate customized node view
    viewGenerator = e => {
        // style={{backgroundColor:"black"}}
        return (
            <div>
                <Popup pinned on="click" basic content="Add users to your feed" trigger={<Button icon="add" />} />
                {/* {e.label} */}
            </div>
        );
    };

    render() {
        let {
            data,
            accountMaps,
            userMaps,
            accounts,
            loading,
            mapConfig,
            mapData,
            timelineOpen,
            sidebarOpen,
            sidebarView,
            selectedMap,
            selectedNode,
            selectedLink,
            bucketMs,
            userIcons,
            editNodeOpen,
            editLinkOpen,
            closeCharts
        } = this.state;
        let graphWidth = sidebarOpen ? (this.props.width / 4) * 3 : this.props.width;
        let nodeSize = 700;

        let mainGridStyle = {
            height: this.props.height - 60,
            backgroundColor: "black",
            marginTop: "0px"
        };

        // dynamically add map settings
        if (mapConfig.settings) {
            Object.keys(mapConfig.settings).forEach(key => {
                if (key.startsWith("background")) {
                    mainGridStyle[key] = mapConfig.settings[key];
                }
            });
        }

        // the graph configuration, you only need to pass down properties
        // that you want to override, otherwise default ones will be used
        let d3MapConfig = {
            staticGraph: false,
            staticGraphWithDragAndDrop: true,
            d3: {
                linkLength: 200
            },
            nodeHighlightBehavior: false, // if this is set to true reset positions doesn't work
            node: {
                color: "lightgreen",
                size: nodeSize,
                highlightStrokeColor: "blue",
                fontSize: 16,
                highlightFontSize: 16,
                // labelProperty: node => <CustomLabel node={node} />,
                // renderLabel: false,
                fontColor: "white",
                // viewGenerator: node => <Popup basic pinned on={"click"} content={node} trigger={<Button color="green" icon='add' />} />
                viewGenerator: node => (
                    <NodeHandler
                        sidebarOpen={sidebarOpen}
                        node={node}
                        mapData={mapData}
                        nodeSize={nodeSize}
                        setParentState={this.setParentState}
                        userIcons={userIcons}
                        closeCharts={closeCharts}
                    />
                )
            },
            link: {
                highlightColor: "lightblue",
                type: "CURVE_SMOOTH",
                renderLabel: true,
                labelProperty: link => setLinkData(link, mapData.linkData),
                fontColor: "#21ba45",
                fontSize: 13,
                fontWeight: "bold"
            },
            directed: true,
            height: this.props.height - 80,
            width: graphWidth
        };

        return (
            <div>
                {/* mapData is sent through the menuBar to let react trigger updates for manage nodes & links, this should be reworked */}
                <MenuBar
                    setParentState={this.setParentState}
                    loading={loading}
                    accounts={accounts}
                    accountMaps={accountMaps}
                    userMaps={userMaps}
                    dataFetcher={this.dataFetcher}
                    rawData={data}
                    mapConfig={mapConfig}
                    mapData={mapData}
                    bucketMs={bucketMs}
                    userIcons={userIcons}
                    timelineOpen={timelineOpen}
                />

                <Grid columns={16} style={mainGridStyle}>
                    <Grid.Row style={{ paddingTop: "0px" }}>
                        <Grid.Column width={16}>
                            {data.nodes.length > 0 ? (
                                <Map
                                    d3MapConfig={d3MapConfig}
                                    setParentState={this.setParentState}
                                    selectedMap={selectedMap}
                                    mapConfig={mapConfig}
                                    mapData={mapData}
                                    data={data}
                                    editNodeOpen={editNodeOpen}
                                    editLinkOpen={editLinkOpen}
                                />
                            ) : (
                                ""
                            )}
                        </Grid.Column>
                    </Grid.Row>

                    <Sidebar
                        height={this.props.height - 60}
                        sidebarOpen={sidebarOpen}
                        sidebarView={sidebarView}
                        setParentState={this.setParentState}
                        selectedNode={selectedNode}
                        mapConfig={mapConfig}
                        mapData={mapData}
                    />

                    <Timeline
                        height={this.props.height - 60}
                        timelineOpen={timelineOpen}
                        setParentState={this.setParentState}
                        selectedNode={selectedNode}
                        mapConfig={mapConfig}
                        mapData={mapData}
                        data={data}
                    />
                </Grid>

                <EditNode
                    setParentState={this.setParentState}
                    editNodeOpen={editNodeOpen}
                    selectedNode={selectedNode}
                    mapConfig={mapConfig}
                    accounts={accounts}
                    userIcons={userIcons}
                />

                <EditLink
                    setParentState={this.setParentState}
                    editLinkOpen={editLinkOpen}
                    selectedLink={selectedLink}
                    mapConfig={mapConfig}
                    accounts={accounts}
                    userIcons={userIcons}
                />
            </div>
        );
    }
}
