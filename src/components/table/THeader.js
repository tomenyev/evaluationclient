import React, {Component} from "react";
import {Table} from "semantic-ui-react";
import * as Constants from "../../constants/Constants";

/**
 * EvaluationRule Table header.
 */
class THeader extends Component {

    render() {
        const {currentState, isDragDisabled} = this.props;

        const defaultHeader = () => (
            <Table.Header>
                <Table.Row>
                </Table.Row>
                <Table.Row>
                    <Table.HeaderCell colSpan='1' textAlign="center"/>
                    <Table.HeaderCell colSpan='1' textAlign="center">Logic</Table.HeaderCell>
                    <Table.HeaderCell colSpan='4' textAlign="center">Component</Table.HeaderCell>
                    <Table.HeaderCell colSpan='2' textAlign="center">Result</Table.HeaderCell>
                    <Table.HeaderCell colSpan='1' textAlign="center"/>
                </Table.Row>
                <Table.Row>
                    <Table.HeaderCell rowSpan='1' textAlign="center">Id</Table.HeaderCell>

                    <Table.HeaderCell rowSpan='1' textAlign="center">Origin Type</Table.HeaderCell>

                    <Table.HeaderCell rowSpan='1' textAlign="center">Source Address</Table.HeaderCell>
                    <Table.HeaderCell rowSpan='1' textAlign="center">Eaton</Table.HeaderCell>
                    <Table.HeaderCell rowSpan='1' textAlign="center">Product Family Id</Table.HeaderCell>
                    <Table.HeaderCell rowSpan='1' textAlign="center">Product Code</Table.HeaderCell>

                    <Table.HeaderCell rowSpan='1' textAlign="center">Type</Table.HeaderCell>
                    <Table.HeaderCell rowSpan='1' textAlign="center">Key</Table.HeaderCell>

                    <Table.HeaderCell rowSpan='1' textAlign="center">Action</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
        )

        const singleHeader = () => (
            <Table.Header>
                <Table.Row>
                </Table.Row>
                <Table.Row>
                    <Table.HeaderCell colSpan='1' textAlign="center"/>
                    <Table.HeaderCell colSpan='5' textAlign="center">Fault</Table.HeaderCell>
                    <Table.HeaderCell colSpan='2' textAlign="center">Result</Table.HeaderCell>
                    <Table.HeaderCell colSpan='1' textAlign="center"/>
                </Table.Row>
                <Table.Row>
                    <Table.HeaderCell rowSpan='1' textAlign="center">Id</Table.HeaderCell>

                    <Table.HeaderCell rowSpan='1' textAlign="center">Source Address</Table.HeaderCell>
                    <Table.HeaderCell rowSpan='1' textAlign="center">Fault Code</Table.HeaderCell>
                    <Table.HeaderCell rowSpan='1' textAlign="center">SPN</Table.HeaderCell>
                    <Table.HeaderCell rowSpan='1' textAlign="center">FMI</Table.HeaderCell>
                    <Table.HeaderCell rowSpan='1' textAlign="center">Active</Table.HeaderCell>

                    <Table.HeaderCell rowSpan='1' textAlign="center">Type</Table.HeaderCell>
                    <Table.HeaderCell rowSpan='1' textAlign="center">Key</Table.HeaderCell>

                    <Table.HeaderCell rowSpan='1' textAlign="center">Action</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
        )

        const multipleHeader = () => (
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell textAlign="center">Id</Table.HeaderCell>
                    <Table.HeaderCell textAlign="center">Result Key</Table.HeaderCell>
                    <Table.HeaderCell textAlign="center">Action</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
        );

        const openHeader = () => (
            <Table.Header>
                <Table.Row>
                </Table.Row>
                <Table.Row>
                    <Table.HeaderCell colSpan='1' textAlign="center"/>
                    <Table.HeaderCell colSpan='1' textAlign="center">Logic</Table.HeaderCell>
                    <Table.HeaderCell colSpan='5' textAlign="center">Fault</Table.HeaderCell>
                    {
                        !isDragDisabled &&
                        <Table.HeaderCell colSpan='1' textAlign="center"/>
                    }
                </Table.Row>
                <Table.Row>
                    <Table.HeaderCell rowSpan='1' textAlign="center">Id</Table.HeaderCell>

                    <Table.HeaderCell rowSpan='1' textAlign="center">Operand</Table.HeaderCell>

                    <Table.HeaderCell rowSpan='1' textAlign="center">Source Address</Table.HeaderCell>
                    <Table.HeaderCell rowSpan='1' textAlign="center">Fault Code</Table.HeaderCell>
                    <Table.HeaderCell rowSpan='1' textAlign="center">SPN</Table.HeaderCell>
                    <Table.HeaderCell rowSpan='1' textAlign="center">FMI</Table.HeaderCell>
                    <Table.HeaderCell rowSpan='1' textAlign="center">Active</Table.HeaderCell>

                    {
                        !isDragDisabled &&
                        <Table.HeaderCell rowSpan='1' textAlign="center">Action</Table.HeaderCell>
                    }
                </Table.Row>
            </Table.Header>
        )

        switch (currentState) {
            case Constants.State.EMPTY:
                return defaultHeader();
            case Constants.State.ROOT:
                return defaultHeader();
            case Constants.State.SINGLE:
                return singleHeader();
            case Constants.State.MULTIPLE:
                return multipleHeader();
            case Constants.State.OPEN:
                return openHeader();
            default:
                return <Table.Header/>;
        }
    }
}

export default THeader;