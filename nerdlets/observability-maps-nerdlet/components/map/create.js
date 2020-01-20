import React from "react";
import { Modal, Button, Form, Header, Radio } from "semantic-ui-react";
import { writeUserDocument, writeAccountDocument } from "../../lib/utils";

export default class CreateMap extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            mapName: "",
            storeLocation: "user",
            open: false
        };
        this.save = this.save.bind(this);
    }

    save = async (dataFetcher, handleMapMenuChange) => {
        let { mapName, storeLocation } = this.state;
        this.setState({ open: false });
        let payload = {
            nodeData: {},
            linkData: {}
        };

        switch (storeLocation) {
            case "account":
                // writeAccountDocument("ObservabilityMaps", mapName, payload)
                dataFetcher(["accountMaps"]);
                break;
            case "user":
                await writeUserDocument("ObservabilityMaps", mapName, payload);
                await dataFetcher(["userMaps"]);
                handleMapMenuChange(mapName);
                break;
        }
        this.setState({ mapName: "" });
    };

    close = () => this.setState({ open: false });

    render() {
        let { mapName, storeLocation, open } = this.state;
        let { dataFetcher, handleMapMenuChange, userMaps, accountMaps, setParentState } = this.props;
        userMaps = userMaps || [];
        accountMaps = accountMaps || [];
        let mapNameError = false;
        let mapNameErrorContent = { content: "", pointing: "above" };
        let existingMap = [...userMaps, ...accountMaps].filter(map => map.value == mapName);
        if (existingMap.length > 0) {
            mapNameErrorContent.content = "This map name already exists";
            mapNameError = true;
        } else if (mapName.length == 0) {
            mapNameErrorContent.content = "Please enter a map name";
            mapNameError = true;
        } else {
            mapNameError = false;
        }

        return (
            <Modal
                open={open}
                onUnmount={() => setParentState({ closeCharts: false })}
                onMount={() => setParentState({ closeCharts: true })}
                size="tiny"
                trigger={
                    <Button
                        onClick={() => this.setState({ open: true })}
                        className="filter-button"
                        icon="add"
                        content="Create"
                    />
                }
            >
                <Modal.Header>Create Map</Modal.Header>
                <Modal.Content>
                    <Header>Name</Header>
                    <Form>
                        <Form.Input
                            error={mapNameError ? mapNameErrorContent : false}
                            fluid
                            // label='First name'
                            value={mapName}
                            onChange={e => this.setState({ mapName: e.target.value })}
                            placeholder="Name..."
                        />
                        {/* <Form.Field>
                            <input placeholder='Name...' value={mapName} onChange={(e)=>this.setState({mapName:e.target.value})} />
                        </Form.Field> */}

                        <Header>Save Location</Header>
                        <Form.Group inline>
                            {/* <Form.Field
                                control={Radio}
                                label='Account (public)'
                                value='account'
                                checked={storeLocation === 'account'}
                                onChange={()=>this.setState({storeLocation:'account'})}
                            /> */}
                            <Form.Field
                                control={Radio}
                                label="User (private)"
                                value="user"
                                checked={storeLocation === "user"}
                                onChange={() => this.setState({ storeLocation: "user" })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        disabled={mapNameError}
                        positive
                        onClick={() => this.save(dataFetcher, handleMapMenuChange)}
                    >
                        Create
                    </Button>
                    <Button style={{ float: "left" }} negative onClick={this.close}>
                        Close
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}
