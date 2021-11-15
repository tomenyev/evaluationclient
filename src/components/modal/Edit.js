import React, {Component} from "react";
import {Button, Form, Message, Modal, Segment} from "semantic-ui-react";

import Validator from "../../Validator";
import * as Constants from "../../constants/Constants";

/**
 *  Edit rule modal.
 */
class Edit extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            copy: {},
            errors: {
                faultError: null,
                componentError: null,
                prefix: null,
                suffix: null,
                originType: null,
                componentSourceAddress: null,
                productFamilyId: null,
                productCode: null,
                faultSourceAddress: null,
                faultCode: null,
                spn: null,
                fmi: null,
                resultKey: null,
                ruleGroup: null
            }
        };

        this.handleClose = this.handleClose.bind(this);
        this.handleOpen = this.handleOpen.bind(this);

        this.handleConfirm = this.handleConfirm.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSlider = this.handleSlider.bind(this);
        this.handleResultTypeDropdown = this.handleResultTypeDropdown.bind(this);
        this.handleSelectOperand = this.handleSelectOperand.bind(this);
    }

    /**
     * Handle confirm, validate and save changes.
     * @param e
     */
    handleConfirm = (e) => {
        e.preventDefault();
        const {copy} = this.state;
        const {handleSave, rule, currentState, isDragDisabled, forceUpdate} = this.props;
        Object.keys(copy).forEach(key => {
            rule[key] = copy[key];
        })
        if (currentState !== Constants.State.OPEN && isDragDisabled) {
            handleSave(e);
        } else {
            forceUpdate();
        }
        this.handleClose();
    }

    /**
     * Reset state and close modal.
     */
    handleClose = () => {
        this.setState({
            errors: {
                faultError: null,
                componentError: null,
                prefix: null,
                suffix: null,
                originType: null,
                componentSourceAddress: null,
                productFamilyId: null,
                productCode: null,
                faultSourceAddress: null,
                faultCode: null,
                spn: null,
                fmi: null,
                resultKey: null
            },
            open: false,
            copy: {}
        })
    }

    /**
     * Open modal and validate rule data.
     */
    handleOpen = () => {
        const {rule, currentState} = this.props;
        const {errors} = this.state;
        const keys = Validator.getKeys();
        const validators = Validator.getValidators();
        keys.forEach(k => {
            errors[k] = validators[k](rule[k]);
        })
        this.setState({
            open: true,
            copy: Object.assign({}, rule),
            errors: this.complexValidation(errors, rule, currentState)
        });
    }

    /**
     * Complex rule validation.
     * @param errors all possible errors object.
     * @param rule rule to be validated.
     * @param currentState current application state.
     * @returns {*} object with occurred errors.
     */
    complexValidation = (errors, rule, currentState) => {

        errors.resultKey = Validator.validateRuleGroupAndResultKey(rule);

        if (currentState === Constants.State.OPEN) {
            errors.faultError = Validator.validateFault(rule);
        } else if (currentState === Constants.State.SINGLE) {
            const faultError = Validator.validateFault(rule);
            errors.faultError =
                faultError && rule.resultType !== Constants.ResultType.EVALUATE ?
                    faultError : null;
        } else if (currentState === Constants.State.ROOT) {
            const componentError = Validator.validateComponent(rule);
            errors.componentError =
                componentError && rule.resultType !== Constants.ResultType.ACTION_PLAN ?
                    componentError : null;
        }
        return errors;
    }

    /**
     * Handle form changes. Save and validate changes.
     * @param event
     */
    handleChange = (event) => {
        const {copy: rule, errors} = this.state;
        const {currentState} = this.props;

        const value = event.target.value === "" ? null : event.target.value;
        const key = event.target.name
        rule[key] = value;
        errors[key] = Validator.getValidators()[key](value);
        this.setState({
            copy: rule,
            errors: this.complexValidation(errors, rule, currentState)
        });
    }

    /**
     * Handle result type dropdown. Save and validate changes.
     * @param event
     * @param data new result type.
     */
    handleResultTypeDropdown = (event, data) => {
        const {copy: rule, errors} = this.state;
        const {currentState} = this.props;
        rule.resultType = data.value;
        if (currentState === Constants.State.SINGLE) {
            const faultError = Validator.validateFault(rule);
            errors.faultError =
                faultError && rule.resultType !== Constants.ResultType.EVALUATE ?
                    faultError : null;
        } else if (currentState === Constants.State.ROOT) {
            const componentError = Validator.validateComponent(rule);
            errors.componentError =
                componentError && rule.resultType !== Constants.ResultType.ACTION_PLAN ?
                    componentError : null;
        }
        this.setState({copy: rule, errors: errors})
    }

    /**
     * Handle product family id dropdown. Save and validate changes.
     * @param event
     * @param data new product family id.
     */
    handleProductFamilyIdDropdown = (event, data) => {
        const {copy: rule, errors} = this.state;
        rule.productFamilyId = data.value
        const componentError = Validator.validateComponent(rule);
        errors.componentError =
            componentError && rule.resultType !== Constants.ResultType.ACTION_PLAN ?
                componentError : null;
        this.setState({copy: rule, errors: errors})
    }

    /**
     * Handle select operand dropdown. Save changes.
     * @param event
     * @param value new operand value.
     */
    handleSelectOperand = (event, {value}) => {
        const {copy: rule} = this.state;
        rule.prefix = value;
        this.setState({copy: rule})
    }

    /**
     * Handle slider. Save changes.
     * @param event
     * @param data new value.
     */
    handleSlider = (event, data) => {
        const {copy: rule} = this.state;
        rule[data.name] = data.checked;
        this.setState({copy: rule})
    }

    render() {
        const {open, errors, copy: rule} = this.state;
        const {currentState, isLoading} = this.props;
        const {
            originType,
            componentSourceAddress, productFamilyId,
            productCode, faultSourceAddress,
            faultCode, spn, fmi, resultKey, faultError, componentError
        } = errors;

        const disabledOperand = Constants.isGroupStartChar.test(rule.prefix);
        const disabledSave =
            Boolean(Object.keys(errors).find(key => Boolean(errors[key])));

        const defaultForm = () => (
            <Modal
                size={"small"}
                closeIcon
                onClose={this.handleClose}
                onOpen={this.handleOpen}
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
                            content={componentError}
                            hidden={!Boolean(componentError)}
                        />
                        <Form.Group widths={"equal"}>
                            <Form.Field error={!!originType}>
                                <label>Origin Type</label>
                                <Form.Input
                                    error={originType}
                                    defaultValue={rule.originType}
                                    name={"originType"}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form.Group>
                        <Form.Group widths={"equal"}>
                            <Form.Field error={!!componentSourceAddress || Boolean(componentError)}>
                                <label>Component Source Address</label>
                                <Form.Input
                                    error={componentSourceAddress}
                                    defaultValue={rule.componentSourceAddress}
                                    name={"componentSourceAddress"}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field error={!!productFamilyId || Boolean(componentError)}>
                                <label>Product Family Id</label>
                                <Form.Dropdown
                                    error={!!productFamilyId || Boolean(componentError)}
                                    placeholder="Product Family Id"
                                    fluid selection
                                    options={Constants.ProductFamilyIds}
                                    defaultValue={Constants.ProductFamilyIds[Constants.productFamilyIdToIndex(rule.productFamilyId)].value}
                                    onChange={this.handleProductFamilyIdDropdown}
                                />
                            </Form.Field>
                            {/*<Form.Field error={!!productFamilyId || Boolean(componentError)}>*/}
                            {/*    <label>Product Family Id</label>*/}
                            {/*    <Form.Input*/}
                            {/*        error={productFamilyId}*/}
                            {/*        defaultValue={rule.productFamilyId}*/}
                            {/*        name={"productFamilyId"}*/}
                            {/*        onChange={this.handleChange}*/}
                            {/*    />*/}
                            {/*</Form.Field>*/}
                        </Form.Group>
                        <Form.Group widths={"equal"}>
                            <Form.Field error={!!productCode || Boolean(componentError)}>
                                <label>Product Code</label>
                                <Form.Input
                                    error={productCode}
                                    defaultValue={rule.productCode}
                                    name={"productCode"}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Segment compact>
                                <Form.Checkbox
                                    toggle
                                    label='Eaton'
                                    defaultChecked={Boolean(rule.isEaton)}
                                    name={"isEaton"}
                                    onChange={this.handleSlider}
                                />
                            </Segment>
                        </Form.Group>
                        <Form.Group widths={"equal"}>
                            <Form.Field>
                                <label>Result Type</label>
                                <Form.Dropdown
                                    placeholder="Result Type"
                                    fluid selection
                                    options={Constants.ResultTypes}
                                    defaultValue={Constants.ResultTypes[Constants.resultTypeToIndex(rule.resultType)].value}
                                    onChange={this.handleResultTypeDropdown}
                                />
                            </Form.Field>
                        </Form.Group>
                        <Form.Group widths={"equal"}>
                            <Form.Field error={!!resultKey}>
                                <Form.Input
                                    fluid
                                    label={"Result Key"}
                                    defaultValue={rule.resultKey}
                                    name={"resultKey"}
                                    error={resultKey}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
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

        const singleForm = () => (
            <Modal
                size={"small"}
                closeIcon
                onClose={this.handleClose}
                onOpen={this.handleOpen}
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
                            content={faultError}
                            hidden={!Boolean(faultError)}
                        />
                        <Form.Group widths={"equal"}>
                            <Form.Field error={!!faultSourceAddress || Boolean(faultError)}>
                                <label>Fault Source Address</label>
                                <Form.Input
                                    error={faultSourceAddress}
                                    defaultValue={rule.faultSourceAddress}
                                    name={"faultSourceAddress"}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field error={!!faultCode || Boolean(faultError)}>
                                <label>Fault Code</label>
                                <Form.Input
                                    error={faultCode}
                                    defaultValue={rule.faultCode}
                                    name={"faultCode"}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form.Group>
                        <Form.Group widths={"equal"}>
                            <Form.Field error={!!spn || Boolean(faultError)}>
                                <label>SPN</label>
                                <Form.Input
                                    error={spn}
                                    defaultValue={rule.spn}
                                    name={"spn"}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field error={!!fmi || Boolean(faultError)}>
                                <label>FMI</label>
                                <Form.Input
                                    error={fmi}
                                    defaultValue={rule.fmi}
                                    name={"fmi"}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form.Group>
                        <Segment compact>
                            <Form.Checkbox
                                toggle
                                label='Active'
                                defaultChecked={Boolean(rule.isActive)}
                                name={"isActive"}
                                onChange={this.handleSlider}
                            />
                        </Segment>
                        <Form.Group widths={"equal"}>
                            <Form.Field>
                                <label>Result Type</label>
                                <Form.Dropdown
                                    placeholder="Result Type"
                                    fluid selection
                                    options={Constants.ResultTypes}
                                    defaultValue={Constants.ResultTypes[Constants.resultTypeToIndex(rule.resultType)].value}
                                    onChange={this.handleResultTypeDropdown}
                                />
                            </Form.Field>
                        </Form.Group>
                        <Form.Group widths={"equal"}>
                            <Form.Field error={!!resultKey}>
                                <Form.Input
                                    fluid
                                    label={"Result Key"}
                                    defaultValue={rule.resultKey}
                                    name={"resultKey"}
                                    error={resultKey}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form.Group>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        negative icon={"delete"}
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

        const multipleForm = () => (
            <Modal
                size={"small"}
                closeIcon
                onClose={this.handleClose}
                onOpen={this.handleOpen}
                open={open}
                trigger={<Button disabled={isLoading} icon={"edit"}/>}
            >
                <Modal.Header>
                    Edit
                </Modal.Header>
                <Modal.Content>
                    <Form.Group>
                        <Form.Field error={!!resultKey}>
                            <Form.Input
                                fluid
                                label={"Result Key"}
                                defaultValue={rule.resultKey}
                                name={"resultKey"}
                                error={resultKey}
                                onChange={this.handleChange}
                            />
                        </Form.Field>
                    </Form.Group>
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

        const openForm = () => (
            <Modal
                size={"small"}
                closeIcon
                onClose={this.handleClose}
                onOpen={this.handleOpen}
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
                            content={faultError}
                            hidden={!Boolean(faultError)}
                        />
                        <Form.Group widths={"equal"}>
                            <Form.Dropdown
                                options={Constants.Operands}
                                fluid selection
                                placeholder={"Operand"}
                                defaultValue={disabledOperand ? "" : Constants.Operands[Constants.getOperand(rule.prefix)].value}
                                onChange={this.handleSelectOperand}
                                disabled={disabledOperand}
                            />
                        </Form.Group>
                        <Form.Group widths={"equal"}>
                            <Form.Field error={!!faultSourceAddress || Boolean(faultError)}>
                                <label>Fault Source Address</label>
                                <Form.Input
                                    error={faultSourceAddress}
                                    defaultValue={rule.faultSourceAddress}
                                    name={"faultSourceAddress"}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field error={!!faultCode || Boolean(faultError)}>
                                <label>Fault Code</label>
                                <Form.Input
                                    error={faultCode}
                                    defaultValue={rule.faultCode}
                                    name={"faultCode"}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form.Group>
                        <Form.Group widths={"equal"}>
                            <Form.Field error={!!spn || Boolean(faultError)}>
                                <label>SPN</label>
                                <Form.Input
                                    error={spn}
                                    defaultValue={rule.spn}
                                    name={"spn"}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field error={!!fmi || Boolean(faultError)}>
                                <label>FMI</label>
                                <Form.Input
                                    error={fmi}
                                    defaultValue={rule.fmi}
                                    name={"fmi"}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form.Group>
                        <Segment compact>
                            <Form.Checkbox
                                toggle
                                label='Active'
                                defaultChecked={Boolean(rule.isActive)}
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

        switch (currentState) {
            case Constants.State.EMPTY:
                return defaultForm();
            case Constants.State.ROOT:
                return defaultForm();
            case Constants.State.SINGLE:
                return singleForm();
            case Constants.State.MULTIPLE:
                return multipleForm();
            case Constants.State.OPEN:
                return openForm();
            default:
                return <div/>;
        }
    }
}

export default Edit;