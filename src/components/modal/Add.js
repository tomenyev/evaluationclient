import React, {Component} from "react";
import {Button, Form, Modal} from "semantic-ui-react";
import RuleValidator from "../../Validator";
import * as Constants from "../../constants/Constants";

/**
 * Add new RuleGroup modal.
 */
class Add extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            ruleGroup: null,
            multiple: false,
            error: null
        };

        this.handleClose = this.handleClose.bind(this);
        this.handleOpen = this.handleOpen.bind(this);

        this.handleConfirm = this.handleConfirm.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSlider = this.handleSlider.bind(this);
    }

    /**
     * Handle confirm button.
     * @param ruleGroup to be added.
     * @returns {function(*): void}
     */
    handleConfirm = ruleGroup => e => {
        e.preventDefault();
        const {handleAddRuleGroup, currentState} = this.props;
        switch (currentState) {
            case Constants.State.EMPTY:
                handleAddRuleGroup(Constants.ROOT_NAME, false);
                break;
            case Constants.State.ROOT:
                handleAddRuleGroup(ruleGroup, false);
                break;
            case Constants.State.SINGLE:
                handleAddRuleGroup(ruleGroup, true);
                break;
            default:
                break;
        }
        this.handleClose();
    }

    handleClose = () => this.setState({open: false});
    handleOpen = () => this.setState({open: true});

    /**
     * Save and validate form fields changes.
     * @param event
     */
    handleChange = (event) => {
        const value = event.target.value;
        const error = RuleValidator.validateRuleGroup(value);
        this.setState({ruleGroup: value, error: error})
    }

    handleSlider = (event, data) => this.setState({multiple: data.checked})


    render() {
        const {open, ruleGroup, error} = this.state;
        const {currentState} = this.props

        const empty = currentState === Constants.State.EMPTY;

        return (
            <Modal
                closeIcon
                onClose={this.handleClose}
                onOpen={this.handleOpen}
                open={open}
                size={"small"}
                trigger={<Button icon="add"/>}
            >
                <Modal.Header>
                    {
                        empty ? "Init" : "Add"
                    }
                </Modal.Header>
                <Modal.Content>
                    <Form>
                        {
                            empty ?
                                <Form.Field>
                                    <Form.Input
                                        disabled={true}
                                        defaultValue={Constants.ROOT_NAME}
                                        name={"RuleGroup"}
                                    />
                                </Form.Field>
                                :
                                <Form.Input
                                    error={error}
                                    fluid
                                    label='Rule Group'
                                    placeholder='Rule Group'
                                    id='form-input-ruleGroup'
                                    onChange={this.handleChange}
                                />
                        }
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        icon={"delete"}
                        negative
                        onClick={this.handleClose}
                    />
                    <Button
                        positive
                        icon={"check"}
                        disabled={!ruleGroup && !empty}
                        onClick={this.handleConfirm(ruleGroup)}
                    />
                </Modal.Actions>
            </Modal>
        )

    }
}

export default Add;