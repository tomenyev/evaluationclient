import React, {Component} from "react";

import AuthService from "../services/AuthService";
import {Button, Container, Divider, Form, Grid, Icon, Message, Segment} from "semantic-ui-react";
import {Route} from "react-router-dom";
import * as Constants from "../constants/Constants"

export default class Signup extends Component {
    constructor(props) {
        super(props);
        this.handleSignup = this.handleSignup.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);

        this.state = {
            username: "",
            password: "",
            usernameError: null,
            passwordError: null,
            error: null,
            isLoading: false
        };
    }

    componentDidMount() {
        if (AuthService.getCurrentUser()) {
            this.props.history.push("/");
        }
    }

    onChangeUsername(e) {
        const value = e.target.value;

        let usernameError = { content: '', pointing: 'below' };
        if (!value) {
            usernameError.content = Constants.USERNAME_IS_EMPTY;
        } else if (value.length < 5 || value.length >= 20) {
            usernameError.content = Constants.USERNAME_OUTSIDE_OF_BOUND;
        } else if (Constants.SPECIAL_CHAR_CHECK.test(value)) {
            usernameError.content = Constants.USERNAME_CONTAINS_SPECIAL_CHAR;
        } else {
            usernameError = null;
        }
        this.setState({username: value, usernameError: usernameError});
    }

    onChangePassword(e) {
        let passwordError = { content: '', pointing: 'below' };
        const value = e.target.value;
        if (!value) {
            passwordError.content = Constants.PASSWORD_IS_EMPTY;
        } else if (value.length < 8) {
            passwordError.content = Constants.PASSWORD_MIN;
        } else if (!Constants.SPECIAL_CHAR_CHECK.test(value)) {
            passwordError.content = Constants.PASSWORD_SPECIAL_CHAR
        } else if (!Constants.UPPER_AND_LOWER_CASE_CHECK.test(value)) {
            passwordError.content = Constants.PASSWORD_UPPER_N_LOWER_CASE;
        } else if (/ /.test(value)) {
            passwordError.content = Constants.PASSWORD_NO_SPACES;
        } else {
            passwordError = null;
        }

        this.setState({password: e.target.value, passwordError: passwordError});
    }

    handleSignup(e) {
        e.preventDefault();
        this.setState({isLoading: true})
        AuthService
            .signup(
                this.state.username,
                this.state.password
            )
            .then(data => {
                this.props.history.push("/signin");
            })
            .catch(error => {
                this.setState({isLoading: false, error: error});
            })
    }

    render() {
        const {isLoading, error, passwordError, usernameError, password, username} = this.state;

        return (
            <Container>
                <Segment placeholder>
                    <Grid columns={2} relaxed='very' stackable>
                        <Grid.Column>
                            <Form error>
                                {
                                    isLoading &&
                                    <Message icon>
                                        <Icon name='circle notched' loading/>
                                        <Message.Content>
                                            <Message.Header>Just one second</Message.Header>
                                            Processing action...
                                        </Message.Content>
                                    </Message>
                                }
                                <Message
                                    error
                                    header={"Error"}
                                    content={error}
                                    hidden={!Boolean(error)}
                                />
                                <Form.Input
                                    error={usernameError}
                                    fluid
                                    icon='user'
                                    iconPosition='left'
                                    label='Username'
                                    placeholder='Username'
                                    id='form-input-username'
                                    onChange={this.onChangeUsername}
                                />
                                <Form.Input
                                    error={passwordError}
                                    fluid
                                    icon='lock'
                                    iconPosition='left'
                                    type={"password"}
                                    label='Password'
                                    placeholder='Password'
                                    id='form-input-password'
                                    onChange={this.onChangePassword}
                                />
                                <Button
                                    disabled={!!passwordError || !!usernameError || !password || !username || isLoading}
                                    onClick={this.handleSignup}
                                    icon={"signup"}
                                    secondary
                                    content={"Sign up"}
                                />
                            </Form>
                        </Grid.Column>

                        <Grid.Column verticalAlign='middle'>
                            <Route render={({history}) => (
                                <Button
                                    icon={"sign-in"}
                                    content={"Sign in"}
                                    onClick={() => { history.push('/signin') }}
                                />
                            )}/>
                        </Grid.Column>
                    </Grid>

                    <Divider vertical>Or</Divider>
                </Segment>
            </Container>
        );
    }
}