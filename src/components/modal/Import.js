import React, {Component} from "react";
import {Button, Form, Icon, Input, Label, Modal} from "semantic-ui-react";
import Dropzone from "react-dropzone";
import * as XLSX from 'xlsx'

/**
 * Import evaluation rules as excel file modal.
 */
class Import extends Component {

    fileInputRef = React.createRef();

    constructor(props) {
        super(props);
        this.state = {
            enter: false,
            open: false,
            select: true,
            file: null,
            fileName: "",
            sheetName: null,
            sheetNames: [],
            isUploading: false,
        };
        this.handleEnter = this.handleEnter.bind(this);
        this.handleLeave = this.handleLeave.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleConfirm = this.handleConfirm.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleSetSheetNames = this.handleSetSheetNames.bind(this);
    }

    /**
     * Reset current state and close modal.
     */
    handleClose = () =>
        this.setState({
            open: false,
            select: true,
            file: null,
            fileName: "",
            isUploading: false,
            sheetNames: [],
            sheetName: null,
            enter: false
        });

    handleOpen = () => this.setState({open: true});

    /**
     * Handle confirm and import selected file.
     * @param e
     */
    handleConfirm = e => {
        e.preventDefault();
        const {file, sheetName} = this.state;
        const {handleImport, init} = this.props;
        handleImport(file, sheetName, init);
        this.handleClose();
    };

    /**
     * Reset state and close modal.
     * @param e
     */
    handleCancel = e => {
        e.preventDefault();
        this.setState({
            select: true,
            file: null,
            fileName: "",
            isUploading: false,
            sheetNames: [],
            sheetName: null,
            enter: false
        })
    }

    /**
     * Handle file change. Process file and get file sheetnames.
     * @param e
     */
    handleFileChange = e => {
        e.preventDefault();
        let sheetNames = null;
        const files = e.target.files, f = files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = e.target.result;
            const readedData = XLSX.read(data, {type: 'binary'});
            sheetNames = readedData.SheetNames
                .map((s, index) => {
                    return {key: index, text: s, value: s}
                });
            this.handleSetSheetNames(sheetNames, f);
        }.bind(this);
        reader.readAsBinaryString(f)
    };

    /**
     * Handle drag n drop. Process file and get file sheetnames.
     * @param acceptedFiles
     * @param rejectedFiles
     */
    handleDrop(acceptedFiles, rejectedFiles) {
        let sheetNames = null;
        const f = acceptedFiles[0];
        if (f === undefined) {
            this.setState({
                select: true,
                file: null,
                fileName: "",
                isUploading: false,
                sheetNames: [],
                sheetName: null,
                enter: false
            })
            return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = e.target.result;
            const readedData = XLSX.read(data, {type: 'binary'});
            sheetNames = readedData.SheetNames
                .map((s, index) => {
                    return {key: index, text: s, value: s}
                });
            this.handleSetSheetNames(sheetNames, f);
        }.bind(this);
        reader.readAsBinaryString(f)
    }

    /**
     * Handle select sheetname to import.
     * @param e
     * @param value sheetname to be imported.
     */
    handleSelect = (e, {value}) => this.setState({sheetName: value})

    handleEnter(e) {
        e.preventDefault();
        this.setState({enter: true})
    }

    handleLeave(e) {
        e.preventDefault();
        this.setState({enter: false})
    }

    handleSetSheetNames(sheetNames, f) {
        this.setState({
            file: f,
            fileName: f.name,
            select: false,
            enter: false,
            sheetNames: sheetNames
        });
    }

    render() {
        const {open, enter, select, fileName, sheetNames, sheetName} = this.state;
        const {init} = this.props;

        return (
            <Modal
                closeIcon
                onClose={this.handleClose}
                onOpen={this.handleOpen}
                open={open}
                trigger={
                    init ?
                        <Button size={"big"} inverted icon={"upload"}/>
                        :
                        <Button icon={"upload"}/>
                }
            >
                <Modal.Header>
                    Import
                </Modal.Header>
                <Dropzone
                    noClick={true}
                    multiple={false}
                    preventDropOnDocument={true}
                    canCancel={false}
                    onDrop={this.handleDrop}
                    accept={[".xlsm", ".xlsx"]}
                    onDragEnter={this.handleEnter}
                    onDragLeave={this.handleLeave}
                >
                    {
                        ({getRootProps}) => (
                            <div {...getRootProps({className: "dropzone", style: {outline: "none"}})}>
                                <div className={!enter ? "" : "bordered"}>
                                    <Modal.Content>
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: "100%",
                                            height: "30rem"
                                        }}>
                                            {
                                                select ?
                                                    <div>
                                                        <Button
                                                            size={"big"}
                                                            onClick={() => this.fileInputRef.current.click()}
                                                        >
                                                            <Icon name={"file excel outline"}/>
                                                            Select or drag-n-drop file
                                                        </Button>
                                                        <input
                                                            ref={this.fileInputRef}
                                                            type="file"
                                                            hidden
                                                            onChange={this.handleFileChange}
                                                        />
                                                    </div>
                                                    :
                                                    <div style={{width: "80%"}}>
                                                        <Form>
                                                            <Form.Select
                                                                options={sheetNames}
                                                                placeholder={"Sheet Name"}
                                                                error={!sheetName}
                                                                onChange={this.handleSelect}
                                                            />
                                                            <Form.Group inline widths={"16"}>
                                                                <Form.Field inline width={"16"}>
                                                                    <Label size="large">Name:</Label>
                                                                    <Input readOnly value={fileName}/>
                                                                </Form.Field>
                                                                <Form.Button
                                                                    negative
                                                                    icon="cancel"
                                                                    onClick={this.handleCancel}
                                                                />
                                                            </Form.Group>
                                                        </Form>
                                                    </div>
                                            }

                                        </div>
                                    </Modal.Content>
                                </div>
                            </div>
                        )
                    }
                </Dropzone>
                <Modal.Actions>
                    <Button
                        negative
                        icon={"delete"}
                        onClick={this.handleClose}
                    />
                    <Button
                        positive
                        icon={"check"}
                        onClick={this.handleConfirm}
                        disabled={!sheetName}
                    />
                </Modal.Actions>
            </Modal>
        )
    }
}

export default Import;