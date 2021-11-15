import React, {Component} from 'react';
import AuthService from "../services/AuthService";
import {Button, Container, Modal, Ref, Table} from "semantic-ui-react";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import THeader from "../components/table/THeader";
import TRow from "../components/table/TRow";
import TFooter from "../components/table/TFooter";
import TButtonGroup from "../components/table/TButtonGroup";
import TMessageGroup from "../components/table/TMessageGroup";
import Import from "../components/modal/Import";

import Validator from "../Validator";
import * as Constants from "../constants/Constants"
import EvaluationRuleService from "../services/EvaluationRuleService";

import cloneDeep from 'lodash/cloneDeep';

class EvaluationRules extends Component {

    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            success: false,
            show: false,

            rules: [],
            copy: [],
            rulesToDelete: [],
            currentRulePriority: null,
            currentRulePriorityCopy: 0,
            ruleGroups: [],
            ruleGroup: Constants.ROOT_NAME,
            prevRuleGroup: null,
            resultKey: null,
            newRule: {},
            ruleToOpen: null,
            checksum: null,

            currentState: Constants.State.Empty,

            draggingRowId: null,
            dragging: false,
            droppedPageId: null,
            isDragDisabled: true,

            isLoading: false,
            activePage: 1,
            maxRules: 10,
            paginationLength: null
          };
        this.handleImport = this.handleImport.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.handleDeleteRuleGroup = this.handleDeleteRuleGroup.bind(this);
        this.handleAddRuleGroup = this.handleAddRuleGroup.bind(this);
        this.handleRefresh = this.handleRefresh.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleEasyDelete = this.handleEasyDelete.bind(this);
        this.handleAddEmptyRule = this.handleAddEmptyRule.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.handlePageClick = this.handlePageClick.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleStartPage = this.handleStartPage.bind(this);
        this.handlePrevPage = this.handlePrevPage.bind(this);
        this.handleNextPage = this.handleNextPage.bind(this);
        this.handleEndPage = this.handleEndPage.bind(this);
        this.handleBackButton = this.handleBackButton.bind(this);
        this.handleMaxRulesDropdown = this.handleMaxRulesDropdown.bind(this);
        this.handleDismissError = this.handleDismissError.bind(this);
        this.handleHardDelete = this.handleHardDelete.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleDismissSuccess = this.handleDismissSuccess.bind(this);
        this.handlePathClick = this.handlePathClick.bind(this);
    }

    componentDidMount() {
        const user = AuthService.getCurrentUser();
        if (!user) {
            this.props.history.push("/signin");
            return;
        }
        const state = JSON.parse(localStorage.getItem("evaluationrules"));
        if (Boolean(state) && Boolean(state.rules.length)) {
            this.setState(state);
            return;
        }
        this.init();
    }
    componentWillUnmount() {
        localStorage.setItem("evaluationrules", JSON.stringify(this.state));
    }

    /**
     * Gets all RuleGroups and set current app state.
     */
    init = () => {
        this.setState({ isLoading: true });
        EvaluationRuleService
            .getRuleGroups()
            .then(ruleGroups => {
                if (ruleGroups.length === 0) {
                    this.setState({currentState: Constants.State.EMPTY});
                } else {
                    this.setState({currentState: Constants.State.ROOT, ruleGroups: ruleGroups})
                    this.setRules(Constants.ROOT_NAME);
                }
            })
            .catch(error => {
                this.handleHardError(error);
            })
            .finally(() => {
                this.setState({ isLoading: false });
            })
    }

    /**
     * Gets rules to be set by RuleGroup.
     * @param value RuleGroup name.
     */
    setRules = (value) => {
        this.setState({ isLoading: true });
        EvaluationRuleService
            .getRulesByRuleGroup(value)
            .then(result => {
                this.setRulesData(result);
            })
            .catch(error => {
                this.handleHardError(error);
            })
            .finally(() => {
                this.setState({ isLoading: false });
            })
    }

    /**
     * Sets rules according to current state.
     * @param rules to set.
     */
    setRulesData = (rules) => {
        let result = [];
        if (!rules || !rules[0]) {
            this.handleBackButton();
            return;
        }
        let checksum = rules[0].ruleGroupChecksum;
        let prefix = rules[0].prefix;
        let suffix = rules[0].suffix;
        let multiple = (prefix != null && prefix !== "") || (suffix != null && suffix !== "");
        let count = 0;
        if (multiple) {
            let priority = -1;
            let subRules = [];
            let resultKey = "";
            for (let i = 0; i < rules.length; i++) {
                let rule = rules[i];
                let start = Constants.isGroupStartChar.test(rule.prefix) && Validator.isEmpty(rule.suffix);
                if (start) {
                    if (count !== 0) {
                        this.handleBackButton();
                        return;
                    }
                    resultKey = rule.resultKey;
                    priority++;
                }
                if (rule.prefix)
                    count += (rule.prefix.match(/\(/g) || []).length;
                if (rule.suffix)
                    count -= (rule.suffix.match(/\)/g) || []).length;
                rule.priority = i;
                subRules.push(rule);

                let end =
                    Constants.isAndOrOr.test(rule.prefix) &&
                    Constants.isGroupEndChar.test(rule.suffix) && count === 0;
                if (end) {
                    result.push({
                        priority: priority,
                        resultType: Constants.ResultType.ACTION_PLAN,
                        resultKey: resultKey,
                        rules: subRules
                    })
                    count = 0;
                    subRules = [];
                }
            }
        } else {
            result = rules;
        }
        if (count !== 0) {
            this.setState({rules: []});
            return;
        }
        const newRule = Object.assign({}, Constants.RuleTemplate());
        newRule.ruleGroupChecksum = checksum;
        newRule.ruleGroup = rules[0].ruleGroup;
        this.setState({
            rules: result,
            ruleGroup: rules[0].ruleGroup,
            checksum: checksum,
            newRule: newRule,
            copy: cloneDeep(result)
        })
    }

    /**
     * Converts client rules format to server rules format.
     * @returns {{rulesToDelete, rules: []}|null}
     */
    getRules = () => {
        let {currentState, rules, rulesToDelete} = this.state;
        let result = [];
        if (currentState === Constants.State.MULTIPLE || currentState === Constants.State.OPEN) {
            rules.forEach((rs, i) => {
                if (rs.rules.length === 0)
                    this.setState({currentState: Constants.State.MULTIPLE});
                for (let j = 0; j < rs.rules.length; j++) {
                    const r = rs.rules[j];
                    r.resultType = rs.resultType;
                    r.resultKey = rs.resultKey;
                    result.push(r);
                }
            })
        } else {
            result = rules;
        }
        const errors = Validator.validateRules(rules, currentState);
        if (errors.length !== 0) {
            this.setState({errors: errors});
            return null;
        }
        return {rules: result, rulesToDelete: rulesToDelete};
    }

    /**
     * Save current rules changes to the database.
     * @param e
     */
    handleSave = (e) => {
        e.preventDefault();
        this.setState({isLoading: true});

        const data = this.getRules();

        if (!data) {
            this.setState({isLoading: false})
            return;
        }

        EvaluationRuleService
            .save(data)
            .then(result => {
                this.setRulesData(result);
                this.setState({errors: []})
            })
            .catch(error => {
                this.handleHardError(error);
            })
            .finally(() => {
                this.setState({ isLoading: false });
            })
    };

    /**
     * Refresh current rules.
     * @param e
     */
    handleRefresh = e => {
        e.preventDefault();
        this.setState({ isLoading: true });
        const {ruleGroup, currentState, prevRuleGroup} = this.state;
        EvaluationRuleService
            .getRulesByRuleGroup(ruleGroup)
            .then(result => {
                if (!result || result.length === 0) {
                    switch (currentState) {
                        case Constants.State.ROOT:
                            this.setState({
                                currentState: Constants.State.EMPTY,
                                rules: [],
                            })
                            break;
                        case Constants.State.SINGLE:
                            this.setState({currentState: Constants.State.ROOT});
                            this.setRules(Constants.ROOT_NAME)
                            break;
                        case Constants.State.MULTIPLE:
                            this.setState({currentState: Constants.State.SINGLE});
                            this.setRules(prevRuleGroup)
                            break;
                        default:
                            break;
                    }
                } else {
                    this.setRulesData(result);
                }
            })
            .catch(error => {
                this.handleHardError(error);
            })
            .finally(() => {
                this.setState({ isLoading: false });
            })
    }

    /**
     * Initializes new RuleGroup according to current state.
     * @param e
     */
    handleInitRuleGroup = e => {
        e.preventDefault();
        const {currentState, ruleGroup, ruleToOpen} = this.state;
        if (currentState === Constants.State.ROOT) {
            this.handleAddRuleGroup(ruleGroup.resultKey, false);
        } else if (currentState === Constants.State.SINGLE) {
            this.handleAddRuleGroup(ruleToOpen.resultKey, true);
        }
        this.handleClose();
    }

    /**
     * Add new RuleGroup.
     * @param ruleGroup name to be added.
     * @param multiple rules type.
     */
    handleAddRuleGroup = (ruleGroup, multiple) => {
        this.setState({isLoading: true});
        const {currentState, checksum, ruleGroup: currentRuleGroup, ruleToOpen, ruleGroups} = this.state;
        if (currentState === Constants.State.EMPTY) {
            EvaluationRuleService
                .initRoot()
                .then(result => {
                    this.setRulesData(result);
                    this.setState({isLoading: false, currentState: Constants.State.ROOT, ruleGroups: [Constants.ROOT_NAME]});
                })
                .catch(error => {
                    this.handleHardError(error);
                    this.setState({isLoading: false});
                })
        }
        else if (currentState === Constants.State.ROOT || currentState === Constants.State.SINGLE) {
            let rule = null;
            if (ruleToOpen === null) {
                rule = Constants.RuleTemplate();
                rule.ruleGroup = currentRuleGroup;
                rule.resultType = Constants.ResultType.EVALUATE;
                rule.ruleGroupChecksum = checksum;
                rule.resultKey = ruleGroup;
            } else {
                rule = ruleToOpen;
            }
            EvaluationRuleService
                .addRuleGroup(rule, multiple)
                .then(result => {
                    ruleGroups.unshift(rule.resultKey);
                    this.setRulesData(result);
                    this.setState({ruleToOpen: null, ruleGroups: ruleGroups});
                })
                .catch(error => {
                    this.handleHardError(error);
                    this.setState({ruleToOpen: null, ruleGroups: ruleGroups});
                })
                .finally(() => {
                    this.setState({ isLoading: false });
                })
        }
    }

    /**
     * Deletes all RuleGroup rules.
     * @param ruleGroup to be deleted.
     */
    handleDeleteRuleGroup = (ruleGroup) => {
        this.setState({isLoading: true});
        const {ruleGroup: currentRuleGroup, currentState, prevRuleGroup} = this.state;
        EvaluationRuleService
            .deleteRuleGroup(ruleGroup)
            .then(data => {
                this.setState({ruleGroups: data, success: true});
                if (ruleGroup === currentRuleGroup) {
                    switch (currentState) {
                        case Constants.State.ROOT:
                            this.setState({
                                currentState: Constants.State.EMPTY,
                                rules: []
                            })
                            break;
                        case Constants.State.SINGLE:
                            this.setState({currentState: Constants.State.ROOT});
                            this.setRules(Constants.ROOT_NAME)
                            break;
                        case Constants.State.MULTIPLE:
                            this.setState({currentState: Constants.State.SINGLE});
                            this.setRules(prevRuleGroup)
                            break;
                        default:
                            break;
                    }
                }
            })
            .catch(error => {
                this.handleEasyError(error);
            })
            .finally(() => {
                this.setState({ isLoading: false });
            })
    }

    /**
     * Deletes rule without updating database.
     * @param param rule to be added.
     * @returns {function(*): undefined}
     */
    handleEasyDelete = param => e => {
        e.preventDefault();
        const {currentRulePriority, currentState} = this.state;
        param = param.priority;
        let priority = currentRulePriority;
        let rules = Object.assign([], this.state.rules);
        let rulesToDelete = Object.assign([], this.state.rulesToDelete);
        let rule = rules[param];
        if (!priority)
            priority = 0;
        if (currentState === Constants.State.OPEN) {
            for (let j = 0; j < rules[priority].rules.length; j++) {
                if (rules[priority].rules[j].priority === param) {
                    rule = rules[priority].rules.splice(j, 1);
                    if (rule[0].id)
                        rulesToDelete.push(rule[0]);
                }
            }
            let i = 0;
            rules.forEach((rs, idx) => {
                rs.rules.forEach((r,index) => {
                    if (idx === currentRulePriority) {
                        if (index === 0) {
                            r.prefix = Constants.GROUP_START_CHAR.repeat(rs.rules.length-1);
                            r.suffix = null;
                        } else {
                            r.prefix = Constants.isAndOrOr.test(r.prefix) ?
                                r.prefix :
                                Constants.TEMPLATE_RULE_SEPARATOR_AND;
                            r.suffix = Constants.GROUP_END_CHAR
                        }
                    }
                    r.priority = i;
                    i++;
                })
                rs.priority = idx;
            })
            this.setState({rules: rules, rulesToDelete: rulesToDelete});
            return;
        }
        rules.splice(param, 1);
        if (currentState === Constants.State.MULTIPLE) {
            rulesToDelete.push(...rule.rules.filter(r=>r.id));
            let i = 0;
            rules.forEach((rs, idx) => {
                rs.rules.forEach(r => {
                    r.priority = i;
                    i++;
                })
                rs.priority = idx;
            })
        } else {
            if (rule.id)
                rulesToDelete.push(rule);
            for (let i = priority; i < rules.length; i++) {
                rules[i].priority = i;
            }
        }
        this.setState({rules: rules, rulesToDelete: rulesToDelete})
    }

    /**
     * Deletes rule and save changes.
     * @param param rule to be deleted.
     * @returns {function(*): void}
     */
    handleHardDelete = param => e => {
        e.preventDefault();
        const {currentState, prevRuleGroup} = this.state;
        this.setState({isLoading: true});
        let data = {rules: [], rulesToDelete: []};
        if (currentState === Constants.State.MULTIPLE) {
            data.rules = [];
            data.rulesToDelete = param.rules;
        } else {
            data.rulesToDelete = [param];
        }
        EvaluationRuleService
            .save(data)
            .then(result => {
                if (result.length === 0) {
                    switch (currentState) {
                        case Constants.State.ROOT:
                            this.setState({
                                currentState: Constants.State.EMPTY,
                                rules: []
                            })
                            break;
                        case Constants.State.SINGLE:
                            this.setState({currentState: Constants.State.ROOT});
                            this.setRules(Constants.ROOT_NAME)
                            break;
                        case Constants.State.MULTIPLE:
                            this.setState({currentState: Constants.State.SINGLE});
                            this.setRules(prevRuleGroup)
                            break;
                        default:
                            break;
                    }
                } else {
                    this.setRulesData(result);
                }
            })
            .catch(error => {
                this.handleHardError(error);
            })
            .finally(() => {
                this.setState({ isLoading: false });
            })
    }

    /**
     * Exports RuleGroup rules.
     * @param ruleGroup
     */
    handleExport = (ruleGroup) => {
        this.setState({isLoading: true});
        EvaluationRuleService
            .export(ruleGroup)
            .then(() => {
                this.setState({success: true});
            })
            .catch(error => {
                this.handleEasyError(error);
            })
            .finally(() => {
                this.setState({ isLoading: false });
            })
    };

    /**
     * Imports new rules from EXCEL file.
     * @param file to be imported.
     * @param sheetName to be imported.
     * @param init indicates if Root Evaluation is empty.
     */
    handleImport = (file, sheetName, init) => {
        init = init || false;
        this.setState({isLoading: true, show: false})
        const {ruleGroups, ruleGroup, ruleToOpen, errors} = this.state;
        if (init && ruleToOpen !== null && sheetName !== ruleToOpen.resultKey) {
            errors.push({id:ruleToOpen.priority, message: Constants.SHEET_NAME_AND_RESULT_KEY_ERROR})
            this.setState({errors: errors, show: false, isLoading: false});
            return;
        }
        let rule = init ? ruleToOpen : this.getImportRuleTemplate();
        EvaluationRuleService
            .import(file, sheetName, rule)
            .then(result => {
                if (!ruleGroups.find(r =>r===sheetName))
                    ruleGroups.push(sheetName);
                this.setRulesData(result);
                if (ruleGroup === Constants.ROOT_NAME)
                    this.setState({ruleGroups: ruleGroups, success: true, currentState: Constants.State.ROOT})
                else
                    this.setState({ruleGroups: ruleGroups, success: true})
            })
            .catch(error => {
                this.handleHardError(error);
            })
            .finally(() => {
                this.setState({ isLoading: false });
            })
    };

    /**
     * Adds new rule without updating database.
     * @param e
     */
    handleAddEmptyRule = e => {
        e.preventDefault();
        const {currentRulePriority, activePage, maxRules, currentState, checksum, ruleGroup} = this.state;

        let rules = Object.assign([], this.state.rules)
        const index = (activePage-1)*maxRules;
        const priority = !currentRulePriority ? 0 : currentRulePriority;

        if (currentState === Constants.State.OPEN || currentState === Constants.State.MULTIPLE) {
            if (currentState === Constants.State.OPEN) {
                const rule = Object.assign({},Constants.RuleTemplate());
                rule.prefix = Constants.TEMPLATE_RULE_SEPARATOR_AND;
                rule.suffix = Constants.GROUP_END_CHAR;
                rule.resultType = rules[priority].resultType;
                rule.resultKey = rules[priority].resultKey;
                rule.ruleGroup = ruleGroup;
                rule.ruleGroupChecksum = checksum;
                rules[priority].rules.push(rule);
                rules[priority].rules[0].prefix =
                    Constants.GROUP_START_CHAR.repeat(rules[priority].rules.length-1);
            } else {
                rules.splice(index, 0,
                    {
                        priority: index,
                        resultType: 3,
                        resultKey: Constants.DEFAULT_RESULT_KEY,
                        rules: []
                    })
                const rule = Object.assign({},Constants.RuleTemplate());
                rule.prefix = Constants.GROUP_START_CHAR;
                rule.resultType = rules[index].resultType;
                rule.resultKey = rules[index].resultKey;
                rule.ruleGroup = ruleGroup;
                rule.ruleGroupChecksum = checksum;
                rules[index].rules.push(rule);
                const secondRule = Object.assign({},Constants.RuleTemplate());
                secondRule.prefix = Constants.TEMPLATE_RULE_SEPARATOR_AND;
                secondRule.suffix = Constants.GROUP_END_CHAR
                secondRule.resultType = rules[index].resultType;
                secondRule.resultKey = rules[index].resultKey;
                secondRule.ruleGroup = ruleGroup;
                secondRule.ruleGroupChecksum = checksum;
                rules[index].rules.push(secondRule);
            }
            let i = 0;
            rules.forEach((rs, idx) => {
                rs.rules.forEach(r => {
                    r.priority = i;
                    i++;
                })
                rs.priority = idx;
            })
        } else  {
            if (currentState === Constants.State.ROOT && rules && rules.length > 1) {
                rules.splice(rules.length-1, 0, Object.assign({},Constants.RuleTemplate()))
            } else {
                rules.splice(index, 0, Object.assign({},Constants.RuleTemplate()))
            }
            for (let i = index; i < rules.length; i++) {
                rules[i].priority = i;
                rules[i].ruleGroup = ruleGroup;
                rules[i].ruleGroupChecksum = checksum;
            }
        }
        this.setState({rules: rules});
    }

    /**
     * Handle rules drag n drop.
     * @param result
     */
    handleDragEnd = result => {
        const { destination, source, reason } = result;
        if (!destination || reason === 'CANCEL') {
            const {currentState, droppedPageId} = this.state;

            if (currentState === Constants.State.OPEN || !droppedPageId) {
                this.setState({draggingRowId: null, dragging: false, droppedPageId: null});
                return;
            }
            const {rules: oldRules, maxRules} = this.state

            let rules = Object.assign([], oldRules);
            let d = (droppedPageId-1)*maxRules;
            const r1 = rules[source.index];
            const r2 = rules[d];
            rules.splice(source.index, 1);
            rules.splice(d, 0, r1);

            if (currentState === Constants.State.MULTIPLE) {
                let i = 0;
                rules.forEach((rs, id) => {
                    rs.rules.forEach(r => {
                        r.priority = i;
                        i++;
                    })
                    rs.priority = id
                })
            } else {
                const start = Math.min(r1.priority, r2.priority);
                const len = Math.max(r1.priority, r2.priority);
                for (let i = start; i <= len; i++) {
                    rules[i].priority = i;
                }
            }
            this.setState({rules: rules, draggingRowId: null, dragging: false, droppedPageId: null});
            return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            this.setState({dragging:false, droppedPageId:null})
            return;
        }

        const {rules, currentState, currentRulePriority} = this.state

        if (currentState === Constants.State.OPEN) {
            const priority = currentRulePriority;
            const r1 = rules[priority].rules[source.index];
            const r2 = rules[priority].rules[destination.index];
            let p = rules[priority].rules[0].priority;
            const len = rules[priority].rules.length;
            if (destination.index === 0) {
                r1.prefix = Constants.GROUP_START_CHAR.repeat(len-1);
                r1.suffix = ""
                rules[priority].rules[0].prefix = Constants.TEMPLATE_RULE_SEPARATOR_AND;
                rules[priority].rules[0].suffix = Constants.GROUP_END_CHAR;
            } else if (source.index === 0) {
                r1.prefix = Constants.TEMPLATE_RULE_SEPARATOR_AND;
                r1.suffix = Constants.GROUP_END_CHAR
                rules[priority].rules[1].prefix = Constants.GROUP_START_CHAR.repeat(len-1);
                rules[priority].rules[1].suffix = "";
            }
            //swap rules
            rules[priority].rules.splice(source.index, 1);
            rules[priority].rules.splice(destination.index, 0, r1);
            for (let i = 0; i < len; i++) {
                rules[priority].rules[i].priority = p;
                p++;
            }
        } else if (currentState === Constants.State.MULTIPLE) {
            const r1 = rules[source.index];
            //swap rules
            rules.splice(source.index, 1);
            rules.splice(destination.index, 0, r1);
            //swap priority
            let i = 0;
            rules.forEach((rs, id) => {
                rs.rules.forEach(r => {
                    r.priority = i;
                    i++;
                })
                rs.priority = id
            })
        } else  {
            const r1 = rules[source.index];
            const r2 = rules[destination.index];
            rules.splice(source.index, 1);
            rules.splice(destination.index, 0, r1);
            const start = Math.min(r1.priority, r2.priority);
            const len = Math.max(r1.priority, r2.priority);
            for (let i = start; i <= len; i++) {
                rules[i].priority = i;
            }
        }
        this.setState({rules: rules, dragging: false, droppedPageId: null});
    }

    /**
     * Handle open button click. Opens rules if exists else opens init modal.
     * @param rule
     * @returns {function(*): undefined}
     */
    handleOpen = (rule) => e => {
        e.preventDefault();
        const {currentState, ruleGroup, errors} = this.state;
        if (ruleGroup === rule.resultKey && rule.resultType === 1) {
            const error = {id: null, message: Constants.RULE_GROUP_AND_RESULT_KEY_ERROR};
            errors.push(error);
            this.setState({errors: errors})
            return;
        }
        if (currentState === Constants.State.MULTIPLE) {
            this.setState({
                currentRulePriority: rule.priority,
                currentState: Constants.State.OPEN,
                resultKey: rule.resultKey
            })
            return;
        }
        this.setState({ isLoading: true });
        EvaluationRuleService
            .getRulesByRuleGroup(rule.resultKey)
            .then(result => {
                if (result.length === 0) {
                    this.setState({show: true, ruleToOpen: rule, isLoading: false})
                    return;
                }
                switch(currentState) {
                    case Constants.State.ROOT:
                        this.setState({
                            currentState: Constants.State.SINGLE,
                        })
                        break;
                    case Constants.State.SINGLE:
                        this.setState({
                            prevRuleGroup: rule.ruleGroup,
                            currentState: Constants.State.MULTIPLE,
                        })
                        break;
                    default:
                        return;
                }
                this.setRulesData(result);
                this.setState({isLoading: false});
            })
            .catch(error => {
                this.handleHardError(error);
            })
    }

    /**
     * Handle back button click. Returns to prev app state.
     */
    handleBackButton = () => {
        const {currentState, prevRuleGroup, rules} = this.state;
        switch (currentState) {
            case Constants.State.ROOT:
                this.setState({
                    currentState: Constants.State.EMPTY,
                    isDragDisabled: true,
                    rules: [],
                    activePage: 1
                })
                break;
            case Constants.State.SINGLE:
                this.setState({
                    currentState: Constants.State.ROOT,
                    isDragDisabled: true, activePage: 1
                });
                this.setRules(Constants.ROOT_NAME)
                break;
            case Constants.State.MULTIPLE:
                this.setState({
                    currentState: Constants.State.SINGLE,
                    isDragDisabled: true, activePage: 1
                });
                this.setRules(prevRuleGroup)
                break;
            case Constants.State.OPEN:
                if (rules.length === 0) {
                    this.setState({
                        currentState: Constants.State.SINGLE,
                        isDragDisabled: true, activePage: 1
                    });
                    this.setRules(prevRuleGroup)
                    break;
                }
                this.setState({currentState: Constants.State.MULTIPLE});
                break;
            default:
                break;
        }
    }

    /**
     * Handle max rules dropdown. Sets max visible rules count.
     * @param event
     * @param value rules number to be seen.
     */
    handleMaxRulesDropdown = (event, {value}) => this.setState({maxRules: value, activePage: 1});

    /**
     * Handle page click.
     * @param activePage to be set.
     * @returns {function(*): void}
     */
    handlePageClick = activePage => e => this.setState({ activePage: activePage });

    /**
     * Handle start of drag n drop.
     * @param start
     */
    handleDragStart = start => this.setState({draggingRowId: start.draggableId, dragging: true});

    handleMouseOver = i => e => {
        const {dragging} = this.state;
        if (dragging)
            this.setState({droppedPageId: i})
    }

    handleMouseLeave = e => this.setState({droppedPageId: null});
    handleNextPage = e => {
        const {activePage, paginationLength} = this.state;
        if (activePage < paginationLength)
            this.setState({activePage: activePage+1})
    }
    handlePrevPage = e => {
        const {activePage} = this.state;
        if (activePage > 1)
            this.setState({activePage: activePage-1})
    }
    handleStartPage = e => this.setState({activePage: 1});
    handleEndPage = e => this.setState({activePage: this.state.paginationLength});
    handleDismissError = e => this.setState({errors: []});
    handleDismissSuccess = e => this.setState({success: false});
    handleClose = () => this.setState({show: false});
    handleShow = () => this.setState({show: true});
    handleEdit = () => {
        const {rules, currentRulePriority} = this.state;
        this.setState({
            copy: cloneDeep(rules),
            currentRulePriorityCopy: cloneDeep(currentRulePriority),
            isDragDisabled: false
        });
    }
    handleCancel = () => {
        const {copy, currentRulePriorityCopy} = this.state;
        if (copy.length !== 0)
            this.setState({
                rules: copy,
                currentRulePriority: currentRulePriorityCopy,
                currentRulePriorityCopy: 0,
                copy: [],
                isDragDisabled: true,
                rulesToDelete: []
            });
        else
            this.setState({isDragDisabled: true, rulesToDelete: []});
    }
    handlePathClick = (value, state) => e => {
        e.preventDefault();
        this.setRules(value);
        this.setState({currentState: state})
    }
    
    getImportRuleTemplate = () => {
        const {ruleGroup, checksum} = this.state;
        const rule = Constants.RuleTemplate();
        rule.ruleGroup = ruleGroup;
        rule.ruleGroupChecksum = checksum;
        return rule;
    }

    handleHardError = (error) => {
        if (error.rules)
            this.setRulesData(error.rules);
        this.handleEasyError(error);
    }
    handleEasyError = (error) => {
        if (error === 401) {
            this.logout();
        } else if (error.errors) {
            this.setState({errors: error.errors})
        } else if (error.title) {
            this.addError(error.title);
        } else if (error.message) {
            this.addError(error.message);
        } else if(typeof error === "string") {
            this.addError(error);
        }
    }
    addError = (error) => {
        const {errors} = this.state;
        errors.unshift({id: null, message: error})
        this.setState({errors: errors});
    }

    logout = () => {
        AuthService.logout();
        const {history, setCurrentUser} = this.props;
        setCurrentUser(null);
        localStorage.removeItem("evaluationrules");
        history.push("/signin")
    }

    render() {
        const {
            rules, currentRulePriority, ruleGroup,
            ruleGroups, isLoading, currentState,
            dragging, droppedPageId, activePage,
            maxRules, errors, show, isDragDisabled,
            success, prevRuleGroup, resultKey
        } = this.state;

        const open = currentState === Constants.State.OPEN &&
            currentRulePriority !== null;

        const rulesToShow = open ?
            rules[currentRulePriority].rules :
            rules;

        const paginationLength = Math.ceil(rulesToShow.length/maxRules);

        this.state.paginationLength = paginationLength;

        return (
            <Container>
                <Modal
                    closeIcon
                    basic
                    onClose={this.handleClose}
                    onOpen={this.handleShow}
                    open={show}
                >
                    <Modal.Header>
                        <h1>Init</h1>
                    </Modal.Header>
                    <Modal.Content>
                        <h3>RuleGroup is empty. Would you like to init it?</h3>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button.Group floated={"left"}>
                            <Import
                                handleImport={this.handleImport}
                                init={true}
                            />
                        </Button.Group>
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
                            inverted onClick={this.handleInitRuleGroup}
                        />
                    </Modal.Actions>
                </Modal>
                <TMessageGroup
                    isLoading={isLoading}
                    errors={errors}
                    success={success}
                    handleDismissSuccess={this.handleDismissSuccess}
                    handleDismissError={this.handleDismissError}
                />
                <TButtonGroup
                    currentState={currentState}
                    maxRules={maxRules}
                    ruleGroup={ruleGroup}
                    prevRuleGroup={prevRuleGroup}
                    resultKey={resultKey}
                    ruleGroups={ruleGroups}
                    isDragDisabled={isDragDisabled}
                    isLoading={isLoading}
                    handleBackButton={this.handleBackButton}
                    handlePathClick={this.handlePathClick}
                    handleRefresh={this.handleRefresh}
                    handleAddEmptyRule={this.handleAddEmptyRule}
                    handleSave={this.handleSave}
                    handleImport={this.handleImport}
                    handleExport={this.handleExport}
                    handleMaxRulesDropdown={this.handleMaxRulesDropdown}
                    handleAddRuleGroup={this.handleAddRuleGroup}
                    handleDeleteRuleGroup={this.handleDeleteRuleGroup}
                    handleEdit={this.handleEdit}
                    handleCancel={this.handleCancel}
                />
                <DragDropContext onDragEnd={this.handleDragEnd} onDragStart={this.handleDragStart}>
                    <Table celled stackable>
                        <THeader
                            currentState={currentState}
                            isDragDisabled={isDragDisabled}
                        />
                        <Droppable droppableId="table">
                            {(provided) => (
                                <Ref innerRef={provided.innerRef}>
                                    <Table.Body {...provided.droppableProps}>
                                        {
                                            (open ?
                                                    rulesToShow
                                                    :
                                                    rulesToShow
                                                        .slice((activePage-1)*maxRules,(activePage-1)*maxRules+maxRules)
                                            ).map((rule, idx) => {
                                                return (
                                                    <Draggable
                                                        draggableId={rule.priority.toString()}
                                                        index={idx+(activePage-1)*maxRules}
                                                        key={rule.priority}
                                                        isDragDisabled={isDragDisabled || isLoading}
                                                    >
                                                        {(provided, snapshot) => (
                                                            <Ref innerRef={provided.innerRef}>
                                                                <TRow
                                                                    currentState={currentState}
                                                                    provided={provided}
                                                                    snapshot={snapshot}
                                                                    rule={rule}
                                                                    isDragDisabled={isDragDisabled}
                                                                    priority={currentRulePriority}
                                                                    isLoading={isLoading}
                                                                    handleSave={this.handleSave}
                                                                    handleOpen={this.handleOpen}
                                                                    handleEasyDelete={this.handleEasyDelete}
                                                                    handleHardDelete={this.handleHardDelete}
                                                                />
                                                            </Ref>
                                                        )}
                                                    </Draggable>
                                                )
                                            })
                                        }
                                        {provided.placeholder}
                                    </Table.Body>
                                </Ref>
                            )}
                        </Droppable>
                        {
                            currentState !== Constants.State.OPEN && paginationLength > 1 &&
                            <TFooter
                                paginationLength={paginationLength}
                                dragging={dragging}
                                activePage={activePage}
                                droppedPageId={droppedPageId}
                                handlePageClick={this.handlePageClick}
                                onMouseOver={this.handleMouseOver}
                                onMouseLeave={this.handleMouseLeave}
                                handleStartPage={this.handleStartPage}
                                handlePrevPage={this.handlePrevPage}
                                handleNextPage={this.handleNextPage}
                                handleEndPage={this.handleEndPage}
                            />
                        }
                    </Table>
                </DragDropContext>
            </Container>
        );
    }
}

export default EvaluationRules;
