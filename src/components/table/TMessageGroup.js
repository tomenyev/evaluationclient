import React, {Component} from "react";
import {Icon, Message} from "semantic-ui-react";
import Validator from "../../Validator";

/**
 * EvaluationRule page messages.
 */
class TMessageGroup extends Component {

    render() {

        const {isLoading, errors, success, handleDismissSuccess, handleDismissError} = this.props;

        const error = Boolean(errors.length);

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
                success
                icon={"check"}
                size={"large"}
                onDismiss={handleDismissSuccess}
                header={"Success"}
                content={"Action was successful!"}
            />
        )

        const errorMessage = () => (
            <Message
                error
                icon={"delete"}
                size={"large"}
                onDismiss={handleDismissError}
                header={"Errors:"}
                list={errors.map(e => {
                    if (!Validator.isEmpty(e.id))
                        return e.id + ": " + e.message;
                    return e.message;
                })}
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

export default TMessageGroup;