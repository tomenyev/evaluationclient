import React, {Component} from "react";
import {Button, Form, Modal} from "semantic-ui-react"

/**
 * Delete RulGroup modal.
 */
class Delete extends Component {

    constructor(props) {
        super(props);
        this.state = {
            enter: false,
            open: false,
            select: true,
            ruleGroup: null
        };
        this.handleClose = this.handleClose.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleConfirm = this.handleConfirm.bind(this);
        this.handleSelectRuleGroup = this.handleSelectRuleGroup.bind(this);
    }

    handleConfirm = ruleGroup => e => {
        e.preventDefault();
        const {handleDeleteRuleGroup} = this.props;
        handleDeleteRuleGroup(ruleGroup);
        this.handleClose();
    }
    handleClose = () => this.setState({open: false});
    handleOpen = () => this.setState({open: true});

    handleSelectRuleGroup = (e, {value}) => this.setState({ruleGroup: value});

    render() {
        const {open, ruleGroup} = this.state;
        const {ruleGroups} = this.props;

        return (
            <Modal
                closeIcon
                onClose={this.handleClose}
                onOpen={this.handleOpen}
                open={open}
                size={"mini"}
                trigger={<Button icon={"trash alternate"}/>}
            >
                <Modal.Header>
                    Delete
                </Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Select
                            options={ruleGroups}
                            placeholder={"Rule Group"}
                            error={!ruleGroup}
                            onChange={this.handleSelectRuleGroup}
                        />
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
                        onClick={this.handleConfirm(ruleGroup)}
                        disabled={!ruleGroup}
                    />
                </Modal.Actions>
            </Modal>
        )
    }
}

export default Delete;