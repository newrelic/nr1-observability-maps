import React from "react";
import { Modal, Button, Input, TextArea, Label } from "semantic-ui-react";
import { writeUserDocument } from "../../lib/utils";

function isValidJson(json) {
    try {
        JSON.parse(json);
        return true;
    } catch (e) {
        return false;
    }
}

export default class ImportMap extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            mapImport: "Paste map config here!",
            mapName: ""
        };
        this.saveMap = this.saveMap.bind(this);
    }

    async saveMap() {
        let { mapName, mapImport } = this.state;
        await writeUserDocument("ObservabilityMaps", mapName, mapImport);
        this.props.dataFetcher(["userMaps"]);
        this.setState({ mapImport: "", mapName: "" });
    }

    render() {
        let { mapImport, mapName } = this.state;
        let { setParentState } = this.props;

        return (
            <Modal
                size="large"
                onUnmount={() => setParentState({ closeCharts: false })}
                onMount={() => setParentState({ closeCharts: true })}
                trigger={<Button icon="download" content="Import" className="filter-button" />}
            >
                <Modal.Header>Import Map</Modal.Header>
                <Modal.Content>
                    <Input
                        placeholder="Enter Map Name..."
                        value={mapName}
                        onChange={e => this.setState({ mapName: e.target.value })}
                        style={{ width: "100%" }}
                    />
                    <Label style={{ display: mapName == "" ? "" : "none" }} color="red" pointing>
                        Please enter a map name
                    </Label>
                    <br />
                    <br />
                    <TextArea
                        name="importMapConfig"
                        style={{ width: "100%", height: "500px" }}
                        value={mapImport}
                        onChange={e => this.setState({ mapImport: e.target.value })}
                        className="txtarea"
                    />
                    <Label style={{ display: isValidJson(mapImport) ? "none" : "" }} color="red" pointing>
                        Please enter valid json map configuration
                    </Label>
                    <br />
                    <br />
                    <Button
                        icon="download"
                        disabled={isValidJson(mapImport) == false || mapName == ""}
                        positive
                        content="Save Map"
                        style={{ float: "right" }}
                        onClick={() => this.saveMap()}
                    />
                    <br /> <br />
                </Modal.Content>
            </Modal>
        );
    }
}
