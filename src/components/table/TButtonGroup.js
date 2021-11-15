import React, {Component} from "react";
import {Button, Dropdown, Menu} from "semantic-ui-react";
import Confirm from "../modal/Confirm";
import Import from "../modal/Import";
import Export from "../modal/Export";
import Delete from "../modal/Delete";
import Add from "../modal/Add";
import TPath from "./TPath";
import * as Constants from "../../constants/Constants"

/**
 * EvaluationRule page buttons.
 */
class TButtonGroup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            enter: false
        }
    }

    render() {
        const {
            currentState, maxRules, ruleGroups: old,
            handleBackButton, handleAddEmptyRule,
            handleSave, handleImport, handleMaxRulesDropdown,
            handleRefresh, handleExport, handleDeleteRuleGroup,
            handleAddRuleGroup, isDragDisabled,
            handleEdit, handleCancel,
            ruleGroup, prevRuleGroup, resultKey,
            handlePathClick, isLoading
        } = this.props;


        let ruleGroups = [];
        if (old) {
            ruleGroups = old.map((r, i) => {
                return {key: i, text: r, value: r}
            })
        }

        const open = currentState > Constants.State.ROOT;
        const add = currentState < Constants.State.MULTIPLE;
        const drop = currentState < Constants.State.OPEN;

        const editMode = () => (
            <div>
                {
                    currentState === Constants.State.OPEN && <Button.Group>
                        <Button
                            icon={"arrow left"}
                            onClick={handleBackButton}
                            secondary
                        />
                    </Button.Group>
                }
                {' '}
                <Button.Group>
                    <Button disabled={isLoading} icon='file' onClick={handleAddEmptyRule}/>
                    <Confirm
                        icon={"check"}
                        title={"Save"}
                        body={"Would you like to save all changes?"}
                        negative={false}
                        positive={true}
                        isLoading={isLoading}
                        handleConfirm={handleSave}
                    />
                    <Confirm
                        icon={"delete"}
                        isLoading={isLoading}
                        title={"Discard"}
                        body={"All unsaved changes would be discarded."}
                        negative={true}
                        handleConfirm={handleCancel}
                    />
                </Button.Group> {" "}
                <TPath
                    currentState={currentState}
                    ruleGroup={ruleGroup}
                    prevRuleGroup={prevRuleGroup}
                    resultKey={resultKey}
                    handleBackButton={() => {
                    }}
                    handlePathClick={(v1, v2) => {
                    }}
                />

                {
                    drop && <Menu floated="right" compact>
                        <Dropdown
                            text={maxRules.toString()}
                            options={Constants.MaxRulesOptions}
                            onChange={handleMaxRulesDropdown}
                            simple item
                        />
                    </Menu>
                }
            </div>
        );

        const viewMode = () => (
            <div>
                {
                    open && <Button.Group>
                        <Button
                            icon={"arrow left"}
                            onClick={handleBackButton}
                            secondary
                        />
                    </Button.Group>
                }
                {' '}
                <Button.Group>
                    {
                        add && <Add
                            currentState={currentState}
                            handleAddRuleGroup={handleAddRuleGroup}
                        />
                    }
                    <Button icon="edit" onClick={handleEdit}/>
                    <Button icon='repeat' onClick={handleRefresh}/>
                    <Delete
                        handleDeleteRuleGroup={handleDeleteRuleGroup}
                        ruleGroups={ruleGroups}
                    />
                </Button.Group>{' '}
                <Button.Group>
                    {
                        add &&
                        <Import
                            handleImport={handleImport}
                        />
                    }
                    <Export
                        handleExport={handleExport}
                        ruleGroups={ruleGroups}
                    />
                </Button.Group> {" "}
                <TPath
                    currentState={currentState}
                    ruleGroup={ruleGroup}
                    prevRuleGroup={prevRuleGroup}
                    resultKey={resultKey}
                    handleBackButton={handleBackButton}
                    handlePathClick={handlePathClick}
                />
                {
                    drop && <Menu floated="right" compact>
                        <Dropdown
                            text={maxRules.toString()}
                            options={Constants.MaxRulesOptions}
                            onChange={handleMaxRulesDropdown}
                            simple item
                        />
                    </Menu>
                }
            </div>
        )

        if (isDragDisabled) {
            return viewMode();
        } else {
            return editMode();
        }
    }
}

export default TButtonGroup;