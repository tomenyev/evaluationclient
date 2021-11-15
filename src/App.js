import React, {Component} from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';

import AuthService from './services/AuthService';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import EvaluationRules from './pages/EvaluationRules';
import Evaluation from './pages/Evaluation'
import {Button, Icon, Menu} from "semantic-ui-react";

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentUser: null
        };

        this.setCurrentUser = this.setCurrentUser.bind(this);
    }

    componentDidMount() {
        const user = AuthService.getCurrentUser();
        this.setState({currentUser: user ? user : null});
    }

    setCurrentUser = (user) => this.setState({currentUser: user});

    render() {
        const {currentUser} = this.state;
        return (
            <Router>
                <div className="App">
                    <Menu secondary size={"massive"}>
                        <Menu.Menu position={"left"}>
                            <Route render={({history}) => (
                                <Menu.Item
                                    onClick={() => {
                                        history.push("/");
                                    }}
                                    name={"er"}
                                >
                                    <b>EvaluationAPI</b>
                                </Menu.Item>
                            )}/>
                        </Menu.Menu>
                        <Menu.Menu position={"left"}>
                            <Route render={({history}) => (
                                <Menu.Item
                                    onClick={() => {
                                        history.push("/evaluationrules")
                                    }}
                                >
                                    <Icon name={"edit outline"}/>
                                    Evaluation Rules
                                </Menu.Item>
                            )}/>
                            <Route render={({history}) => (
                                <Menu.Item onClick={() => {
                                    history.push("/evaluation")
                                }}>
                                    <Icon name={"bug"}/>
                                    Evaluation
                                </Menu.Item>
                            )}/>
                        </Menu.Menu>
                        {
                            currentUser ?
                                <Menu.Menu position='right'>
                                    <Menu.Item>
                                        <Route render={({history}) => (
                                            <Button
                                                icon="sign-out"
                                                secondary
                                                onClick={() => {
                                                    AuthService.logout();
                                                    history.push("/signin");
                                                    this.setState({currentUser: null})
                                                }}
                                            />
                                        )}/>
                                    </Menu.Item>
                                </Menu.Menu>
                                :
                                <Menu.Menu position='right'>
                                    <Menu.Item>
                                        <Button.Group size={"large"}>
                                            <Route render={({history}) => (
                                                <Button
                                                    icon={"sign-in"}
                                                    content={"Sign in"}
                                                    onClick={() => {
                                                        history.push('/signin')
                                                    }}
                                                />
                                            )}/>
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
                                        </Button.Group>
                                    </Menu.Item>
                                </Menu.Menu>
                        }
                    </Menu>
                    <div>
                        <Route
                            path={["/", "/evaluationrules"]}
                            exact
                            component={props => <EvaluationRules {...props} setCurrentUser={this.setCurrentUser}/>}
                        />
                        <Route
                            path={"/evaluation"}
                            exact
                            component={(props => <Evaluation {...props} setCurrentUser={this.setCurrentUser}/>)}
                        />
                        <Route
                            path="/signin"
                            exact
                            component={(props => <Signin {...props} setCurrentUser={this.setCurrentUser}/>)}
                        />
                        <Route
                            path="/signup"
                            exact
                            component={(props => <Signup {...props} setCurrentUser={this.setCurrentUser}/>)}
                        />
                    </div>
                </div>
            </Router>
        );
    }
}

export default App;
