import React, {useState} from "react";
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import {Player} from "./Player";

function ConfigurationModal(props: { onSubmit: any }) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleSubmit = (event: any) => {

        event.preventDefault();
        event.stopPropagation();

        const form = event.currentTarget;

        let value = form[0].value;

        console.log(value);

        const player: Player = {
            id: 0,
            name: value,
            adp: 999,
            points: 0,
            relativeValue: 0,
            position: "ASS",
            tier: 0,
            team: "BUTT"
        }
        props.onSubmit(player);

    };

    return (
        <>
            <Button onClick={handleShow}>
                Add Player
            </Button>


            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title> Add Player </Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <Form noValidate onSubmit={handleSubmit}>

                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <Form.Label>Name</Form.Label>
                            <Form.Control as="input" defaultValue={""}/>
                            <Form.Control.Feedback type="invalid">
                                Invalid Name
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                        <Button variant="primary" type="submit">
                            Add
                        </Button>
                    </Form>

                </Modal.Body>

            </Modal>

        </>
    );
}

export default ConfigurationModal;
