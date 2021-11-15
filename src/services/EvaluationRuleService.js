import axios from 'axios';
import authHeader from "../constants/AuthHeader";

import * as FileSaver from "file-saver";
import * as Constants from "../constants/Constants";

class EvaluationRuleService {

    getRuleGroups = () =>
        axios.get(Constants.EVALUATION_RULE_API+'/ruleGroup',
            { headers: authHeader() }
            )
            .then(res => {
                let ruleGroups = [];
                if (res.data)
                    ruleGroups = res.data
                return ruleGroups;
            })
            .catch(error => {
                if (error.response && error.response.status === 401)
                    throw 401;
                if (error.response && error.response.data)
                    throw error.response.data;
                if (error.title)
                    throw error.title;
                if (error.message)
                    throw error.message;
                throw Constants.UNKNOWN_ERROR;
            });

    getRulesByRuleGroup = (value) =>
        axios.get(Constants.EVALUATION_RULE_API+'/'+value, { headers: authHeader() })
            .then(res => {
                let result = []
                if (res.data)
                    result = res.data;
                return result;
            })
            .catch(error => {
                if (error.response && error.response.status === 401)
                    throw 401;
                if (error.response && error.response.data)
                    throw error.response.data;
                if (error.title)
                    throw error.title;
                if (error.message)
                    throw error.message;
                throw Constants.UNKNOWN_ERROR;
            });

    export = ruleGroup =>
        axios.get(Constants.EVALUATION_RULE_API+ '/export?ruleGroup='+ruleGroup, {
            headers: authHeader(),
            responseType: 'arraybuffer'
        })
            .then(response => {
                const fileType =
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
                const fileExtension = ".xlsx";
                const data = new Blob([response.data], { type: fileType });
                FileSaver.saveAs(data, ruleGroup + fileExtension);
                return [];
            })
            .catch(error => {
                if (error.response && error.response.status === 401)
                    throw 401;
                if (error.response && error.response.data)
                    throw error.response.data;
                if (error.title)
                    throw error.title;
                if (error.message)
                    throw error.message;
                throw Constants.UNKNOWN_ERROR;
            });

    import = (file, sheetName, rule) => {
        const formData = new FormData();

        if (rule.ruleGroupChecksum === null)
            rule.ruleGroupChecksum = 0;

        formData.append("file", file);
        formData.append("sheetName", sheetName)
        formData.append("rule", JSON.stringify(rule))

        return axios.post(
            Constants.EVALUATION_RULE_API+'/import',
            formData,
            {
                headers:
                    {
                        Authorization: authHeader().Authorization,
                        'content-type': 'multipart/form-data'
                    }
            })
            .then(response => {
                return response.data;
            })
            .catch(error => {
                if (error.response && error.response.status === 401)
                    throw 401;
                if (error.response && error.response.data)
                    throw error.response.data;
                if (error.title)
                    throw error.title;
                if (error.message)
                    throw error.message;
                throw Constants.UNKNOWN_ERROR;
            });
    };

    deleteRuleGroup = ruleGroup =>
        axios.delete(Constants.EVALUATION_RULE_API+ '/'+ruleGroup, { headers: authHeader(), data: {ruleGroup: ruleGroup} })
            .then(response => {
                let data = [];
                if (response.data)
                    data = response.data;
                return data;
            })
            .catch(error => {
                if (error.response && error.response.status === 401)
                    throw 401;
                if (error.response && error.response.data)
                    throw error.response.data;
                if (error.title)
                    throw error.title;
                if (error.message)
                    throw error.message;
                throw Constants.UNKNOWN_ERROR;
            });

    save = (data) =>
        axios.post(Constants.EVALUATION_RULE_API+"/save", data, { headers: authHeader() })
            .then(res => {
                return res.data;
            })
            .catch(error => {
                if (error.response && error.response.status === 401)
                    throw 401;
                if (error.response && error.response.data)
                    throw error.response.data;
                if (error.title)
                    throw error.title;
                if (error.message)
                    throw error.message;
                throw Constants.UNKNOWN_ERROR;
            });

    initRoot = () =>
        axios.post(Constants.EVALUATION_RULE_API+"/init", [], { headers: authHeader() })
            .then(res => {
                return res.data;
            })
            .catch(error => {
                if (error.response && error.response.status === 401)
                    throw 401;
                if (error.response && error.response.data)
                    throw error.response.data;
                if (error.title)
                    throw error.title;
                if (error.message)
                    throw error.message;
                throw Constants.UNKNOWN_ERROR;
            });

    addRuleGroup = (rule, multiple) => {
        const data = {
            rule: rule,
            multiple: multiple
        }
        return axios.post(Constants.EVALUATION_RULE_API+"/ruleGroup", data, { headers: authHeader() })
            .then(res => {
                return res.data;
            })
            .catch(error => {
                if (error.response && error.response.status === 401)
                    throw 401;
                if (error.response && error.response.data)
                    throw error.response.data;
                if (error.title)
                    throw error.title;
                if (error.message)
                    throw error.message;
                throw Constants.UNKNOWN_ERROR;
            });
    }
}

export default new EvaluationRuleService();
