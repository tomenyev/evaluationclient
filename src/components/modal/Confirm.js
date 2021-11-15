import React, {Component} from "react";
import {Button, Icon, Modal} from "semantic-ui-react";

/**
 * Confirm modal.
 */
class Confirm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
        };
        this.handleClose = this.handleClose.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
    }

    handleConfirm = (e) => {
        e.preventDefault();
        const {handleConfirm} = this.props;
        handleConfirm(e);
        this.handleClose();
    }

    handleClose = () => this.setState({open: false});
    handleOpen = () => this.setState({open: true});

    render() {
        const {open} = this.state;
        const {title, body, icon, negative, positive, isLoading} = this.props;

        return (
            <Modal
                basic
                onClose={this.handleClose}
                onOpen={this.handleOpen}
                open={open}
                trigger={<Button disabled={isLoading} negative={negative} positive={positive} icon={icon}/>}
            >
                <Modal.Header>
                    <h1>
                        <Icon name={icon}/>
                        {title}
                    </h1>
                </Modal.Header>
                <Modal.Content>
                    <h3>{body}</h3>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        size={"big"}
                        basic
                        icon={"remove"}
                        color='red'
                        content={"No"}
                        inverted
                        onClick={this.handleClose}
                    />
                    <Button
                        size={"big"}
                        icon={"checkmark"}
                        color='green'
                        content={"Yes"}
                        inverted onClick={this.handleConfirm}
                    />
                </Modal.Actions>
            </Modal>
        )
    }
}

export default Confirm;