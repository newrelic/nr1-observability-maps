import React from "react";
import { Modal, Button, Form } from "semantic-ui-react";
import { writeUserDocument } from "../../lib/utils";

export default class MapSettings extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            settingsOpen: false,
            value: "",
            backgroundColor: "",
            backgroundImage: "",
            backgroundPosition: "",
            backgroundRepeat: "",
            backgroundSize: "",
            selectedMapName: ""
        };
    }

    handleOpen = () => this.setState({ settingsOpen: true });
    handleClose = () => this.setState({ settingsOpen: false });
    handleChange = (e, { value }, formType) => this.setState({ [formType]: value });

    handleSave = async () => {
        let {
            backgroundColor,
            backgroundImage,
            backgroundPosition,
            backgroundRepeat,
            backgroundSize,
            selectedMapName
        } = this.state;
        let { mapConfig, dataFetcher } = this.props;
        let settings = {};

        if (backgroundColor) settings.backgroundColor = backgroundColor;
        if (backgroundImage) {
            if (!backgroundImage.includes(`url("`)) {
                backgroundImage = `url("${backgroundImage}")`;
            }
            settings.backgroundImage = backgroundImage;
        }
        if (backgroundPosition) settings.backgroundPosition = backgroundPosition;
        if (backgroundRepeat) settings.backgroundRepeat = backgroundRepeat;
        if (backgroundSize) settings.backgroundSize = backgroundSize;

        mapConfig.settings = settings;

        await writeUserDocument("ObservabilityMaps", selectedMapName, mapConfig);
        await dataFetcher(["userMaps"]);
    };

    componentDidUpdate() {
        if (this.props.selectedMap && this.props.selectedMap.value) {
            let { selectedMapName } = this.state;
            if (selectedMapName != this.props.selectedMap.value) {
                this.setState({ selectedMapName: this.props.selectedMap.value });
                // check if map settings were available
                let { mapConfig } = this.props;
                if (mapConfig.settings) {
                    let {
                        backgroundColor,
                        backgroundImage,
                        backgroundPosition,
                        backgroundRepeat,
                        backgroundSize
                    } = mapConfig.settings;
                    this.setState({
                        backgroundColor,
                        backgroundImage,
                        backgroundPosition,
                        backgroundRepeat,
                        backgroundSize
                    });
                }
            }
        }
    }

    render() {
        let {
            settingsOpen,
            backgroundColor,
            backgroundImage,
            backgroundPosition,
            backgroundRepeat,
            backgroundSize
        } = this.state;
        let { mapConfig, selectedMap, setParentState, userMaps } = this.props;
        return (
            <Modal
                size="large"
                open={settingsOpen}
                onClose={this.handleClose}
                onUnmount={() => setParentState({ closeCharts: false })}
                onMount={() => setParentState({ closeCharts: true })}
                trigger={
                    <Button
                        onClick={this.handleOpen}
                        icon="images outline"
                        content="Settings"
                        style={{ height: "45px" }}
                        className="filter-button"
                    />
                }
            >
                <Modal.Header>Map Settings</Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Group widths="16">
                            <Form.Input
                                onChange={(e, d) => this.handleChange(e, d, "backgroundColor")}
                                value={backgroundColor || ""}
                                width="8"
                                fluid
                                label="Background Color"
                                placeholder="#000000"
                            />
                            <Form.Input
                                onChange={(e, d) => this.handleChange(e, d, "backgroundImage")}
                                width="8"
                                fluid
                                value={backgroundImage || ""}
                                label="Background Image"
                                placeholder={`url("https://someimage.com/image.jpg")`}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Input
                                onChange={(e, d) => this.handleChange(e, d, "backgroundRepeat")}
                                value={backgroundRepeat || ""}
                                width="8"
                                fluid
                                label="Background Repeat"
                                placeholder="repeat"
                            />
                            <Form.Input
                                onChange={(e, d) => this.handleChange(e, d, "backgroundPosition")}
                                value={backgroundPosition || ""}
                                width="8"
                                fluid
                                label="Background Position"
                                placeholder="center"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Input
                                onChange={(e, d) => this.handleChange(e, d, "backgroundSize")}
                                value={backgroundSize || ""}
                                width="8"
                                fluid
                                label="Background Size"
                                placeholder="auto"
                            />
                        </Form.Group>
                        <Form.Button onClick={this.handleSave}>Update</Form.Button>
                    </Form>
                </Modal.Content>
            </Modal>
        );
    }
}
