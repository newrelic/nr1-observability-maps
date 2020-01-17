import React from "react";
import { Button, Modal, Header, Form, Select, Divider, Icon } from "semantic-ui-react";

export default class EditLink extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isSaving: false,
            selectedEditOption: "hoverMetrics",
            selectedHoverOption: null,
            loaded: "",
            hm_1_NRQL: "",
            hm_2_NRQL: "",
            hm_3_NRQL: "",
            hm_1_ACC: "",
            hm_2_ACC: "",
            hm_3_ACC: "",
            mc_1_NRQL: "",
            mc_1_ACC: "",
            mc_1_TYPE: ""
        };
        this.saveNrql = this.saveNrql.bind(this);
    }

    async saveNrql(setParentState, mapConfig, linkId, val) {
        await this.setState({ isSaving: true });
        let { selectedEditOption, hm_1_NRQL, hm_2_NRQL, hm_3_NRQL, hm_1_ACC, hm_2_ACC, hm_3_ACC } = this.state;

        if (selectedEditOption == "hoverMetrics") {
            mapConfig.linkData[linkId].hoverMetrics = {
                1: { nrql: hm_1_NRQL, accountId: hm_1_ACC },
                2: { nrql: hm_2_NRQL, accountId: hm_2_ACC },
                3: { nrql: hm_3_NRQL, accountId: hm_3_ACC }
            };
        }

        await setParentState({ mapConfig }, ["saveMap"]);
        await this.setState({ isSaving: false });
    }

    componentDidUpdate() {
        let { mapConfig, selectedLink } = this.props;
        let { loaded } = this.state;

        if (mapConfig && mapConfig.linkData && mapConfig.linkData[selectedLink]) {
            if (loaded != selectedLink) {
                this.setState({
                    loaded: selectedLink,
                    hm_1_NRQL: "",
                    hm_2_NRQL: "",
                    hm_3_NRQL: "",
                    hm_1_ACC: "",
                    hm_2_ACC: "",
                    hm_3_ACC: "",
                    mc_1_NRQL: "",
                    mc_1_ACC: "",
                    mc_1_TYPE: ""
                });
                if (mapConfig.linkData[selectedLink].hoverMetrics) {
                    this.setState({
                        hm_1_NRQL: mapConfig.linkData[selectedLink].hoverMetrics[1].nrql,
                        hm_2_NRQL: mapConfig.linkData[selectedLink].hoverMetrics[2].nrql,
                        hm_3_NRQL: mapConfig.linkData[selectedLink].hoverMetrics[3].nrql,
                        hm_1_ACC: mapConfig.linkData[selectedLink].hoverMetrics[1].accountId,
                        hm_2_ACC: mapConfig.linkData[selectedLink].hoverMetrics[2].accountId,
                        hm_3_ACC: mapConfig.linkData[selectedLink].hoverMetrics[3].accountId
                    });
                }
            }
        }
    }

    render() {
        let { mapConfig, setParentState, editLinkOpen, selectedLink, accounts } = this.props;
        let { selectedEditOption, selectedHoverOption } = this.state;

        const hoverOptions = [
            { key: "d", text: "Default", value: "default" },
            { key: "c", text: "Custom NRQL", value: "customNrql" }
        ];

        const updateHoverType = value => {
            this.setState({ selectedHoverOption: value });
            mapConfig.linkData[selectedLink].hoverType = value;
            setParentState({ mapConfig }, ["saveMap"]);
        };

        let hoverOption =
            mapConfig && mapConfig.linkData[selectedLink]
                ? mapConfig.linkData[selectedLink].hoverType
                : selectedHoverOption;

        const onEditDropDown = () => {
            setParentState({ editLinkOpen: false });
        };

        const renderCustomNrql = () => {
            let accountOptions = accounts.map(acc => ({
                key: acc.id,
                value: acc.id,
                text: acc.name
            }));
            return (
                <>
                    <Header as="h4">Set up to 3 NRQL custom queries</Header>
                    <Header as="h5">Tip: Validate your queries in the chart builder.</Header>

                    {[1, 2, 3].map((metric, i) => {
                        return (
                            <Form.Group widths={16} key={i}>
                                <Form.Input
                                    width={12}
                                    fluid
                                    label={`Query ${i + 1}`}
                                    placeholder={`SELECT average(duration) as 'ms' from Transaction`}
                                    value={this.state[`hm_${i + 1}_NRQL`]}
                                    onChange={(e, d) => this.setState({ [`hm_${i + 1}_NRQL`]: e.target.value })}
                                />
                                <Form.Select
                                    width={4}
                                    label="Account"
                                    value={this.state[`hm_${i + 1}_ACC`]}
                                    options={accountOptions}
                                    onChange={(e, d) => this.setState({ [`hm_${i + 1}_ACC`]: d.value })}
                                />
                            </Form.Group>
                        );
                    })}

                    <Button
                        positive
                        style={{ float: "right" }}
                        onClick={() => this.saveNrql(setParentState, mapConfig, selectedLink)}
                    >
                        <Icon
                            name="spinner"
                            loading
                            style={{ backgroundColor: "transparent", display: this.state.isSaving ? "" : "none" }}
                        />
                        Save
                    </Button>
                    <br />
                </>
            );
        };

        return (
            <Modal
                size="large"
                open={editLinkOpen}
                onUnmount={() => setParentState({ closeCharts: false })}
                onMount={() => setParentState({ closeCharts: true })}
            >
                <Modal.Header>Edit Link - {selectedLink}</Modal.Header>

                <Modal.Content>
                    <Form>
                        <Form.Group>
                            {selectedEditOption == "hoverMetrics" ? (
                                <Form.Field
                                    label="Type"
                                    control={Select}
                                    options={hoverOptions}
                                    placeholder="Select Option"
                                    value={hoverOption}
                                    onChange={(e, d) => updateHoverType(d.value)}
                                />
                            ) : (
                                ""
                            )}
                        </Form.Group>

                        {selectedEditOption == "hoverMetrics" && hoverOption == "customNrql" ? renderCustomNrql() : ""}
                    </Form>
                </Modal.Content>

                <Modal.Actions>
                    <Button negative onClick={onEditDropDown}>
                        Close
                    </Button>
                    {/* <Button positive onClick={()=>this.save(setParentState, mapConfig)}>Save</Button> */}
                </Modal.Actions>
            </Modal>
        );
    }
}
