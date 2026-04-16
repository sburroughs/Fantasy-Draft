import React from "react";
import {Col, Container, Row} from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion"
import Button from "react-bootstrap/Button";
import draftConfig from '../config/DefaultConfig.json';
import '../Player.css'
import {useDraft} from "./useDraft";
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

export function DraftManager(_props: Props) {

    const {
        availablePlayers, targetedPlayers, draftPicks, teams, draftStatus, lastSelectedPlayer,
        addPlayer, setAvailablePlayers, draftPlayers, targetPlayers, undoDraftPicks
    } = useDraft();

    return (
        <Container fluid>
            <Row>
                <Col lg={4} md={12}>
                    <Button id={"players-upload-parent"}>
                        <PlayerUpload onChangeValue={setAvailablePlayers}/>
                    </Button>
                    <ConfirmationModal buttonText={"Restart Draft"}
                                       onConfirm={() => undoDraftPicks(1000)}/>
                    <Button onClick={() => undoDraftPicks(1)}>
                        Undo Pick
                    </Button>
                    <AddPlayerModal onAdd={addPlayer} onDraft={draftPlayers}/>
                </Col>
                <Col lg={8} md={12}>
                    <DraftStatusInsight status={draftStatus} playerTeam={draftConfig.draftPosition} lastSelectedPlayer={lastSelectedPlayer}/>
                </Col>
            </Row>
            <Row>
                <Col lg={4} md={12}>

                    <Accordion defaultActiveKey="0" flush className={'my-2'}>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Suggestions</Accordion.Header>
                            <Accordion.Body>
                                <SuggestedPlayersInsight players={availablePlayers}
                                                         targets={targetedPlayers}
                                                         currentTeam={teams[draftStatus.currentTeam - 1]}
                                                         displayCount={draftConfig.display.suggestions.show}
                                                         onSubmit={draftPlayers}/>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>

                    <Accordion defaultActiveKey="0" flush className={'mb-2'}>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Teams</Accordion.Header>
                            <Accordion.Body>
                                <DraftedTeams teams={teams}
                                              currentTeam={draftStatus.currentTeam}
                                              draft={draftConfig}/>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Picks</Accordion.Header>
                            <Accordion.Body>
                                <SelectedPicks picks={draftPicks}/>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>Trends</Accordion.Header>
                            <Accordion.Body>
                                <TrendInsight picks={draftPicks} teamCount={draftConfig.teamCount}/>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>

                </Col>
                <Col lg={8} md={12}>

                    <Accordion defaultActiveKey="0" flush className={'mt-2'}>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Players</Accordion.Header>
                            <Accordion.Body>
                                <PlayerTable availablePlayers={availablePlayers}
                                             targetedPlayers={targetedPlayers}
                                             onDraftPlayer={draftPlayers}
                                             onPlayerTargeted={targetPlayers}
                                             onUpdatedAvailablePlayers={setAvailablePlayers}/>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>

                </Col>
            </Row>
        </Container>
    );
}
