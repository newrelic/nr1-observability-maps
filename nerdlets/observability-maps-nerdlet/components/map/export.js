import React from "react";
import { Modal, Button } from "semantic-ui-react";

export default class ExportMap extends React.PureComponent {
    render() {
        let { mapConfig, selectedMap, setParentState, userMaps } = this.props;
        return (
            <Modal
                size="large"
                onUnmount={() => setParentState({ closeCharts: false })}
                onMount={() => setParentState({ closeCharts: true })}
                trigger={<Button icon="upload" content="Export" className="filter-button" />}
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
