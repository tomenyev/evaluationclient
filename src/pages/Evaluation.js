import React, {Component} from 'react';
import {Button, Container, Divider, Grid, Segment} from "semantic-ui-react";
import AuthService from "../services/AuthService";
import Components from "../components/sar/Components";
import Faults from "../components/sar/Faults";
import * as Constants from "../constants/Constants"
import MessageGroup from "../components/sar/MessageGroup";
import EvaluationService from "../services/EvaluationService";
import cloneDeep from 'lodash/cloneDeep';
import Validator from "../Validator";

/**
 * Evaluation page.
 */
class Evaluation extends Component {

    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            success:  null,
            isLoading: null,
            faults: [],
            components: [],
        }
        this.setComponents = this.setComponents.bind(this);
        this.setFaults = this.setFaults.bind(this);

        this.handleEvaluate = this.handleEvaluate.bind(this);
        this.handleDismissError = this.handleDismissError.bind(this);
        this.handleDismissSuccess = this.handleDismissSuccess.bind(this);
    }

    componentDidMount() {
        const user = AuthService.getCurrentUser();
        if (!user) {
            this.props.history.push("/signin");
            return;
        }
        const state = JSON.parse(localStorage.getItem('evaluation'));
        if (state) {
            this.setState(state);
        }
    }

    componentWillUnmount() {
        localStorage.setItem("evaluation", JSON.stringify(this.state));
    }

    /**
     * Handle Evaluation, create, validate and evaluate SAR.
     * @param e
     */
    handleEvaluate = (e) => {
        e.preventDefault();
        this.setState({isLoading: true});
        const {components, faults} = this.state;
        const errors = Validator.validateSar(components, faults);
        if (Boolean(errors.length)) {
            this.setState({errors: errors, isLoading: false});
            return;
        }
        const data = cloneDeep(Constants.SAR_TEMPLATE);
        data.faults.push(...faults.map(fault => this.mapToSarFault(fault)));
        data.vehicle.components.push(...components.map(component => this.mapToSarComponents(component)));
        EvaluationService
            .evaluate(data)
            .then(result => {
                this.setState({success: result});
            })
            .catch(error => {
                this.handleError(error);
            })
            .finally(() => {
                this.setState({isLoading: false})
            })
    }

    /**
     * Handle error. Sets string error.
     * @param error
     */
    handleError = (error) => {
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

    /**
     * Adds string error to the state errors.
     * @param error
     */
    addError = (error) => {
        const {errors} = this.state;
        errors.unshift(error)
        this.setState({errors: errors});
    }

    /**
     * Dismiss error message.
     * @param e
     */
    handleDismissError = (e) => {
        e.preventDefault();
        this.setState({errors: []});
    }
    /**
     * Dismiss success message.
     * @param e
     */
    handleDismissSuccess = (e) => {
        e.preventDefault();
        this.setState({success: null});
    }
    setComponents = (components) => this.setState({components: components})
    setFaults = (faults) => this.setState({faults: faults})

    /**
     * Map app format component to SAR template component.
     * @param component
     * @returns {Readonly<{productFamilyId: null, protocol: number, sourceAddress: null, productCode: null, serialNumber: null, isEaton: null, model: string, make: string}>}
     */
    mapToSarComponents = (component) => {
        const sarComponent = Object.assign({}, Constants.SAR_COMPONENT_TEMPLATE);
        sarComponent["sourceAddress"] = component.componentSourceAddress;
        sarComponent["isEaton"] = component.isEaton;
        sarComponent["productFamilyId"] = component.productFamilyId;
        sarComponent["productCode"] = component.productCode;
        return sarComponent;
    }

    /**
     * Map app format fault to SAR template fault.
     * @param fault
     * @returns {Readonly<{spn: null, faultCode: null, protocol: number, fmi: null, sessionDate: null, source: null, id: number, isActive: boolean, lampStatus: number}>}
     */
    mapToSarFault = (fault) => {
        const sarFault = Object.assign({}, Constants.SAR_FAULT_TEMPLATE);
        sarFault["source"] = fault.faultSourceAddress;
        sarFault["faultCode"] = fault.faultCode;
        sarFault["spn"] = fault.spn;
        sarFault["fmi"] = fault.fmi;
        sarFault["isActive"] = fault.isActive;
        return sarFault;
    }

    render() {
        const {faults, components, isLoading, success, errors} = this.state;

        return (
            <Container>
                <Segment>
                    <h1>Service Activity Report</h1>
                    <MessageGroup
                        isLoading={isLoading}
                        success={success}
                        errors={errors}
                        handleDismissSuccess={this.handleDismissSuccess}
                        handleDismissError={this.handleDismissError}
                    />
                    <Segment basic>
                        <Grid columns={2} divided>
                            <Grid.Column width={8}>
                                <h3>Components</h3>
                                <Components
                                    setComponents={this.setComponents}
                                    components={components}
                                />
                            </Grid.Column>
                            <Grid.Column width={8}>
                                <h3>Faults</h3>
                                <Faults
                                    setFaults={this.setFaults}
                                    faults={faults}
                                />
                            </Grid.Column>
                        </Grid>
                        <Divider vertical hidden/>
                    </Segment>
                    <Segment basic textAlign={"right"}>
                        <Button
                            icon={"bug"}
                            size={"big"}
                            secondary
                            content={"Evaluate"}
                            onClick={this.handleEvaluate}
                        />
                    </Segment>
                </Segment>
            </Container>
        )
    }
}
export default Evaluation;

