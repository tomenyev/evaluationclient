import React, {Component} from 'react';
import {Button, Form, Icon, Message, Modal, Segment, Table} from "semantic-ui-react";
import Validator from "../../Validator";

/**
 * Fault template.
 * @type {Readonly<{spn: string, faultCode: null, fmi: null, faultSourceAddress: null, id: null, isActive: boolean}>}
 */
const FAULT_TEMPLATE = Object.freeze({
    id: null,
    faultSourceAddress: null,
    faultCode: null,
    spn: "",
    fmi: null,
    isActive: true,
});

/**
 * Fault keys to validate.
 * @type {string[]}
 */
const KEYS_TO_VALIDATE = Object.freeze([
    "faultSourceAddress",
    "faultCode",
    "spn",
    "fmi"
])

class Faults extends Component {

    constructor(props) {
        super(props);
        this.state = {
            errors: {
                error: null,
                faultSourceAddress: null,
                faultCode: null,
                spn: null,
                fmi: null,
            },
            open: false,
            fault: {}
        }
        this.handleAdd = this.handleAdd.bind(this);
        this.handleEasyDelete = this.handleEasyDelete.bind(this);

        this.handleClose = this.handleClose.bind(this);
        this.handleOpen = this.handleOpen.bind(this);

        this.handleConfirm = this.handleConfirm.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSlider = this.handleSlider.bind(this);
    }

    /**
     * Delete fault from the list.
     * @param fault
     * @returns {function(*): void}
     */
    handleEasyDelete = fault => e => {
        e.preventDefault();
        const {faults, setFaults} = this.props;
        faults.splice(fault.id, 1)
        faults.forEach((fault, index) => {
            fault.id = index;
        })
        setFaults(faults);
    }

    /**
     * Add fault to the list.
     * @param e
     */
    handleAdd = (e) => {
        e.preventDefault();
        const {faults, setFaults} = this.props;
        faults.unshift(Object.assign({}, FAULT_TEMPLATE))
        faults.forEach((fault, index) => {
            fault.id = index;
        })
        setFaults(faults);
    }

    /**
     * Handle confirm and save changes.
     * @param e
     */
    handleConfirm = (e) => {
        e.preventDefault();
        const {fault} = this.state;
        const {faults, setFaults} = this.props;
        Object.keys(fault).forEach(key => {
            faults[fault.id][key] = fault[key];
        })
        setFaults(faults);
        this.handleClose();
    }

    /**
     * Reset current state and close modal.
     */
    handleClose = () => {
        this.setState({
            errors: {
                error: null,
                faultSourceAddress: null,
                faultCode: null,
                spn: null,
                fmi: null,
            },
            open: false,
            fault: {}
        })
    }

    /**
     * Open modal and validate fault.
     * @param fault
     * @returns {function(*): void}
     */
    handleOpen = (fault) => e => {
        e.preventDefault();
        const {errors} = this.state;
        const validators = Validator.getValidators();
        KEYS_TO_VALIDATE.forEach(key => {
            errors[key] = validators[key](fault[key]);
        })
        errors.error = Validator.validateSarFault(fault);
        this.setState({
            open: true,
            fault: Object.assign({}, fault),
            errors: errors
        });
    }

    /**
     * Handle changes. Validate and save fault.
     * @param event
     */
    handleChange = (event) => {
        const {fault, errors} = this.state;
        const value = event.target.value === "" ? null : event.target.value;
        const key = event.target.name
        fault[key] = value;
        const validators = Validator.getValidators();
        KEYS_TO_VALIDATE.forEach(key => {
            errors[key] = validators[key](fault[key]);
        })
        errors.error = Validator.validateSarFault(fault);
        this.setState({fault: fault});
    }

    handleSlider = (event, data) => {
        const {fault} = this.state;
        fault[data.name] = data.checked;
        this.setState({fault: fault})
    }


    render() {
        const {faults} = this.props;
        const {open, errors, fault: copy} = this.state;
        const {error, faultSourceAddress, faultCode, spn, fmi} = errors;

        const disabledSave =
            Boolean(Object.keys(errors).find(key => Boolean(errors[key])));

        const Edit = (fault) => (
            <Modal
                size={"small"}
                closeIcon
                onClose={this.handleClose}
                onOpen={this.handleOpen(fault)}
                open={open}
                trigger={<Button icon={"edit"}/>}
            >
                <Modal.Header>
                    Edit
                </Modal.Header>
                <Modal.Content>
                    <Form error>
                        <Message
                            error
                            header={"Error"}
                            content={error}
                            hidden={!Boolean(error)}
                        />
                        <Form.Group widths={"equal"}>
                            <Form.Field error={Boolean(faultSourceAddress) || Boolean(error)}>
                                <label>Source Address</label>
                                <Form.Input
                                    error={faultSourceAddress}
                                    defaultValue={copy.faultSourceAddress}
                                    name={"faultSourceAddress"}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field error={Boolean(faultCode)}>
                                <label>Fault Code</label>
                                <Form.Input
                                    error={faultCode}
                                    defaultValue={copy.faultCode}
                                    name={"faultCode"}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form.Group>
                        <Form.Group widths={"equal"}>
                            <Form.Field error={Boolean(spn) || Boolean(error)}>
                                <label>SPN</label>
                                <Form.Input
                                    error={spn}
                                    defaultValue={copy.spn}
                                    name={"spn"}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field error={Boolean(fmi) || Boolean(error)}>
                                <label>FMI</label>
                                <Form.Input
                                    error={fmi}
                                    defaultValue={copy.fmi}
                                    name={"fmi"}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form.Group>
                        <Segment compact>
                            <Form.Checkbox
                                toggle
                                label='Active'
                                defaultChecked={Boolean(copy.isActive)}
                                name={"isActive"}
                                onChange={this.handleSlider}
                            />
                        </Segment>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        negative
                        icon={"delete"}
                        onClick={this.handleClose}
                    />
                    <Button
                        positive
                        icon={"check"}
                        disabled={disabledSave}
                        onClick={this.handleConfirm}
                    />
                </Modal.Actions>
            </Modal>
        )

        return (
            <Table celled stackable structured compact basic>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell textAlign={"center"}>
                            Source Address
                        </Table.HeaderCell>
                        <Table.HeaderCell textAlign={"center"}>
                            Fault Code
                        </Table.HeaderCell>
                        <Table.HeaderCell textAlign={"center"}>
                            SPN
                        </Table.HeaderCell>
                        <Table.HeaderCell textAlign={"center"}>
                            FMI
                        </Table.HeaderCell>
                        <Table.HeaderCell textAlign={"center"}>
                            Active
                        </Table.HeaderCell>
                        <Table.HeaderCell textAlign={"center"}>
                            <Button
                                icon="add"
                                secondary
                                onClick={this.handleAdd}
                            />
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {
                        faults.map((fault, idx) => {
                            return (
                                <Table.Row key={idx}>
                                    <Table.Cell textAlign={"center"}>
                                        {fault.faultSourceAddress}
                                    </Table.Cell>
                                    <Table.Cell textAlign={"center"}>
                                        {fault.faultCode}
                                    </Table.Cell>
                                    <Table.Cell textAlign={"center"}>
                                        {fault.spn}
                                    </Table.Cell>
                                    <Table.Cell textAlign={"center"}>
                                        {fault.fmi}
                                    </Table.Cell>
                                    <Table.Cell textAlign={"center"}>
                                        {
                                            Boolean(fault.isActive) ?
                                                <Icon color='green' name='check' size='large'/> :
                                                <Icon color='red' name='close' size='large'/>
                                        }
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Button.Group>
                                            {Edit(fault)}
                                            <Button
                                                negative
                                                icon={"delete"}
                                                onClick={this.handleEasyDelete(fault)}
                                            />
                                        </Button.Group>
                                    </Table.Cell>
                                </Table.Row>
                            )
                        })
                    }
                </Table.Body>
            </Table>
        )
    }
}

export default Faults;