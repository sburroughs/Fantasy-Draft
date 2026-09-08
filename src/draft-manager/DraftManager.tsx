import React, {useEffect, useState} from "react";
import {Col, Container, Row} from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion"
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import draftConfig from '../config/DefaultConfig.json';
import '../Player.css'
import {DraftProvider, useDraftContext} from "./DraftContext";
import PlayerTable from "../player-table/PlayerTable";
import {PlayerUpload} from "../config/PlayerUpload";
import {AuctionPlayerUpload} from "../config/AuctionPlayerUpload";
import {MergePlayerData, MergeStatus} from "../config/MergePlayerData";
import DraftedTeams from "../draft-insight/DraftedTeams";
import SuggestedPlayersInsight from "../draft-insight/SuggestedPlayerInsight";
import AddPlayerModal from "../config/AddPlayerModal";
import SelectedPicks from "../draft-insight/SelectedPicks";
import TrendInsight from "../draft-insight/TrendInsight";
import DraftStatusInsight from "../draft-insight/DraftStatus";
import DraftSettingsModal from "../config/DraftSettingsModal";
import AuctionDraftModal from "../config/AuctionDraftModal";

interface Props {
    defaultTeamCount: number
}

function DraftLayout() {
    const {addPlayer, uploadAvailablePlayers, draftPlayers, undoDraftPicks, format, hasUploaded, hasMerged} = useDraftContext();
    const [mergeStatus, setMergeStatus] = useState<MergeStatus | null>(null);

    useEffect(() => {
        if (!hasMerged) setMergeStatus(null);
    }, [hasMerged]);

    return (
        <Container fluid>
            <Row>
                <Col lg={4} md={12}>
                    <DraftSettingsModal/>
                    {!hasUploaded &&
                    <Button id={"players-upload-parent"}>
                        {format === "auction" ?
                        <AuctionPlayerUpload onChangeValue={uploadAvailablePlayers}/> :
                        <PlayerUpload onChangeValue={uploadAvailablePlayers}/>}
                    </Button>}
                    {!hasMerged && <MergePlayerData onStatus={setMergeStatus}/>}
                    <Button onClick={() => undoDraftPicks(1)}>
                        Undo Pick
                    </Button>
                    <AddPlayerModal onAdd={addPlayer} onDraft={draftPlayers}/>
                </Col>
                <Col lg={8} md={12}>
                    <DraftStatusInsight playerTeam={draftConfig.draftPosition}/>
                </Col>
            </Row>
            {mergeStatus &&
            <Row>
                <Col lg={12}>
                    <Alert variant={mergeStatus.unmatched > 0 ? "warning" : "success"}
                           onClose={() => setMergeStatus(null)} dismissible className={"mt-2 mb-0"}>
                        <strong>Player data merged:</strong> {mergeStatus.matched} player{mergeStatus.matched === 1 ? '' : 's'} updated
                        {mergeStatus.unmatched > 0 &&
                        <> — {mergeStatus.unmatched} row{mergeStatus.unmatched === 1 ? '' : 's'} from the file couldn't be matched to a player</>}.
                    </Alert>
                </Col>
            </Row>}
            {format === "auction" && <AuctionDraftModal/>}
            <Row>
                <Col lg={4} md={12}>
                    <Accordion defaultActiveKey="0" flush className={'mb-2'}>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Suggestions</Accordion.Header>
                            <Accordion.Body>
                                <SuggestedPlayersInsight displayCount={draftConfig.display.suggestions.show}/>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Teams</Accordion.Header>
                            <Accordion.Body>
                                <DraftedTeams/>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>Picks</Accordion.Header>
                            <Accordion.Body>
                                <SelectedPicks/>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="3">
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
