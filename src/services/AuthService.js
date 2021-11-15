import axios from "axios";
import * as Constants from "../constants/Constants";

class AuthService {

    signin = (username, password) =>
        axios.post(Constants.AUTH_API + "/signin", {username, password})
            .then(response => {
                if (response.data.token)
                    localStorage.setItem("user", JSON.stringify(response.data));
                return response.data;
            })
            .catch(error => {
                if (error.response && error.response.data){
                    if (typeof error.response.data === "string")
                        throw error.response.data;
                    if (error.response.data.title)
                        throw error.response.data.title;
                }
                if (error.title)
                    throw error.title;
                if (error.message)
                    throw error.message;
                throw Constants.UNKNOWN_ERROR;
            });

    signup = (username, password) =>
        axios.post(Constants.AUTH_API + "/signup", {username, password})
            .then(response => {
                if (response.data.token)
                    localStorage.setItem("user", JSON.stringify(response.data));
                return response.data;
            })
            .catch(error => {
                if (error.response && error.response.data){
                    if (typeof error.response.data === "string")
                        throw error.response.data;
                    if (error.response.data.title)
                        throw error.response.data.title;
                }
                if (error.title)
                    throw error.title;
                if (error.message)
                    throw error.message;
                throw Constants.UNKNOWN_ERROR;
            });


    logout = () => localStorage.removeItem("user");

    getCurrentUser = () => JSON.parse(localStorage.getItem('user'));
}

export default new AuthService();