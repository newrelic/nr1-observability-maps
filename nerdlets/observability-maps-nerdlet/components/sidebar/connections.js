import React from "react";
import { Icon, List, Checkbox, Header, Menu } from "semantic-ui-react";
import { setAlertDesign, setEntityDesign } from "../../lib/helper";

const domains = ["APM", "INFRA", "BROWSER", "MOBILE", "SYNTH", "OTHER", "EXTERNAL"];

export default class SidebarConnections extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            incomingActiveMenuItem: "",
            outgoingActiveMenuItem: ""
        };
    }

    render() {
        let { mapData, mapConfig, selectedNode, setParentState } = this.props;
        let { incomingActiveMenuItem, outgoingActiveMenuItem } = this.state;

        const updateLink = (checked, direction, node, entity, mapConfig, setParentState) => {
            let linkId = direction == "outgoing" ? `${node}:::${entity.name}` : `${entity.name}:::${node}`;
            if (checked) {
                delete mapConfig.nodeData[entity.name];
                Object.keys(mapConfig.linkData).forEach(link => {
                    if (link.includes(`:::${entity.name}`) || link.includes(`${entity.name}:::`)) {
                        delete mapConfig.linkData[link];
                    }
                });
            } else {
                mapConfig.linkData[linkId] = {
                    source: direction == "outgoing" ? node : entity.name,
                    target: direction == "outgoing" ? entity.name : node
                };
                mapConfig.nodeData[entity.name] = {
                    name: entity.name,
                    guid: entity.guid,
                    entityType: entity.entityType,
                    domain: entity.domain
                };
            }
            setParentState({ mapConfig }, ["saveMap"]);
        };

        const renderConnectionsBlock = (title, data) => {
            let activeMenuItem = title == "Incoming" ? incomingActiveMenuItem : outgoingActiveMenuItem;
            let direction = title == "Incoming" ? "source" : "target";

            return (
                <>
                    <Header as="h5" style={{ paddingLeft: "10px" }}>
                        {title}
                    </Header>
                    {Object.keys(data).length > 0 ? (
                        <Menu pointing secondary style={{ fontSize: "12px" }}>
                            {Object.keys(data).map((domain, i) => {
                                if (data[domain].length > 0) {
                                    return (
                                        <Menu.Item
                                            key={i}
                                            name={domain}
                                            active={activeMenuItem === domain}
                                            onClick={() =>
                                                this.setState({
                                                    [title == "Incoming"
                                                        ? "incomingActiveMenuItem"
                                                        : "outgoingActiveMenuItem"]: domain
                                                })
                                            }
                                        ></Menu.Item>
                                    );
                                }
                            })}
                        </Menu>
                    ) : (
                        <span style={{ paddingLeft: "10px" }}>No connections</span>
                    )}

                    {activeMenuItem != "" ? (
                        <List style={{ overflowY: "scroll", maxHeight: "250px", paddingLeft: "10px" }}>
                            {data[activeMenuItem].map((conn, i) => {
                                let link =
                                    title == "Incoming"
                                        ? `${conn[direction].entity.name}:::${selectedNode}`
                                        : `${selectedNode}:::${conn[direction].entity.name}`;
                                let checked = mapConfig.linkData[link] == null ? false : true;
                                return (
                                    <List.Item key={i}>
                                        <Icon
                                            style={{ float: "left" }}
                                            color={
                                                setAlertDesign(
                                                    conn[direction].entity.alertSeverity,
                                                    conn[direction].entity.entityType
                                                ).colorOne
                                            }
                                            name={setEntityDesign(conn[direction].entity.entityType).icon}
                                        />{" "}
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
                                                    setParentState
                                                )
                                            }
                                            label={conn[direction].entity.name}
                                        />
                                    </List.Item>
                                );
                            })}
                        </List>
                    ) : (
                        ""
                    )}
                </>
            );
        };

        // need to filter source and targets correctly
        if (mapData && mapData.nodeData[selectedNode]) {
            let relationships = mapData.nodeData[selectedNode].relationships || [];
            if (relationships.length == 0) return "No connections found";

            let incoming = [];
            let outgoing = [];
            let incomingData = {};
            let outgoingData = {};

            relationships.forEach(conn => {
                const targetName = (((conn || {}).target || {}).entity || {}).name || "";
                const sourceName = (((conn || {}).source || {}).entity || {}).name || "";

                if (targetName == selectedNode && sourceName != selectedNode) incoming.push(conn);
                if (sourceName == selectedNode && targetName != selectedNode) outgoing.push(conn);
            });

            const handleDomain = (conn, dir) => {
                let domain = (((conn || {})[dir] || {}).entity || {}).domain || "OTHER";
                let entityType = (((conn || {})[dir] || {}).entity || {}).entityType || "";
                if (entityType.includes("EXTERNAL_SERVICE_ENTITY")) {
                    return "EXTERNAL";
                }
                return domain;
            };

            domains.forEach(domain => {
                incomingData[domain] = incoming.filter(conn => handleDomain(conn, "source") === domain);
                outgoingData[domain] = outgoing.filter(conn => handleDomain(conn, "target") === domain);

                // set defaults menu items if not set
                if (Object.keys(incomingData[domain]).length == 0) {
                    delete incomingData[domain];
                } else {
                    if (incomingActiveMenuItem == "" && incomingData[domain].length > 0)
                        incomingActiveMenuItem = domain;
                }
                if (Object.keys(outgoingData[domain]).length == 0) {
                    delete outgoingData[domain];
                } else {
                    if (outgoingActiveMenuItem == "" && outgoingData[domain].length > 0)
                        outgoingActiveMenuItem = domain;
                }
            });

            return (
                <>
                    {renderConnectionsBlock("Incoming", incomingData)}
                    {renderConnectionsBlock("Outgoing", outgoingData)}
                </>
            );
        }

        return "No connections found";
    }
}
