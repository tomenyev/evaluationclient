import React, {Component} from "react";

import AuthService from "../services/AuthService";
import {Button, Container, Divider, Form, Grid, Icon, Message, Segment} from "semantic-ui-react";
import {Route} from "react-router-dom";
import * as Constants from "../constants/Constants"


class Signin extends Component {

    constructor(props) {
        super(props);
        this.handleSignin = this.handleSignin.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);

        this.state = {
            username: "",
            password: "",
            usernameError: null,
            passwordError: null,
            isLoading: false,
            error: null
        };
    }

    componentDidMount() {
        if (AuthService.getCurrentUser())
            this.props.history.push("/");
    }

    onChangeUsername(e) {
        const value = e.target.value;
        let usernameError = {content: '', pointing: 'below'};
        if (!value) {
            usernameError.content = Constants.USERNAME_IS_EMPTY;
        } else {
            usernameError = null;
        }
        this.setState({username: value, usernameError: usernameError});
    }

    onChangePassword(e) {
        let passwordError = {content: '', pointing: 'below'};
        const value = e.target.value;
        if (!value) {
            passwordError.content = Constants.PASSWORD_IS_EMPTY;
        } else {
            passwordError = null;
        }
        this.setState({password: e.target.value, passwordError: passwordError});
    }

    handleSignin(e) {
        e.preventDefault();

        this.setState({
            isLoading: true
        });

        const {username, password} = this.state;

        AuthService
            .signin(username, password)
            .then(user => {
                const {history, setCurrentUser} = this.props;
                setCurrentUser(user);
                history.push("/")
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
                                    onClick={this.handleSignin}
                                    icon={"sign-in"}
                                    content={"Sign in"}
                                />
                            </Form>
                        </Grid.Column>

                        <Grid.Column verticalAlign='middle'>
                            <Route render={({history}) => (
                                <Button
                                    icon={"signup"}
                                    content={"Sign up"}
                                    secondary
                                    onClick={() => {
                                        history.push('/signup')
                                    }}
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

export default Signin;