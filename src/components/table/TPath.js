import React, {Component} from "react";
import {Button} from "semantic-ui-react";
import * as Constants from "../../constants/Constants";

/**
 * EvaluationRule path.
 */
class TPath extends Component {

    render() {
        const {
            currentState, ruleGroup, prevRuleGroup,
            resultKey, handlePathClick, handleBackButton
        } = this.props;

        if (currentState === Constants.State.EMPTY) {
            return (
                <Button.Group>
                    <Button active content={"Empty"}/>
                </Button.Group>
            )
        }

        if (currentState === Constants.State.ROOT) {
            return (
                <Button.Group>
                    <Button active content={Constants.ROOT_NAME}/>
                </Button.Group>
            )
        }

        if (currentState === Constants.State.SINGLE) {
            return (
                <Button.Group>
                    <Button
                        content={Constants.ROOT_NAME}
                        onClick={handleBackButton}
                    />
                    <Button.Or text={""}/>
                    <Button
                        active
                        content={ruleGroup}
                    />
                </Button.Group>
            )
        }

        if (currentState === Constants.State.MULTIPLE) {
            return (
                <Button.Group>
                    <Button
                        content={Constants.ROOT_NAME}
                        onClick={handlePathClick(Constants.ROOT_NAME, Constants.State.ROOT)}
                    />
                    <Button.Or text={""}/>
                    <Button
                        content={prevRuleGroup}
                        onClick={handleBackButton}
                    />
                    <Button.Or text={""}/>
                    <Button
                        active
                        content={ruleGroup}
                    />
                </Button.Group>
            )
        }

        return (
            <Button.Group>
                <Button
                    content={Constants.ROOT_NAME}
                    onClick={handlePathClick(Constants.ROOT_NAME, Constants.State.ROOT)}
                />
                <Button.Or text={""}/>
                <Button
                    content={prevRuleGroup}
                    onClick={handlePathClick(prevRuleGroup, Constants.State.SINGLE)}
                />
                <Button.Or text={""}/>
                <Button
                    content={ruleGroup}
                    onClick={handleBackButton}
                />
                <Button.Or text={""}/>
                <Button
                    active
                    content={resultKey}
                />
            </Button.Group>
        )
    }
}

export default TPath;