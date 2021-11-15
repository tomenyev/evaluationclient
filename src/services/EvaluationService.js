import axios from 'axios';
import authHeader from "../constants/AuthHeader";
import * as Constants from "../constants/Constants";

class EvaluationService {

    evaluate = (data) =>
        axios
            .post(
                Constants.EVALUATION_API,
                data,
                { headers: authHeader()
                })
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

export default new EvaluationService();
