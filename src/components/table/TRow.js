import React, {Component} from "react";
import {Button, Icon, Table} from "semantic-ui-react";
import Edit from "../modal/Edit";
import * as Constants from "../../constants/Constants";
import Confirm from "../modal/Confirm";

/**
 * EvaluationRule page table row.
 */
class TRow extends Component {

    render() {
        const {
            currentState, provided, snapshot,
            rule, handleOpen, handleEasyDelete, handleHardDelete,
            priority, handleSave, isDragDisabled, isLoading
        } = this.props;

        const getItemStyle = (isDragging, draggableStyle) => ({
            "backgroundImage": isDragging && "linear-gradient(90deg, silver 50%, transparent 50%), linear-gradient(90deg, silver 50%, transparent 50%), linear-gradient(0deg, silver 50%, transparent 50%), linear-gradient(0deg, silver 50%, transparent 50%)",
            "backgroundRepeat": isDragging && "repeat-x, repeat-x, repeat-y, repeat-y",
            "backgroundSize": isDragging && "15px 2px, 15px 2px, 2px 15px, 2px 15px",
            "backgroundPosition": isDragging && "left top, right bottom, left bottom, right top",
            animation: isDragging && "border-dance 1s infinite linear",
            ...draggableStyle
        })

        const open = rule.resultType === Constants.ResultType.EVALUATE && isDragDisabled;

        const defaultRow = () => (
            <Table.Row
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={getItemStyle(
                    snapshot.isDragging,
                    provided.draggableProps.style
                )}
                key={rule.id}
            >
                <Table.Cell textAlign="center">{rule.priority}</Table.Cell>
                <Table.Cell textAlign="center">{rule.originType}</Table.Cell>
                <Table.Cell
                    textAlign="center"
                >
                    {rule.componentSourceAddress}
                </Table.Cell>
                <Table.Cell textAlign="center">
                    {
                        rule.isEaton ?
                            <Icon color='green' name='checkmark' size='large'/> :
                            <Icon color='red' name='close' size='large'/>
                    }
                </Table.Cell>
                <Table.Cell
                    textAlign="center"
                >
                    {Constants.productFamilyIdToString(rule.productFamilyId)}
                </Table.Cell>
                <Table.Cell
                    textAlign="center"
                >
                    {rule.productCode}
                </Table.Cell>
                <Table.Cell textAlign="center">{Constants.resultTypeToString(rule.resultType)}</Table.Cell>
                <Table.Cell
                    textAlign="center"
                >
                    {rule.resultKey}
                </Table.Cell>
                <Table.Cell textAlign={"center"} disabled={isLoading}>
                    <Button.Group>
                        <Edit
                            currentState={currentState}
                            rule={rule}
                            handleSave={handleSave}
                            isDragDisabled={isDragDisabled}
                            forceUpdate={this.forceUpdate.bind(this)}
                        />
                        {
                            open && <Button
                                icon={"folder open"}
                                color={"black"}
                                onClick={handleOpen(rule)}
                            />
                        }
                        {
                            isDragDisabled ?
                                <Confirm
                                    icon={"trash alternate"}
                                    title={"Delete"}
                                    body={"Would you like to delete this rule?"}
                                    negative={true}
                                    handleConfirm={handleHardDelete(rule)}
                                />
                                :
                                <Button
                                    onClick={handleEasyDelete(rule)}
                                    negative icon={"delete"}
                                />
                        }
                    </Button.Group>
                </Table.Cell>
            </Table.Row>
        )

        const singleRow = () => (
            <Table.Row
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={getItemStyle(
                    snapshot.isDragging,
                    provided.draggableProps.style
                )}
                key={rule.id}
            >
                <Table.Cell textAlign="center">{rule.priority}</Table.Cell>
                <Table.Cell
                    textAlign="center"
                >
                    {rule.faultSourceAddress}
                </Table.Cell>
                <Table.Cell
                    textAlign="center"
                >
                    {rule.faultCode}
                </Table.Cell>
                <Table.Cell
                    textAlign="center"
                >
                    {rule.spn}
                </Table.Cell>
                <Table.Cell
                    textAlign="center"
                >
                    {rule.fmi}
                </Table.Cell>
                <Table.Cell textAlign="center">{
                    rule.isActive ?
                        <Icon color='green' name='checkmark' size='large'/> :
                        <Icon color='red' name='close' size='large'/>
                }
                </Table.Cell>
                <Table.Cell textAlign="center">{Constants.resultTypeToString(rule.resultType)}</Table.Cell>
                <Table.Cell
                    textAlign="center"
                >
                    {rule.resultKey}
                </Table.Cell>
                <Table.Cell textAlign={"center"} disabled={isLoading}>
                    <Button.Group>
                        <Edit
                            rule={rule}
                            currentState={currentState}
                            handleSave={handleSave}
                            isDragDisabled={isDragDisabled}
                            forceUpdate={this.forceUpdate.bind(this)}
                        />
                        {
                            open && <Button
                                icon={"folder open"}
                                color={"black"}
                                onClick={handleOpen(rule)}
                            />
                        }
                        {
                            isDragDisabled ?
                                <Confirm
                                    icon={"trash alternate"}
                                    title={"Delete"}
                                    body={"Would you like to delete this rule?"}
                                    negative={true}
                                    handleConfirm={handleHardDelete(rule)}
                                />
                                :
                                <Button
                                    onClick={handleEasyDelete(rule)}
                                    negative icon={"delete"}
                                />
                        }
                    </Button.Group>
                </Table.Cell>
            </Table.Row>
        )

        const multipleRow = () => (
            <Table.Row
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={getItemStyle(
                    snapshot.isDragging,
                    provided.draggableProps.style
                )}
                key={rule.id}
            >
                <Table.Cell textAlign="center">{rule.priority}</Table.Cell>
                <Table.Cell textAlign="center">{rule.resultKey}</Table.Cell>
                <Table.Cell textAlign="center">
                    <Button.Group>
                        <Edit
                            rule={rule}
                            currentState={currentState}
                            handleSave={handleSave}
                            isDragDisabled={isDragDisabled}
                            isLoading={isLoading}
                            forceUpdate={this.forceUpdate.bind(this)}
                        />
                        <Button
                            icon={"folder open"}
                            color={"black"}
                            onClick={handleOpen(rule)}
                        />
                        {
                            isDragDisabled ?
                                <Confirm
                                    icon={"trash alternate"}
                                    title={"Delete"}
                                    body={"Would you like to delete this rule?"}
                                    negative={true}
                                    handleConfirm={handleHardDelete(rule)}
                                />
                                :
                                <Button
                                    onClick={handleEasyDelete(rule)}
                                    negative
                                    disabled={isLoading}
                                    icon={"delete"}
                                />
                        }
                    </Button.Group>
                </Table.Cell>
            </Table.Row>
        )

        const openRow = () => (
            <Table.Row
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={getItemStyle(
                    snapshot.isDragging,
                    provided.draggableProps.style
                )}
                key={rule.id}
            >
                <Table.Cell textAlign="center">{priority.toString() + "." + rule.priority}</Table.Cell>
                <Table.Cell
                    textAlign="center"
                >
                    {Constants.isGroupStartChar.test(rule.prefix) ? "" : rule.prefix.toUpperCase()}
                </Table.Cell>
                <Table.Cell
                    textAlign="center"
                >
                    {rule.faultSourceAddress}
                </Table.Cell>
                <Table.Cell
                    textAlign="center"
                >
                    {rule.faultCode}
                </Table.Cell>
                <Table.Cell
                    textAlign="center"
                >
                    {rule.spn}
                </Table.Cell>
                <Table.Cell
                    textAlign="center"
                >
                    {rule.fmi}
                </Table.Cell>
                <Table.Cell textAlign="center">{
                    rule.isActive ?
                        <Icon color='green' name='checkmark' size='large'/> :
                        <Icon color='red' name='close' size='large'/>
                }
                </Table.Cell>
                {
                    !isDragDisabled &&
                    <Table.Cell textAlign={"center"} disabled={isLoading}>
                        <Button.Group>
                            <Edit
                                isDragDisabled={isDragDisabled}
                                forceUpdate={this.forceUpdate.bind(this)}
                                currentState={currentState}
                                rule={rule}
                            />
                            <Button
                                icon={"trash alternate"}
                                negative
                                onClick={handleEasyDelete(rule)}
                            />
                        </Button.Group>
                    </Table.Cell>
                }
            </Table.Row>
        )


        switch (currentState) {
            case Constants.State.EMPTY:
                return defaultRow();
            case Constants.State.ROOT:
                return defaultRow();
            case Constants.State.SINGLE:
                return singleRow();
            case Constants.State.MULTIPLE:
                return multipleRow();
            case Constants.State.OPEN:
                return openRow();
            default:
                return <div/>;
        }
    }
}

export default TRow;