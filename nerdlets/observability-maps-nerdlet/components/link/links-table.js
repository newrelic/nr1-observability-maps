/* eslint react/prop-types: 0 */
import React from "react";
import { Table, Button } from "semantic-ui-react";

export default class LinksTable extends React.PureComponent {
    renderRows(links, selectedSource, mapConfig, manageLink, setParentState) {
        links = links.filter(link => link.includes(selectedSource));
        return links.map(link => {
            let st = link.split(/:::(.+)/);

            return (
                <Table.Row key={link}>
                    <Table.Cell>
                        {st[0]} > {st[1]}
                    </Table.Cell>
                    <Table.Cell>
                        <Button
                            onClick={() =>
                                manageLink("del", mapConfig, setParentState, st[0], st[1])
                            }
                            negative
                            style={{ float: "right" }}
                        >
                            Delete
                        </Button>
                    </Table.Cell>
                </Table.Row>
            );
        });
    }

    render() {
        const { mapConfig, selectedSource, manageLink, setParentState } = this.props;
        const links = Object.keys((mapConfig || {}).linkData || []).map(link => link);

        return (
            <Table compact basic>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell width={2}>
                            Current links for {selectedSource}
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {this.renderRows(links, selectedSource, mapConfig, manageLink, setParentState)}
                </Table.Body>
            </Table>
        );
    }
}
