import React from "react";
import { Modal, Button, Form, Select } from "semantic-ui-react";
import LinksTable from "./links-table";

export default class ManageLinks extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            storeLocation: "user",
            open: false,
            selectedLinkType: null,
            linkName: "",
            selectedSource: "",
            selectedTarget: ""
        };
        this.save = this.save.bind(this);
        this.manageLink = this.manageLink.bind(this);
    }

    save = async (mapConfig, setParentState) => {
        let { selectedAccount, selectedLinkType, linkName } = this.state;
        this.setState({ open: false });

        switch (selectedLinkType) {
            case "custom":
                mapConfig.nodeData[linkName] = { nodeType: "custom" };
                break;
            case "account":
                // 0 == accountId, 1 == accountName
                let accountSplit = selectedAccount.split(/: (.+)/);
                mapConfig.nodeData[accountSplit[1]] = {
                    nodeType: "account",
                    accountId: accountSplit[0]
                };
                break;
        }

        setParentState({ mapConfig }, ["saveMap", "loadMap"]);
    };

    handleOpen = () => this.setState({ open: true });
    handleClose = () => this.setState({ open: false, selectedSource: "", selectedTarget: "" });

    createLinkOptions = mapConfig => {
        let linkOptions = Object.keys((mapConfig || {}).linkData || []).map(link => ({
            key: `${mapConfig.linkData[link].source} -> ${mapConfig.linkData[link].target}`,
            text: `${mapConfig.linkData[link].source} -> ${mapConfig.linkData[link].target}`,
            value: `${mapConfig.linkData[link].source} -> ${mapConfig.linkData[link].target}`
        }));
        linkOptions.unshift({ key: "n", text: "Create a New Link", value: "new" });
        return linkOptions;
    };

    createNodeOptions = mapConfig => {
        return Object.keys((mapConfig || {}).nodeData || []).map(node => ({
            key: node,
            text: node,
            value: node
        }));
    };

    // clean this up to just send modified mapConfig
    manageLink = async (action, mapConfig, setParentState, incomingSelectedSource, incomingSelectedTarget) => {
        let selectedSource = incomingSelectedSource || this.state.selectedSource;
        let selectedTarget = incomingSelectedTarget || this.state.selectedTarget;

        if (action == "add") {
            mapConfig.linkData[`${selectedSource}:::${selectedTarget}`] = {
                source: selectedSource,
                target: selectedTarget
            };
        } else if (action == "del") {
            delete mapConfig.linkData[`${selectedSource}:::${selectedTarget}`];
        }

        setParentState({ mapConfig }, ["saveMap"]);
    };

    render() {
        let { open, selectedLinkType, linkName, selectedTarget, selectedSource } = this.state;
        let { mapConfig, setParentState, mapData } = this.props;
        // let linkOptions = this.createLinkOptions(mapConfig)
        let nodeOptions = this.createNodeOptions(mapConfig);

        let customLinkErrorContent = { content: "", pointing: "above" };
        let customLinkError = false;

        // needs handling for existing nodes
        if (selectedLinkType == "custom") {
            if (linkName.length == 0) {
                customLinkErrorContent.content = "Please enter a node name";
                customLinkError = true;
            }
        }

        let foundLink =
            mapConfig && mapConfig.linkData && mapConfig.linkData[`${selectedSource}:::${selectedTarget}`]
                ? true
                : false;

        return (
            <Modal
                open={open}
                onClose={this.handleClose}
                size="small"
                trigger={
                    <Button
                        onClick={() => this.setState({ open: true })}
                        className="filter-button"
                        icon="linkify"
                        content="Links"
                    />
                }
                onUnmount={() => setParentState({ closeCharts: false })}
                onMount={() => setParentState({ closeCharts: true })}
            >
                <Modal.Header>Manage Links</Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field
                            control={Select}
                            // label='Node Source'
                            options={nodeOptions}
                            placeholder="Select Node Source..."
                            value={selectedSource}
                            onChange={(e, d) => this.setState({ selectedSource: d.value })}
                        />
                        <Form.Group widths={16}>
                            <Form.Field
                                width={13}
                                disabled={!selectedSource}
                                control={Select}
                                // label='Node Target'
                                options={nodeOptions}
                                placeholder="Select Node Target..."
                                value={selectedTarget}
                                onChange={(e, d) => this.setState({ selectedTarget: d.value })}
                                style={{ width: "100%" }}
                            />
                            {foundLink ? (
                                <Form.Button
                                    width={3}
                                    disabled={!selectedSource || !selectedTarget}
                                    style={{ float: "right", height: "38px" }}
                                    content="Delete"
                                    icon="minus"
                                    onClick={() => this.manageLink("del", mapConfig, setParentState)}
                                />
                            ) : (
                                <Form.Button
                                    width={3}
                                    disabled={!selectedSource || !selectedTarget}
                                    style={{ float: "right", height: "38px" }}
                                    content="Add"
                                    icon="plus"
                                    onClick={() => this.manageLink("add", mapConfig, setParentState)}
                                />
                            )}
                        </Form.Group>
                    </Form>
                    {selectedSource ? (
                        <LinksTable
                            mapData={mapData}
                            mapConfig={mapConfig}
                            selectedSource={selectedSource}
                            manageLink={this.manageLink}
                            setParentState={setParentState}
                        />
                    ) : (
                        ""
                    )}
                </Modal.Content>
                <Modal.Actions>
                    {/* <Button positive onClick={()=>this.save(dataFetcher, mapConfig, selectedMap, setParentState)}>Create</Button> */}
                    <Button negative onClick={this.handleClose}>
                        Close
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}
