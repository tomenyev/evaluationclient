export const GROUP_START_CHAR = "(";
export const GROUP_END_CHAR = ")";
export const RULE_SEPARATOR_AND = "&";
export const RULE_SEPARATOR_OR = "|";
export const TEMPLATE_RULE_SEPARATOR_AND = "AND";
export const TEMPLATE_RULE_SEPARATOR_OR = "OR";

export const isGroupStartChar = /^\(+$/;
export const isGroupEndChar = /^\)+$/;
export const isAnd = /^and$/i;
export const isOr = /^or$/i;
export const isAndOrOr = /^or$|^and$/i;
export const isAndOrGroupStartChar = /^\(+$|^and$/i;
export const isGroupStartOrEndChar = /^\(+$|^\)+$/;
export const isValidPrefix = /^\(+$|^and$|^or$|^()$/i;
export const isValidSuffix = /^\)+$|^()$/;
export const isValidOriginType = /^[a-z0-9]+$|^()$/i;

export const ROOT_NAME = Object.freeze("Root Evaluation");

export const DEFAULT_RESULT_KEY = Object.freeze("Null");

export const State = Object.freeze({
    EMPTY: 0,
    ROOT: 1,
    SINGLE: 2,
    MULTIPLE: 3,
    OPEN: 4
});
export const ResultType = Object.freeze({
    EVALUATE: 1,
    ACTION_PLAN: 3
});
export const Product = Object.freeze({
    AUTO_SHIFT_GEN2: 1,
    ULTRA_SHIFT_PLUS: 2,
    AUTO_SHIFT_GEN3: 3,
    PROCISION: 4,
    FULLER_ADVANTAGE: 11,
    ENDURANT: 14,
    UNKNOWN: null
})

export const RuleTemplate = () => {
    return {
        id: null,
        priority: null,
        ruleGroup: null,
        prefix: "",
        suffix: "",
        originType: "",
        componentSourceAddress: null,
        isEaton: null,
        productFamilyId: null,
        productCode: null,
        faultSourceAddress: null,
        faultCode: null,
        spn: "",
        fmi: null,
        isActive: null,
        isPrimaryFault: false,
        resultKey: "Null",
        resultType: 3,
        ruleGroupChecksum: null
    }
}

export const ResultTypes = Object.freeze(
    [
        Object.freeze({ key: 0, text: 'Evaluate', value: ResultType.EVALUATE }),
        Object.freeze({ key: 1, text: 'Action Plan', value: ResultType.ACTION_PLAN })
    ]
);

export const resultTypeToIndex = (value) => value === ResultType.ACTION_PLAN ? 1 : 0;

export const resultTypeToString = (value) =>
    value === ResultType.ACTION_PLAN ? "Action Plan" :
        value === ResultType.EVALUATE ? "Evaluate" : "Unknown";

export const ProductFamilyIds = Object.freeze(
    [
        Object.freeze({ key: 0, text: 'AutoShift Gen2', value: Product.AUTO_SHIFT_GEN2 }),
        Object.freeze({ key: 1, text: 'UltraShift PLUS', value: Product.ULTRA_SHIFT_PLUS }),
        Object.freeze({ key: 2, text: 'AutoShift Gen3', value: Product.AUTO_SHIFT_GEN3 }),
        Object.freeze({ key: 3, text: 'Procision', value: Product.PROCISION }),
        Object.freeze({ key: 4, text: 'Fuller Advantage', value: Product.FULLER_ADVANTAGE }),
        Object.freeze({ key: 5, text: 'Endurant', value: Product.ENDURANT }),
        Object.freeze({ key: 6, text: 'Unknown', value: Product.UNKNOWN })
    ]
)

export const productFamilyIdToString = (id) => {
    switch(id) {
        case Product.AUTO_SHIFT_GEN2:
            return "AutoShift Gen2";
        case Product.ULTRA_SHIFT_PLUS:
            return "UltraShift PLUS";
        case Product.AUTO_SHIFT_GEN3:
            return "AutoShift Gen3";
        case Product.PROCISION:
            return "Procision";
        case Product.FULLER_ADVANTAGE:
            return "Fuller Advantage";
        case Product.ENDURANT:
            return "Endurant";
        default:
            return "Unknown";
    }
}

export const productFamilyIdToIndex = (id) => {
    switch(id) {
        case Product.AUTO_SHIFT_GEN2:
            return 0;
        case Product.ULTRA_SHIFT_PLUS:
            return 1;
        case Product.AUTO_SHIFT_GEN3:
            return 2;
        case Product.PROCISION:
            return 3;
        case Product.FULLER_ADVANTAGE:
            return 4;
        case Product.ENDURANT:
            return 5;
        default:
            return 6;
    }
}

export const Operands = Object.freeze(
    [
        Object.freeze({key: 0, text: TEMPLATE_RULE_SEPARATOR_AND, value: TEMPLATE_RULE_SEPARATOR_AND}),
        Object.freeze({key: 1, text: TEMPLATE_RULE_SEPARATOR_OR, value: TEMPLATE_RULE_SEPARATOR_OR}),
    ]
)

export const getOperand = (value) => isAnd.test(value) ? 0 : 1;

export const MaxRulesOptions = Object.freeze(
    [
        Object.freeze({ key: 0, text: "10", value: 10 }),
        Object.freeze({ key: 1, text: "20", value: 20 }),
        Object.freeze({ key: 2, text: "30", value: 30 }),
        Object.freeze({ key: 3, text: "40", value: 40 }),
        Object.freeze( { key: 4, text: "50", value: 50 })
    ]
);

//error messages

export const DUPLICATE_ERROR = "Rule duplication error has occurred.";
export const ILLEGAL_RULE_FORMAT_ERROR = "Illegal rule format.";
export const PREFIX_AND_SUFFIX_ERROR = "Suffix and prefix are empty.";
export const ILLEGAL_EXPRESSION_ERROR = "Illegal expression format.";
export const EMPTY_FAULT_ERROR = "Fault is empty.";
export const EMPTY_COMPONENT_ERROR = "Component is empty.";
export const RULE_GROUP_AND_RESULT_KEY_ERROR = "Result Key must not be the same as Rule Group.";
export const INVALID_PREFIX_ERROR = "Must be OR or AND or (";
export const INVALID_SUFFIX_ERROR = "Must be )";
export const INVALID_CHARACTERS_ERROR = "Illegal characters have been detected.";
export const NOT_A_NUMBER_ERROR = "Must be a number.";
export const EMPTY_ERROR = "Must not be empty.";
export const SHEET_NAME_AND_RESULT_KEY_ERROR = "Sheetname must be the same as Result key.";
export const UNKNOWN_ERROR = "Unknown error has occurred.";

export const SPECIAL_CHAR_CHECK = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
export const USERNAME_IS_EMPTY = "Username must not be empty.";
export const PASSWORD_IS_EMPTY = "Password must not be empty.";
export const USERNAME_OUTSIDE_OF_BOUND = "Username must be between 5 and 20 characters.";
export const USERNAME_CONTAINS_SPECIAL_CHAR = "Username must not contain special characters.";

export const UPPER_AND_LOWER_CASE_CHECK = /[a-z].*[A-Z]|[A-Z].*[a-z]/;
export const PASSWORD_MIN = "Password must have at least 8 characters.";
export const PASSWORD_SPECIAL_CHAR = "Password must contain special character.";
export const PASSWORD_UPPER_N_LOWER_CASE = "Password must contain at least one upper and lowercase character.";
export const PASSWORD_NO_SPACES = "Password must not contain spaces.";

export const SAR_TEMPLATE = Object.freeze({
    id: 1,
    origin: Object.freeze({
        originType: "unknown"
    }),
    vehicle: Object.freeze({
        id: 1,
        components: Object.freeze([])
    }),
    faults: Object.freeze([]),
    location: Object.freeze({
        country: ""
    })
});
export const SAR_FAULT_TEMPLATE = Object.freeze({
    source: null,
    faultCode: null,
    spn: null,
    fmi: null,
    isActive: false,

    id: 1,
    protocol: 1,
    sessionDate: null,
    lampStatus: 0
});
export const SAR_COMPONENT_TEMPLATE = Object.freeze({
    sourceAddress: null,
    isEaton: null,
    productFamilyId: null,
    productCode: null,

    protocol: 1,
    make: "eaton",
    model: "unknown",
    serialNumber: null,
});

export const NO_COMPONENTS_ERROR = "SAR must have at least one component.";
export const NO_FAULTS_ERROR = "SAR must have at least one fault.";
export const EMPTY_COMPONENT_SOURCE_ADDRESS_ERROR = "Component Source Address must not be empty.";
export const EMPTY_SOURCE_FMI_SPN_ADDRESS_ERROR = "Fault Source Address, FMI, SPN must not be empty.";

export const API = Object.freeze("https://localhost:44316/api/");
export const AUTH_API = Object.freeze(API.concat("auth"));
export const EVALUATION_RULE_API = Object.freeze(API.concat("evaluationrule"));
export const EVALUATION_API = Object.freeze(API.concat("evaluation"));

