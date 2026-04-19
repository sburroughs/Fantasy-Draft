import React from "react";
import {Col, Container, Row} from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion"
import Button from "react-bootstrap/Button";
import draftConfig from '../config/DefaultConfig.json';
import '../Player.css'
import {DraftProvider, useDraftContext} from "./DraftContext";
import PlayerTable from "../player-table/PlayerTable";
import {PlayerUpload} from "../config/PlayerUpload";
import DraftedTeams from "../draft-insight/DraftedTeams";
import SuggestedPlayersInsight from "../draft-insight/SuggestedPlayerInsight";
import AddPlayerModal from "../config/AddPlayerModal";
import SelectedPicks from "../draft-insight/SelectedPicks";
import TrendInsight from "../draft-insight/TrendInsight";
import ConfirmationModal from "../config/ConfirmationModal";
import DraftStatusInsight from "../draft-insight/DraftStatus";

interface Props {
    defaultTeamCount: number
}

function DraftLayout() {
    const {addPlayer, clearPlayers, setAvailablePlayers, draftPlayers, undoDraftPicks} = useDraftContext();

    return (
        <Container fluid>
            <Row>
                <Col lg={4} md={12}>
                    <Button id={"players-upload-parent"}>
                        <PlayerUpload onChangeValue={setAvailablePlayers}/>
                    </Button>
                    <ConfirmationModal buttonText={"Restart Draft"}
                                       onConfirm={() => undoDraftPicks(1000)}/>
                    <ConfirmationModal buttonText={"Clear Players"}
                                       onConfirm={clearPlayers}/>
                    <Button onClick={() => undoDraftPicks(1)}>
                        Undo Pick
                    </Button>
                    <AddPlayerModal onAdd={addPlayer} onDraft={draftPlayers}/>
                </Col>
                <Col lg={8} md={12}>
                    <DraftStatusInsight playerTeam={draftConfig.draftPosition}/>
                </Col>
            </Row>
            <Row>
                <Col lg={4} md={12}>

                    <Accordion defaultActiveKey="0" flush className={'my-2'}>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Suggestions</Accordion.Header>
                            <Accordion.Body>
                                <SuggestedPlayersInsight displayCount={draftConfig.display.suggestions.show}
                                                         onSubmit={draftPlayers}/>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>

                    <Accordion defaultActiveKey="0" flush className={'mb-2'}>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Teams</Accordion.Header>
                            <Accordion.Body>
                                <DraftedTeams/>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Picks</Accordion.Header>
                            <Accordion.Body>
                                <SelectedPicks/>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>Trends</Accordion.Header>
                            <Accordion.Body>
                                <TrendInsight/>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>

                </Col>
                <Col lg={8} md={12}>

                    <Accordion defaultActiveKey="0" flush className={'mt-2'}>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Players</Accordion.Header>
                            <Accordion.Body>
                                <PlayerTable/>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>

                </Col>
            </Row>
        </Container>
    );
}

export function DraftManager(_props: Props) {
    return (
        <DraftProvider>
            <DraftLayout/>
        </DraftProvider>
    );
}
