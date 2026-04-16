import React, {useState} from "react";
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import {NflTeam, NflTeams, Player} from "../common/Player";

function ConfigurationModal(props: { onAdd: (player: Player) => void, onDraft: (players: Player[]) => void }) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handle = (event: React.FormEvent<HTMLFormElement>) => {

        event.preventDefault();
        event.stopPropagation();

        const form = event.currentTarget;

        let name = (form[0] as HTMLInputElement).value;
        let position = (form[1] as HTMLSelectElement).value;
        let points = Number((form[2] as HTMLInputElement).value);
        let adp = Number((form[3] as HTMLInputElement).value);
        let team = (form[4] as HTMLSelectElement).value;

        const player: Player = {
            id: 0,
            name: name,
            adp: adp,
            points: points,
            age: 0,
            team: team,
            position: position,
            relativeValue: 0,
            tier: 0
        }

        const submitter = (event.nativeEvent as { submitter?: HTMLButtonElement }).submitter;
        if (submitter?.name === "add") {
            props.onAdd(player);
        }
        if (submitter?.name === "draft") {
            props.onDraft([player]);
        }

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
                    <Form noValidate onSubmit={handle}>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <Form.Label>Name</Form.Label>
                            <Form.Control as="input" defaultValue={""}/>
                            <Form.Label>Position</Form.Label>
                            <Form.Select aria-label="Select Player Position">
                                <option value="QB">QB</option>
                                <option value="RB">RB</option>
                                <option value="WR">WR</option>
                                <option value="TE">TE</option>
                                <option value="K">K</option>
                                <option value="DEF">DEF</option>
                            </Form.Select>
                            <Form.Label>Points</Form.Label>
                            <Form.Control as="input" defaultValue={"0"}/>
                            <Form.Label>ADP</Form.Label>
                            <Form.Control as="input" defaultValue={"999"}/>
                            <Form.Label>Teams</Form.Label>
                            <Form.Select aria-label="Select Player Team">
                                {NflTeams.map((team: NflTeam) =>
                                    <option key={team.code} value={team.code}>{team.code}</option>
                                )}
                            </Form.Select>
                        </Form.Group>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                        <Button variant="primary" name="add" type="submit">
                            Add
                        </Button>
                        <Button variant="primary" name="draft" type="submit">
                            Draft
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default ConfigurationModal;
