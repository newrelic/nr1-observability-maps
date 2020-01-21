import React from "react";
import { Modal, Button, Form, Select, Table, Menu } from "semantic-ui-react";
import { nerdGraphQuery, entitySearchByAccountQuery } from "../../lib/utils";
import DeleteNode from "./delete-node";

export default class ManageNodes extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            storeLocation: "user",
            open: false,
            selectedNodeType: null,
            selectedAccount: null,
            customNodeName: "",
            selectedDomain: "",
            searchedEntities: [],
            selectedEntity: null,
            activeNodeItem: "Add Node",
            showSearchMsg: false
        };
        this.action = this.action.bind(this);
        this.fetchEntities = this.fetchEntities.bind(this);
    }

    action = async (action, mapConfig, setParentState, entity, node) => {
        let { selectedAccount, selectedNodeType, customNodeName } = this.state;
        this.setState({ open: false });

        if (entity) selectedNodeType = "entity";
        if (node) selectedNodeType = "node";

        switch (action) {
            case "add":
                switch (selectedNodeType) {
                    case "custom":
                        mapConfig.nodeData[customNodeName] = { entityType: "CUSTOM_NODE" };
                        break;
                    case "account":
                        // 0 == accountId, 1 == accountName
                        let accountSplit = selectedAccount.split(/: (.+)/);
                        mapConfig.nodeData[accountSplit[1]] = {
                            accountId: accountSplit[0],
                            entityType: "CUSTOM_ACCOUNT"
                        };
                        break;
                    case "entity":
                        mapConfig.nodeData[entity.name] = {
                            nodeType: "entity",
                            entityType: entity.entityType,
                            guid: entity.guid
                        };
                        break;
                }
                break;
            case "del":
                switch (selectedNodeType) {
                    case "account":
                        // 0 == accountId, 1 == accountName
                        let accountSplit = selectedAccount.split(/: (.+)/);
                        delete mapConfig.nodeData[accountSplit[1]];

                        // clean up links
                        Object.keys(mapConfig.linkData).forEach(link => {
                            if (link.includes(accountSplit[1] + ":::") || link.includes(":::" + accountSplit[1])) {
                                delete mapConfig.linkData[link];
                            }
                        });
                        break;
                    case "entity":
                        delete mapConfig.nodeData[entity.name];

                        // clean up links
                        Object.keys(mapConfig.linkData).forEach(link => {
                            if (link.includes(accountSplit[1] + ":::") || link.includes(":::" + accountSplit[1])) {
                                delete mapConfig.linkData[link];
                            }
                        });
                        break;
                    case "node":
                        delete mapConfig.nodeData[node];

                        // clean up links
                        Object.keys(mapConfig.linkData).forEach(link => {
                            if (link.includes(node + ":::") || link.includes(":::" + node)) {
                                delete mapConfig.linkData[link];
                            }
                        });
                        break;
                }
                break;
        }

        setParentState({ mapConfig }, ["saveMap"]);
        this.setState({ selectedNodeType: null, searchedEntities: [] });
    };

    handleOpen = () => this.setState({ open: true });
    handleClose = () => this.setState({ open: false });

    fetchEntities = async cursor => {
        let { selectedAccount, selectedDomain, searchedEntities } = this.state;
        // if no cursor its a new search so empty entities
        if (!cursor) {
            searchedEntities = [];
        }
        let accountSplit = selectedAccount.split(/: (.+)/);
        let nerdGraphResult = await nerdGraphQuery(
            entitySearchByAccountQuery(selectedDomain, accountSplit[0] == 0 ? null : accountSplit[0], cursor)
        );
        let entitySearchResults = (((nerdGraphResult || {}).actor || {}).entitySearch || {}).results || {};
        // let foundGuids = ((entitySearchResults || {}).entities || []).map((result)=>result.guid)

        searchedEntities = [...searchedEntities, ...entitySearchResults.entities];
        await this.setState({ searchedEntities });
        if (entitySearchResults.nextCursor) {
            console.log("collecting next entitySearch batch guid:", entitySearchResults.nextCursor);
            this.fetchEntities(entitySearchResults.nextCursor);
        } else {
            // console.log("complete", this.state.searchedEntities.length)
        }
        this.setState({ showSearchMsg: true });
    };

    handleItemClick = (e, { name }) => this.setState({ activeNodeItem: name });

    render() {
        let {
            open,
            selectedNodeType,
            customNodeName,
            selectedAccount,
            selectedDomain,
            searchedEntities,
            activeNodeItem,
            showSearchMsg
        } = this.state;
        let { accounts, mapConfig, dataFetcher, selectedMap, setParentState } = this.props;

        const options = [
            { key: "e", text: "Entity", value: "entity" },
            { key: "a", text: "Account", value: "account" },
            { key: "c", text: "Custom", value: "custom" }
        ];

        const domainOptions = [
            { key: "a", text: "APM", value: "APM" },
            { key: "b", text: "BROWSER", value: "BROWSER" },
            { key: "m", text: "MOBILE", value: "MOBILE" },
            { key: "i", text: "INFRA", value: "INFRA" },
            { key: "s", text: "SYNTH", value: "SYNTH" }
        ];

        let accountOptions = accounts.map(account => ({
            key: account.id,
            text: account.id + ": " + account.name,
            value: account.id + ": " + account.name
        }));

        accountOptions.sort((a, b) => {
            if (a.key < b.key) {
                return -1;
            }
            if (a.key > b.key) {
                return 1;
            }
            return 0;
        });

        accountOptions.unshift({
            key: "All Accounts",
            text: "0: All Accounts",
            value: "0: All Accounts"
        });

        let customNodeErrorContent = { content: "", pointing: "above" };
        let customNodeError = false;

        // needs handling for existing nodes
        if (selectedNodeType == "custom") {
            if (customNodeName.length == 0) {
                customNodeErrorContent.content = "Please enter a node name";
                customNodeError = true;
            }
        }

        let createDisabled =
            !selectedNodeType ||
            selectedNodeType == "entity" ||
            (selectedNodeType == "custom" && !customNodeName) ||
            (selectedNodeType == "account" && !selectedAccount);

        return (
            <Modal
                open={open}
                onClose={this.handleClose}
                size="large"
                trigger={
                    <Button
                        onClick={() => this.setState({ open: true })}
                        className="filter-button"
                        icon="block layout"
                        content="Nodes"
                        id="nodesbtn"
                    />
                }
                onUnmount={() => {
                    setParentState({ closeCharts: false });
                    this.setState({ showSearchMsg: false });
                }}
                onMount={() => setParentState({ closeCharts: true })}
            >
                <Menu size="huge" pointing secondary>
                    <Menu.Item name="Add Node" active={activeNodeItem === "Add Node"} onClick={this.handleItemClick} />
                    <Menu.Item
                        name="Delete Node"
                        active={activeNodeItem === "Delete Node"}
                        onClick={this.handleItemClick}
                    />
                </Menu>
                <Modal.Content style={{ display: activeNodeItem == "Add Node" ? "" : "none" }}>
                    <Form>
                        <Form.Field
                            control={Select}
                            label="Type"
                            options={options}
                            placeholder="Select Type..."
                            value={selectedNodeType}
                            onChange={(e, d) => this.setState({ selectedNodeType: d.value })}
                        />

                        {selectedNodeType === "entity" ? (
                            <>
                                {" "}
                                <Form.Group widths="16">
                                    <Form.Field
                                        width="5"
                                        control={Select}
                                        label="Domain"
                                        options={domainOptions}
                                        placeholder="Select Domain..."
                                        onChange={(e, d) => this.setState({ selectedDomain: d.value })}
                                    />
                                    <Form.Field
                                        width="8"
                                        control={Select}
                                        label="Account"
                                        options={accountOptions}
                                        placeholder="Select Account..."
                                        onChange={(e, d) => this.setState({ selectedAccount: d.value })}
                                    />
                                    <Form.Button
                                        disabled={!selectedAccount || !selectedDomain}
                                        label="&nbsp;"
                                        width="3"
                                        content="Fetch Entities"
                                        onClick={() => {
                                            this.fetchEntities();
                                        }}
                                    />
                                </Form.Group>
                                <div
                                    style={{
                                        overflowY: "scroll",
                                        height: "300px",
                                        display: searchedEntities.length == 0 && showSearchMsg ? "" : "none"
                                    }}
                                >
                                    No entities found with tags.accountId =
                                    {selectedAccount ? " " + selectedAccount.replace(":", " for") : ""}.
                                </div>
                                <div
                                    style={{
                                        overflowY: "scroll",
                                        height: "300px",
                                        display: searchedEntities.length == 0 ? "none" : ""
                                    }}
                                >
                                    <Table compact>
                                        <Table.Body>
                                            {searchedEntities.map((entity, i) => {
                                                let exists = mapConfig.nodeData[entity.name];
                                                return (
                                                    <Table.Row key={i}>
                                                        <Table.Cell>{entity.name}</Table.Cell>
                                                        <Table.Cell>
                                                            <Button
                                                                style={{ float: "right" }}
                                                                onClick={() =>
                                                                    this.action(
                                                                        exists ? "del" : "add",
                                                                        mapConfig,
                                                                        setParentState,
                                                                        entity
                                                                    )
                                                                }
                                                            >
                                                                {exists ? "Delete" : "Add"}
                                                            </Button>
                                                        </Table.Cell>
                                                    </Table.Row>
                                                );
                                            })}
                                        </Table.Body>
                                    </Table>
                                </div>
                            </>
                        ) : (
                            ""
                        )}

                        {selectedNodeType === "custom" ? (
                            <Form.Input
                                error={customNodeError ? customNodeErrorContent : false}
                                fluid
                                // label='First name'
                                value={customNodeName}
                                onChange={e => this.setState({ customNodeName: e.target.value })}
                                placeholder="Name..."
                            />
                        ) : (
                            ""
                        )}

                        {selectedNodeType === "account" ? (
                            <Form.Field
                                control={Select}
                                label="Account"
                                options={accountOptions}
                                placeholder="Select Account..."
                                onChange={(e, d) => this.setState({ selectedAccount: d.value })}
                            />
                        ) : (
                            ""
                        )}
                    </Form>
                </Modal.Content>
                <Modal.Content style={{ display: activeNodeItem == "Delete Node" ? "" : "none" }}>
                    <DeleteNode
                        mapConfig={mapConfig}
                        action={this.action}
                        dataFetcher={dataFetcher}
                        selectedMap={selectedMap}
                        setParentState={setParentState}
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        disabled={createDisabled}
                        positive
                        onClick={() => this.action("add", mapConfig, setParentState)}
                    >
                        Create
                    </Button>
                    <Button style={{ float: "left" }} negative onClick={this.handleClose}>
                        Close
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}
