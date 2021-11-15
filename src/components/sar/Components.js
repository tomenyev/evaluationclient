import React, {Component} from 'react';
import {Button, Form, Icon, Message, Modal, Segment, Table} from "semantic-ui-react";
import * as Constants from "../../constants/Constants";
import Validator from "../../Validator";

/**
 * Component template.
 * @type {Readonly<{productFamilyId: null, productCode: null, componentSourceAddress: null, isEaton: boolean, id: null}>}
 */
const COMPONENT_TEMPLATE = Object.freeze({
    id: null,
    componentSourceAddress: null,
    isEaton: true,
    productFamilyId: null,
    productCode: null,
});

/**
 * Component keys to be validated.
 * @type {string[]}
 */
const KEYS_TO_VALIDATE = Object.freeze([
    "componentSourceAddress",
    "productFamilyId",
    "productCode"
])

class Components extends Component {

    constructor(props) {
        super(props);
        this.state = {
            component: {},
            errors: {
                error: null,
                componentSourceAddress: null,
                productFamilyId: null,
                productCode: null,
            },
            open: null
        }

        this.handleAdd = this.handleAdd.bind(this);
        this.handleEasyDelete = this.handleEasyDelete.bind(this);

        this.handleClose = this.handleClose.bind(this);
        this.handleOpen = this.handleOpen.bind(this);

        this.handleConfirm = this.handleConfirm.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSlider = this.handleSlider.bind(this);
        this.handleDropdown = this.handleDropdown.bind(this);
    }

    /**
     * Delete component from the list of components.
     * @param component to be deleted.
     * @returns {function(*): void}
     */
    handleEasyDelete = component => e => {
        e.preventDefault();
        const {components, setComponents} = this.props;
        components.splice(component.id, 1)
        components.forEach((component, index) => {
            component.id = index;
        })
        setComponents(components);
    }

    /**
     * Add new empty component.
     * @param e
     */
    handleAdd = (e) => {
        e.preventDefault();
        const {components, setComponents} = this.props;
        components.unshift(Object.assign({}, COMPONENT_TEMPLATE))
        components.forEach((component, index) => {
            component.id = index;
        })
        setComponents(components);
    }

    /**
     * Handle confirm. Save changes.
     * @param e
     */
    handleConfirm = (e) => {
        e.preventDefault();
        const {component} = this.state;
        const {components, setComponents} = this.props;
        Object.keys(component).forEach(key => {
            components[component.id][key] = component[key];
        })
        setComponents(components);
        this.handleClose();
    }

    /**
     * Reset current state and close modal.
     */
    handleClose = () => {
        this.setState({
            errors: {
                error: null,
                componentSourceAddress: null,
                productFamilyId: null,
                productCode: null,
            },
            open: false,
            component: {}
        })
    }

    /**
     * Open modal and validate component.
     * @param component
     * @returns {function(*): void}
     */
    handleOpen = (component) => e => {
        e.preventDefault();
        const {errors} = this.state;
        const validators = Validator.getValidators();
        KEYS_TO_VALIDATE.forEach(key => {
            errors[key] = validators[key](component[key]);
        })
        errors.error = Validator.validateSarComponent(component);
        this.setState({
            open: true,
            component: Object.assign({}, component),
            errors: errors
        });
    }

    /**
     * Handle changes. Validate and save component.
     * @param event
     */
    handleChange = (event) => {
        const {component, errors} = this.state;
        const value = event.target.value === "" ? null : event.target.value;
        const key = event.target.name
        component[key] = value;
        const validators = Validator.getValidators();
        KEYS_TO_VALIDATE.forEach(key => {
            errors[key] = validators[key](component[key]);
        })
        errors.error = Validator.validateSarComponent(component);
        this.setState({component: component});
    }

    /**
     * Handle dropdown. Validate and save changes.
     * @param event
     * @param data
     */
    handleDropdown = (event, data) => {
        const {component} = this.state;
        component.productFamilyId = data.value
        this.setState({component: component})
    }

    handleSlider = (event, data) => {
        const {component} = this.state;
        component[data.name] = data.checked;
        this.setState({component: component})
    }


    render() {
        const {components} = this.props;
        const {open, errors, component: copy} = this.state;
        const {
            error,
            componentSourceAddress,
            productFamilyId,
            productCode
        } = errors;

        const disabledSave =
            Boolean(Object.keys(errors).find(key => Boolean(errors[key])));

        const Edit = (component) => (
            <Modal
                size={"small"}
                closeIcon
                onClose={this.handleClose}
                onOpen={this.handleOpen(component)}
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
                            <Form.Field error={Boolean(componentSourceAddress) || Boolean(error)}>
                                <label>Source Address</label>
                                <Form.Input
                                    error={componentSourceAddress}
                                    defaultValue={copy.componentSourceAddress}
                                    name={"componentSourceAddress"}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field error={Boolean(productFamilyId)}>
                                <label>Product Family Id</label>
                                <Form.Dropdown
                                    error={productFamilyId}
                                    placeholder="Product Family Id"
                                    fluid selection
                                    options={Constants.ProductFamilyIds}
                                    defaultValue={Constants.ProductFamilyIds[Constants.productFamilyIdToIndex(copy.productFamilyId)].value}
                                    onChange={this.handleDropdown}
                                />
                            </Form.Field>
                            {/*<Form.Field error={Boolean(productFamilyId) || Boolean(error)}>*/}
                            {/*    <label>Product Family Id</label>*/}
                            {/*    <Form.Input*/}
                            {/*        error={productFamilyId}*/}
                            {/*        defaultValue={copy.productFamilyId}*/}
                            {/*        name={"productFamilyId"}*/}
                            {/*        onChange={this.handleChange}*/}
                            {/*    />*/}
                            {/*</Form.Field>*/}
                        </Form.Group>
                        <Form.Group widths={"equal"}>
                            <Form.Field error={Boolean(productCode)}>
                                <label>Product Code</label>
                                <Form.Input
                                    error={productCode}
                                    defaultValue={copy.productCode}
                                    name={"productCode"}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Segment compact>
                                <Form.Checkbox
                                    toggle
                                    label='Eaton'
                                    defaultChecked={Boolean(copy.isEaton)}
                                    name={"isEaton"}
                                    onChange={this.handleSlider}
                                />
                            </Segment>
                        </Form.Group>
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
                            Product Family Id
                        </Table.HeaderCell>
                        <Table.HeaderCell textAlign={"center"}>
                            Product Code
                        </Table.HeaderCell>
                        <Table.HeaderCell textAlign={"center"}>
                            Eaton
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
                        components.map((component, idx) => {
                            return (
                                <Table.Row key={idx}>
                                    <Table.Cell textAlign={"center"}>
                                        {component.componentSourceAddress}
                                    </Table.Cell>
                                    <Table.Cell textAlign={"center"}>
                                        {Constants.productFamilyIdToString(component.productFamilyId)}
                                    </Table.Cell>
                                    <Table.Cell textAlign={"center"}>
                                        {component.productCode}
                                    </Table.Cell>
                                    <Table.Cell textAlign={"center"}>
                                        {
                                            Boolean(component.isEaton) ?
                                                <Icon color='green' name='check' size='large'/> :
                                                <Icon color='red' name='close' size='large'/>
                                        }
                                    </Table.Cell>
                                    <Table.Cell textAlign={"center"}>
                                        <Button.Group>
                                            {Edit(component)}
                                            <Button
                                                negative
                                                onClick={this.handleEasyDelete(component)}
                                                icon={"delete"}
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

export default Components;