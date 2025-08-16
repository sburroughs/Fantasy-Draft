import React, {useState} from "react";
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"

function ConfirmationModal(props: { buttonText: string, onConfirm: any }) {
    const [show, setShow] = useState(false);

    const [valid, setValid] = useState(false);

    const handleClose = () => setShow(false);

    const handleShow = () => setShow(true);

    const handleSubmit = (event: any) => {

        event.preventDefault();
        event.stopPropagation();


        try {

            props.onConfirm()

            setValid(true);
            handleClose();

        } catch (e) {
            setValid(false);
        }
    };

    return (
        <>
            <Button onClick={handleShow}>
                {props.buttonText}
            </Button>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Are you Sure?</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <Form noValidate validated={valid} onSubmit={handleSubmit}>
                        <Button variant="primary" type="submit">
                            Confirm
                        </Button>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                    </Form>

                </Modal.Body>

            </Modal>

        </>
    );
}

export default ConfirmationModal;
