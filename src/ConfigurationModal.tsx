import React, {useState} from "react";
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"

function ConfigurationModal() {
    const [show, setShow] = useState(false);
    const [valid, setValid] = useState(false);


    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [config, setConfig] = React.useState(
        localStorage.getItem('config') || '{}'
    );

    const handleSubmit = (event: any) => {

        event.preventDefault();
        event.stopPropagation();

        const form = event.currentTarget;

        try {
            let valid = JSON.parse(form[0].value);
            let updated = JSON.stringify(valid);
            console.log(updated);

            Object.entries(valid).forEach(([key, value]) => {
                localStorage.setItem('config.' + key, (value as string));
            })

            localStorage.setItem('config', updated);
            setConfig(updated);
            setValid(true);
            handleClose();

        } catch (e) {
            setValid(false);
        }

    };

    return (
        <>
            <Button onClick={handleShow}>
                Configuration
            </Button>


            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <Form noValidate validated={valid} onSubmit={handleSubmit}>

                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <Form.Label>Config</Form.Label>
                            <Form.Control as="textarea" defaultValue={config} rows={3}/>
                            <Form.Control.Feedback type="invalid">
                                Invalid Config
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                        <Button variant="primary" type="submit">
                            Save Changes
                        </Button>
                    </Form>

                </Modal.Body>

            </Modal>

        </>
    );
}

export default ConfigurationModal;
