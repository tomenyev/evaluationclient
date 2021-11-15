import React, {Component} from "react";
import {Icon, Message} from "semantic-ui-react";

/**
 * Evaluation messages.
 */
class MessageGroup extends Component {

    render() {

        const {
            isLoading,
            errors,
            success: successContent,
            handleDismissSuccess,
            handleDismissError
        } = this.props;

        const error = Boolean(errors.length);
        const success = Boolean(successContent);

        const loadingMessage = () => (
            <Message icon>
                <Icon name='circle notched' loading/>
                <Message.Content>
                    <Message.Header>Just one second</Message.Header>
                    Processing action...
                </Message.Content>
            </Message>
        )

        const successMessage = () => (
            <Message
                info
                icon={"check"}
                size={"large"}
                onDismiss={handleDismissSuccess}
                header={"Action Plan"}
                content={successContent}
            />
        )

        const errorMessage = () => (
            <Message
                error
                icon={"delete"}
                size={"large"}
                onDismiss={handleDismissError}
                header={"Errors"}
                list={errors}
            />
        )

        if (isLoading) {
            return loadingMessage();
        } else if (error) {
            return errorMessage();
        } else if (success) {
            return successMessage();
        } else {
            return <></>;
        }
    }
}

export default MessageGroup;