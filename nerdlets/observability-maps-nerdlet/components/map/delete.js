import React from "react";
import { Modal, Button, Form, Header, Radio } from "semantic-ui-react";
import { deleteAccountDocument, deleteUserDocument } from "../../lib/utils";

export default class DeleteMap extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = { open: false };
        this.save = this.save.bind(this);
    }

    save = (map, dataFetcher, handleMapMenuChange) => {
        this.setState({ open: false });
        switch (map.type) {
            case "account":
                deleteAccountDocument("ObservabilityMaps", map.value);
                // dataFetcher(["accountMaps"])
                // handleMapMenuChange(null)
                break;
            case "user":
                deleteUserDocument("ObservabilityMaps", map.value);
                dataFetcher(["userMaps"]);
                handleMapMenuChange(null);
                break;
        }
    };

    close = () => this.setState({ open: false });

    render() {
        let { open } = this.state;
        let { selectedMap, dataFetcher, handleMapMenuChange, setParentState } = this.props;
        return (
            <Modal
                onUnmount={() => setParentState({ closeCharts: false })}
                onMount={() => setParentState({ closeCharts: true })}
                open={open}
                size="tiny"
                trigger={
                    <Button
                        color="red"
                        onClick={() => this.setState({ open: true })}
                        icon="close"
                        content="Delete"
                        className="filter-button-clear"
                    />
                }
            >
                <Modal.Header>Delete Map</Modal.Header>
                <Modal.Content>Are you sure you want to delete "{selectedMap.label}" map?</Modal.Content>
                <Modal.Actions>
                    <Button style={{ float: "left" }} positive onClick={this.close}>
                        Don't Delete
                    </Button>

                    <Button negative onClick={() => this.save(selectedMap, dataFetcher, handleMapMenuChange)}>
                        Delete!
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}
