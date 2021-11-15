import React, {Component} from "react";
import {Button, Form, Modal} from "semantic-ui-react"

/**
 * Export evaluation rules modal as excel modal.
 */
class Export extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            ruleGroup: null
        };
        this.handleClose = this.handleClose.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleConfirm = this.handleConfirm.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }

    handleConfirm = value => e => {
        e.preventDefault();
        const {handleExport} = this.props;
        handleExport(value);
        this.handleClose();
    }

    handleClose = () => this.setState({open: false});
    handleOpen = () => this.setState({open: true});

    handleSelect = (e, {value}) => this.setState({ruleGroup: value})

    render() {
        const {open, ruleGroup} = this.state;
        const {ruleGroups} = this.props;

        return (
            <Modal
                closeIcon
                onClose={this.handleClose}
                onOpen={this.handleOpen}
                open={open}
                size={"tiny"}
                trigger={<Button icon={"download"}/>}
            >
                <Modal.Header>
                    Export
                </Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Select
                            options={ruleGroups}
                            placeholder={"Rule Group"}
                            error={!ruleGroup}
                            onChange={this.handleSelect}
                        />
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
                        onClick={this.handleConfirm(ruleGroup)}
                        disabled={!ruleGroup}
                    />
                </Modal.Actions>
            </Modal>
        )
    }
}

export default Export;