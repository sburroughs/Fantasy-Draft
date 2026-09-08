import React, {useState} from "react";
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import ToggleButton from "react-bootstrap/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import {AuctionSettings, DraftFormat} from "../common/Player";
import {useDraftContext} from "../draft-manager/DraftContext";
import ConfirmationModal from "./ConfirmationModal";

const POSITIONS: { key: keyof AuctionSettings["positionBudgets"], label: string }[] = [
    {key: "qb", label: "QB"},
    {key: "rb", label: "RB"},
    {key: "wr", label: "WR"},
    {key: "te", label: "TE"},
    {key: "k", label: "K"},
    {key: "def", label: "DEF"}
];

function DraftSettingsModal() {
    const {format, setFormat, auctionSettings, setAuctionSettings, teams, setTeamNames, clearPlayers, undoDraftPicks} = useDraftContext();
    const [show, setShow] = useState(false);
    const [draftAuctionSettings, setDraftAuctionSettings] = useState<AuctionSettings>(auctionSettings);
    const [draftTeamNames, setDraftTeamNames] = useState<string[]>(teams.map(t => t.name));

    const handleShow = () => {
        setDraftAuctionSettings(auctionSettings);
        setDraftTeamNames(teams.map(t => t.name));
        setShow(true);
    };
    const handleClose = () => setShow(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setAuctionSettings(draftAuctionSettings);
    };

    const handleTeamNamesSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setTeamNames(draftTeamNames);
    };

    const positionTotal = POSITIONS.reduce((sum, p) => sum + (draftAuctionSettings.positionBudgets[p.key] || 0), 0);

    return (
        <>
            <Button onClick={handleShow} title={"Draft Settings"}>
                ⚙️
            </Button>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Draft Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Label>Draft Format</Form.Label>
                    <div className={"mb-3"}>
                        <ToggleButtonGroup type="radio" name="draft-format" value={format}
                                           onChange={(v: DraftFormat) => setFormat(v)}>
                            <ToggleButton id={"format-snake"} value={"snake"} variant="outline-primary">
                                Snake
                            </ToggleButton>
                            <ToggleButton id={"format-auction"} value={"auction"} variant="outline-primary">
                                Auction
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </div>

                    <hr/>
                    <Form noValidate onSubmit={handleTeamNamesSubmit} className={"mb-3"}>
                        <Form.Label>Team Names</Form.Label>
                        {draftTeamNames.map((name, idx) =>
                            <Form.Group className="mb-2" key={idx}>
                                <Form.Label className="me-2">{idx + 1}</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={name}
                                    onChange={e => setDraftTeamNames(draftTeamNames.map((n, i) => i === idx ? e.target.value : n))}
                                />
                            </Form.Group>
                        )}
                        <Button variant="primary" type="submit">
                            Save Team Names
                        </Button>
                    </Form>

                    {format === "auction" &&
                    <Form noValidate onSubmit={handleSubmit} className={"mb-3"}>
                        <hr/>
                        <Form.Label>Auction Budget</Form.Label>
                        <Form.Group className="mb-3">
                            <Form.Label>Total Budget (per team)</Form.Label>
                            <Form.Control
                                type="number"
                                value={draftAuctionSettings.totalBudget}
                                onChange={e => setDraftAuctionSettings({
                                    ...draftAuctionSettings,
                                    totalBudget: Number(e.target.value)
                                })}
                            />
                        </Form.Group>
                        <Form.Label>Position Spending Caps</Form.Label>
                        {POSITIONS.map(({key, label}) =>
                            <Form.Group className="mb-2" key={key}>
                                <Form.Label className="me-2">{label}</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={draftAuctionSettings.positionBudgets[key]}
                                    onChange={e => setDraftAuctionSettings({
                                        ...draftAuctionSettings,
                                        positionBudgets: {
                                            ...draftAuctionSettings.positionBudgets,
                                            [key]: Number(e.target.value)
                                        }
                                    })}
                                />
                            </Form.Group>
                        )}
                        <p className={positionTotal > draftAuctionSettings.totalBudget ? "text-danger" : ""}>
                            Position caps total: ${positionTotal} / ${draftAuctionSettings.totalBudget}
                        </p>
                        <Button variant="primary" type="submit">
                            Save Budget
                        </Button>
                    </Form>}

                    <hr/>
                    <Form.Label>Danger Zone</Form.Label>
                    <div>
                        <ConfirmationModal buttonText={"Restart Draft"}
                                           onConfirm={() => undoDraftPicks(1000)}/>
                        {' '}
                        <ConfirmationModal buttonText={"Clear Players"}
                                           onConfirm={clearPlayers}/>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default DraftSettingsModal;
