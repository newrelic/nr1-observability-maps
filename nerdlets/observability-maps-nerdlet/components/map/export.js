import React from "react";
import { Modal, Button, Popup } from "semantic-ui-react";

export default class ExportMap extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            exportOpen: false
        };
    }

    handleOpen = () => this.setState({ exportOpen: true });
    handleClose = () => this.setState({ exportOpen: false });

    render() {
        let { exportOpen } = this.state;
        let { mapConfig, selectedMap, setParentState, userMaps } = this.props;
        return (
            <Modal
                size="large"
                open={exportOpen}
                onClose={this.handleClose}
                onUnmount={() => setParentState({ closeCharts: false })}
                onMount={() => setParentState({ closeCharts: true })}
                trigger={
                    <Popup
                        content="Export"
                        trigger={
                            <Button
                                onClick={this.handleOpen}
                                icon="download"
                                style={{ height: "45px" }}
                                className="filter-button"
                            />
                        }
                    />
                }
            >
                <Modal.Header>Export Map - {selectedMap.label}</Modal.Header>
                <Modal.Content>
                    <textarea
                        readOnly
                        name="exportMapConfig"
                        style={{ width: "100%", height: "500px" }}
                        value={JSON.stringify(mapConfig, null, 2)}
                    />
                </Modal.Content>
            </Modal>
        );
    }
}
