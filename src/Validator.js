import * as Constants from "./constants/Constants";

class Validator {

    constructor() {
        this.validators = {
            prefix: this.validatePrefix,
            suffix: this.validateSuffix,
            originType: this.validateOriginType,
            componentSourceAddress: this.validateComponentSourceAddress,
            productFamilyId: this.validateProductFaultId,
            productCode: this.validateProductCode,
            faultSourceAddress: this.validateFaultSourceAddress,
            faultCode: this.validateFaultCode,
            spn: this.validateSpn,
            fmi: this.validateFmi,
            resultKey: this.validateResultKey,
            ruleGroup: this.validateRuleGroup
        }
        this.keys = [
            "prefix",
            "suffix",
            "originType",
            "componentSourceAddress",
            "productFamilyId",
            "productCode",
            "faultSourceAddress",
            "faultCode",
            "spn",
            "fmi",
            "resultKey"
        ]
    }

    //start validate rules
    validateRules(data, currentState) {
        const errors = [];
        const expressions = [];
        if (currentState === Constants.State.MULTIPLE || currentState === Constants.State.OPEN) {
            data.forEach((rs) => {
                const es = this.validateMultipleRules(rs.rules, rs.priority);
                errors.push(...es.errors);
                const expressionError = this.validateDuplicates(es.expression, rs.priority);
                if (expressionError) {
                    errors.unshift(expressionError);
                } else {
                    errors.push(...this.validateExpressions(
                        expressions,
                        {id: rs.priority, expression: es.expression})
                    )
                    expressions.push({id: rs.priority, expression: es.expression});
                }
            })
        } else {
            const map = {};
            data.forEach((r) => {
                if (r.ruleGroup === Constants.ROOT_NAME) {
                    let key = this.generateComponentKey(r);
                    const value = map[key];
                    if (value === undefined) {
                        map[key] = {priority: r.priority, originType: r.originType};
                    }
                    else if (value.originType === r.originType) {
                        errors.push({
                            id: value.priority.toString() + ", " + r.priority.toString(),
                            message: Constants.DUPLICATE_ERROR
                        });
                    }
                } else {
                    let key = this.generateFaultKey(r);
                    const value = map[key];
                    if (value === undefined) {
                        map[key] = r.priority;
                    }
                    else {
                        errors.push({
                            id: value.toString() + ", " + r.priority.toString(),
                            message: Constants.DUPLICATE_ERROR
                        });
                    }
                }
                errors.push(...this.validateRule(r, currentState));
            })
        }
        return errors;
    }
    //end validate rules


    // start rule validation
    validateRule(rule, currentState) {
        const errors = [];
        this.keys.forEach(key => {
            const e = this.validators[key](rule[key]);
            if (e)
                errors.push({id: rule.priority, message: e});
        })

        const error2 = this.validateRuleGroupAndResultKey(rule);
        if (error2)
            errors.push({id: rule.priority, message: error2});

        if (currentState === Constants.State.ROOT) {
            const error3 = this.validateComponent(rule);
            if (error3 && rule.resultType !== Constants.ResultType.ACTION_PLAN)
                errors.push({id: rule.priority, message: error3});
        } else if (currentState === Constants.State.SINGLE) {
            const error4 = this.validateFault(rule);
            if (error4 && rule.resultType !== Constants.ResultType.EVALUATE)
                errors.push({id: rule.priority, message: error4});
        }

        return errors;
    }
    validateMultipleRules(rules, priority) {
        const errors = []
        let count = 0;
        let strRule = "";
        let valid = true;
        const expression = [];
        let expr = [];
        rules.forEach(r => {
            const id = priority.toString()+"."+r.priority;

            let key = this.generateFaultKey(r)

            if (Constants.isAndOrGroupStartChar.test(r.prefix)) {
                expr.push(key);
            }
            if (Constants.isOr.test(r.prefix)) {
                expression.push(expr);
                expr = [];
                expr.push(key);
            }

            let x,y;
            if (r.prefix) {
                x = (r.prefix.match(/\(/g) || []).length;
            }
            if (x > 0 && !this.isEmpty(r.suffix)) {
                valid = false;
            }
            if (r.suffix) {
                y = (r.suffix.match(/\)/g) || []).length;
            }
            if (y >= 0 && !Constants.isAndOrOr.test(r.prefix)) {
                valid = false;
            }
            if (x) {
                count += x;
                strRule += r.prefix;
                strRule += "R"+r.priority;
            } else if (y) {
                count -= y;
                strRule += r.prefix;
                strRule += "R"+r.priority;
                strRule += r.suffix;
            } else {
                strRule += r.prefix;
            }
            const es = this.validateMultipleRule(r, priority)
            if (es)
                errors.push(...es);
            this.keys.forEach(key => {
                const e = this.validators[key](r[key]);
                if (e)
                    errors.push({id: id, message: e});
            })
        })
        expression.push(expr);
        if (count !== 0 || !valid) {
            strRule = strRule.replaceAll(Constants.TEMPLATE_RULE_SEPARATOR_AND, Constants.RULE_SEPARATOR_AND)
            strRule = strRule.replaceAll(Constants.TEMPLATE_RULE_SEPARATOR_OR, Constants.RULE_SEPARATOR_OR)
            strRule = strRule.replaceAll("null", " ")
            errors.unshift({id:priority, message:Constants.ILLEGAL_RULE_FORMAT_ERROR + " <"+strRule+">."});
        }
        return {errors: errors, expression: expression};
    }
    validateMultipleRule(rule, priority) {
        const errors = [];
        const id = priority.toString()+"."+rule.priority;

        this.keys.forEach(key => {
            const e = this.validators[key](rule[key]);
            if (e)
                errors.push({id: id, message: e});
        })

        const error1 = this.validatePrefixAndSuffix(rule);
        if (error1)
            errors.push({id: id, message: error1});

        const error2 = this.validateFault(rule);
        if (error2)
            errors.push({id: id, message: error2});

        const error3 = this.validateRuleGroupAndResultKey(rule);
        if (error3)
            errors.push({id: id, message: error3});

        return errors;
    }
    // end rule validation

    //start complex validation
    validatePrefixAndSuffix(rule) {
        if (rule === null)
            return null;
        const prefix = rule.prefix;
        const suffix = rule.suffix;
        let error;
        if (this.isEmpty(suffix) && this.isEmpty(prefix)) {
            error = Constants.PREFIX_AND_SUFFIX_ERROR;
        } else if (Constants.isGroupStartOrEndChar.test(suffix) &&
            Constants.isGroupStartOrEndChar.test(prefix)) {
            error = Constants.ILLEGAL_EXPRESSION_ERROR
        } else if (Constants.isAndOrOr.test(suffix) && Constants.isAndOrOr.test(prefix)) {
            error = Constants.ILLEGAL_EXPRESSION_ERROR
        } else {
            error = null;
        }
        return error;
    }
    validateFault(rule) {
        if (!rule)
            return null;
        let error;
        if (this.isEmpty(rule.faultSourceAddress) && this.isEmpty(rule.faultCode) && this.isEmpty(rule.spn) && this.isEmpty(rule.fmi)) {
            error = Constants.EMPTY_FAULT_ERROR
        } else {
            error = null;
        }
        return error;
    }
    validateComponent(rule) {
        if (!rule)
            return null;
        let error;
        if (this.isEmpty(rule.componentSourceAddress) && this.isEmpty(rule.productFamilyId) && this.isEmpty(rule.productCode)) {
            error = Constants.EMPTY_COMPONENT_ERROR
        } else {
            error = null;
        }
        return error;
    }
    validateRuleGroupAndResultKey(rule) {
        if (!rule)
            return null;
        let error;
        if (rule.resultKey === rule.ruleGroup && rule.resultType === 1) {
            error = Constants.RULE_GROUP_AND_RESULT_KEY_ERROR;
        } else {
            error = null;
        }
        return error;
    }
    //end complex validation

    //start field validation
    validatePrefix(value) {
        if (!value)
            return null;
        let error;
        if (!Constants.isValidPrefix.test(value)) {
            error = Constants.INVALID_PREFIX_ERROR
        } else if (value.length > 30) {
            error = "MAX 30 characters"
        } else {
            error = null;
        }
        return error;
    }
    validateSuffix(value) {
        if (!value)
            return null;
        let error
        if (!Constants.isValidSuffix.test(value)) {
            error = Constants.INVALID_SUFFIX_ERROR;
        } else if (value.length > 30) {
            error = "MAX 30 characters"
        } else {
            error = null;
        }
        return error;
    }
    validateOriginType(value) {
        if (!value)
            return null;
        let error;
        if (!Constants.isValidOriginType.test(value)) {
            error = Constants.INVALID_CHARACTERS_ERROR;
        } else if (value.length > 3) {
            error = "max 3 characters"
        } else {
            error = null;
        }
        return error;
    }
    validateComponentSourceAddress(value) {
        if (!value)
            return null;
        let error;
        if (!/^\d+$|^()$/.test(value)) {
            error = Constants.NOT_A_NUMBER_ERROR;
        } else if (value < 0 || value > 255) {
            error = "<0-255>"
        } else {
            error = null;
        }
        return error;
    }
    validateProductFaultId(value) {
        if (!value)
            return null;
        let error;
        if (!/^\d+$|^()$/.test(value)) {
            error = Constants.NOT_A_NUMBER_ERROR;
        } else {
            error = null;
        }
        return error;
    }
    validateProductCode(value) {
        if (!value)
            return null;
        let error;
        if (!/^\d+$|^()$/.test(value)) {
            error = Constants.NOT_A_NUMBER_ERROR;
        } else {
            error = null;
        }
        return error;
    }
    validateFaultSourceAddress(value) {
        if (!value)
            return null;
        let error;
        if (!/^\d+$|^()$/.test(value)) {
            error = Constants.NOT_A_NUMBER_ERROR;
        } else {
            error = null;
        }
        return error;
    }
    validateFaultCode(value) {
        if (!value)
            return null;
        let error;
        if (!/^\d+$|^()$/.test(value)) {
            error = Constants.NOT_A_NUMBER_ERROR;
        } else {
            error = null;
        }
        return error;
    }
    validateSpn(value) {
        if (!value)
            return null;
        let error;
        if (!/^\d+$|^()$/.test(value) && value !== "") {
            error = Constants.NOT_A_NUMBER_ERROR;
        } else if (value.length > 6) {
            error = "max 6 characters"
        } else {
            error = null;
        }
        return error;
    }
    validateFmi(value) {
        if (!value)
            return null;
        let error;
        if (!/^\d+$|^()$/.test(value)) {
            error = Constants.NOT_A_NUMBER_ERROR;
        } else if (value < 0 || value > 255) {
            error = "<0-255>"
        } else {
            error = null;
        }
        return error;
    }
    validateRuleGroup(value) {
        let error;
        if (!value || value.trim() === "") {
            error = Constants.EMPTY_ERROR;
        } else if (value.length > 50) {
            error = "max 50 characters"
        } else {
            error = null;
        }
        return error;
    }
    validateResultKey(value) {
        let error;
        if (!value || value.trim() === "") {
            error = Constants.EMPTY_ERROR;
        } else if (value.length > 50) {
            error = "max 50 characters"
        } else {
            error = null;
        }
        return error;
    }
    //end field validation

    //start validator
    validateSar = (components, faults) => {
        const errors = [];
        if (!Boolean(components) || !Boolean(components.length)) {
            errors.push(Constants.NO_COMPONENTS_ERROR);
        } else {
            let componentError = null;
            for (let i = 0; i < components.length; i++) {
                componentError = this.validateSarComponent(components[i]);
                if (componentError) {
                    errors.push(componentError);
                    break;
                }
            }
        }
        if (!Boolean(faults) || !Boolean(faults.length)) {
            errors.push(Constants.NO_FAULTS_ERROR);
        } else {
            let faultError = null;
            for (let i = 0; i < faults.length; i++) {
                faultError = this.validateSarFault(faults[i]);
                if (faultError) {
                    errors.push(faultError);
                    break;
                }
            }
        }
        return errors;
    }
    validateSarComponent(component) {
        if (!component)
            return null;
        let error;
        if (this.isEmpty(component.componentSourceAddress)) {
            error = Constants.EMPTY_COMPONENT_SOURCE_ADDRESS_ERROR;
        } else {
            error = null;
        }
        return error;
    }
    validateSarFault(fault) {
        if (!fault)
            return null;
        let error;
        if (this.isEmpty(fault.fmi) || this.isEmpty(fault.faultSourceAddress) || this.isEmpty(fault.spn)) {
            error = Constants.EMPTY_SOURCE_FMI_SPN_ADDRESS_ERROR
        } else {
            error = null;
        }
        return error;
    }
    //end sar validator

    //start utils
    isEmpty(value) {
        return value === "" || value === null || value === undefined;
    }
    getValidators() {
        return this.validators;
    }
    getKeys() {
        return this.keys;
    }
    //end utils
    generateComponentKey(rule) {
        const sourceAddress = rule.componentSourceAddress || 0;
        const eaton = rule.isEaton || false;
        const productFamilyId = rule.productFamilyId || 0;
        const productCode = rule.productCode || 0;
        return sourceAddress.toString()
            .concat(
                ".", eaton.toString(),
                ".", productFamilyId.toString(),
                ".", productCode.toString()
            );
    }

    generateFaultKey(rule) {
        const sourceAddress = rule.faultSourceAddress || 0;
        const faultCode = rule.faultCode || 0;
        const spn = rule.spn || "";
        const fmi = rule.fmi || 0;
        const active = rule.isActive || false;
        return sourceAddress.toString()
            .concat(
                ".", faultCode.toString(),
                ".", spn.toString(),
                ".", fmi.toString(),
                ".", active.toString()
            );
    }

    validateExpressions(expressions, e) {
        const errors = [];
        for (let i = 0; i < expressions.length; i++) {
            if (this.compareExpressions(expressions[i].expression, e.expression)) {
                errors.push({
                    id: expressions[i].id.toString().concat(", ", e.id.toString()),
                    message: Constants.DUPLICATE_ERROR
                })
                break;
            }
        }
        return errors;
    }

    validateDuplicates(expression, priority) {
        for (let i = 0; i < expression.length; i++) {
            const e1 = this.validateExpressionDuplicate(expression[i], priority);
            if (e1)
                return e1;
            for (let j = i + 1; j < expression.length; j++) {
                const e2 = this.compareArraysAndSubArrays(expression[i], expression[j]);
                if (e2)
                    return {id: priority, message: Constants.ILLEGAL_EXPRESSION_ERROR};
            }
        }
        return false;
    }

    validateExpressionDuplicate(expression, priority) {
        const map = {};
        for (let i = 0; i < expression.length; i++) {
            if (Boolean(map[expression[i]])) {
                return {id: priority, message: Constants.DUPLICATE_ERROR};
            } else {
                map[expression[i]] = true;
            }
        }
        return false;
    }

    compareExpressions(expr1, expr2) {
        for (let i = 0; i < expr1.length; i++) {
            for (let j = 0; j < expr2.length; j++) {
                if (this.compareArrays(expr1[i], expr2[j])) {
                    return true;
                }
            }
        }
        return false;
    }

    compareArrays(_arr1, _arr2) {
        if (_arr1.length !== _arr2.length)
            return false;
        const arr1 = _arr1.concat().sort();
        const arr2 = _arr2.concat().sort();
        return arr1.every((value, index) => value === arr2[index]);
    }

    compareArraysAndSubArrays(_arr1, _arr2) {
        for (let i = 0; i < _arr1.length; i++) {
            for (let j = 0; j < _arr2.length; j++) {
                if (_arr1[i] === _arr2[j])
                    return true;
            }
        }
        return false;
    }
}

export default new Validator();