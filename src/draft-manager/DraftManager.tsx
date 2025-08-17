import React from "react";
import PlayerTable from "../player-table/PlayerTable";
import {CurrentDraftStatus, Player, Team} from "../common/Player";
import {Col, Container, Row} from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion"
import {PlayerUpload} from "../config/PlayerUpload";
import DraftedTeams from "../draft-insight/DraftedTeams";
import Utility from "../common/Utility";
import Button from "react-bootstrap/Button";
import SuggestedPlayersInsight from "../draft-insight/SuggestedPlayerInsight";
import draftConfig from '../config/DefaultConfig.json';
import '../Player.css'
import AddPlayerModal from "../config/AddPlayerModal";
import {nextTurnSnake, previousTurnSnake} from "./DraftProgressor";
import SelectedPicks from "../draft-insight/SelectedPicks";
import TrendInsight from "../draft-insight/TrendInsight";
import ConfirmationModal from "../config/ConfirmationModal";
import DraftStatusInsight from "../draft-insight/DraftStatus";

interface Props {
    defaultTeamCount: number
}

interface State {
    availablePlayers: Player[];
    draftPicks: Player[];
    teams: Team[];
    draftStatus: CurrentDraftStatus;
    lastSelectedPlayer?: Player;
}

export class DraftManager extends React.Component<Props, State> {

    state: State;

    constructor(props: any) {
        super(props);

        const draftState = (): any => {
            return localStorage.getItem("draft") ?
                JSON.parse(localStorage.getItem("draft") || "{}") :
                {
                    availablePlayers: [],
                    draftPicks: [],
                    teams: populateTeams(),
                    draftStatus: defaultDraftStatus()
                }
        };

        const populateTeams = (): Team[] => {
            const count = draftConfig.teamCount;
            return Array.from({length: count}, () => ({
                players: []
            }));
        };

        const defaultDraftStatus = (): CurrentDraftStatus => {
            return {
                currentTeam: 1,
                currentRound: 1,
                currentPick: 1,
                currentRoundPick: 1
            }
        };

        this.state = {
            availablePlayers: draftState().availablePlayers ? draftState().availablePlayers : [],
            draftPicks: draftState().draftPicks ? draftState().draftPicks : [],
            teams: draftState().teams ? draftState().teams : populateTeams(),
            draftStatus: draftState().draftStatus ? draftState().draftStatus : defaultDraftStatus()
        };

    }


    render() {

        let {availablePlayers, draftPicks, teams, draftStatus, lastSelectedPlayer} = this.state;

        const addPlayer = (player: Player) => {
            let updated: Player[] = availablePlayers;
            updated.push(player);

            localStorage.setItem('draft', JSON.stringify(updated, undefined, 4));

            this.setState({
                availablePlayers: updated
            });

        }

        const setAvailablePlayers = (players: any) => {
            this.setState({
                availablePlayers: players
            });
        }

        const draftPlayers = (players: Player[]) => {

            let updatedAvailablePlayers = availablePlayers;
            let updatedDraftPicks = draftPicks;
            let updatedDraftStatus = draftStatus;
            let updatedTeams: Team[] = teams;
            let updatedLastSelectedPlayer = lastSelectedPlayer;
            for (let player of players) {

                let availableAfterPick = updatedAvailablePlayers.filter(p => Utility.standardizeName(p.name) !== Utility.standardizeName(player?.name));
                if (updatedAvailablePlayers.length === availableAfterPick.length + 1) {
                    updatedAvailablePlayers = [...availableAfterPick];
                } else {
                    console.log("unexpected pick elimination: " + player.name);
                }

                // add player to current teams roster.
                let teamIndex = updatedDraftStatus.currentTeam - 1
                let currentTeam: Team = teams[teamIndex];
                currentTeam.players.push(player);
                updatedTeams[teamIndex] = currentTeam;

                updatedDraftPicks.push(player);

                updatedDraftStatus = nextTurnSnake(updatedDraftStatus, teams);

                updatedLastSelectedPlayer = player;

            }

            // updateRV(updatedAvailablePlayers);
            let updated = {
                availablePlayers: updatedAvailablePlayers,
                draftPicks: updatedDraftPicks,
                teams: updatedTeams,
                draftStatus: updatedDraftStatus,
                lastSelectedPlayer: updatedLastSelectedPlayer
            };

            localStorage.setItem('draft', JSON.stringify(updated, undefined, 4));

            this.setState(updated)

        }

        const undoDraftPicks = (picks: number) => {

            let updatedAvailablePlayers = availablePlayers;
            let updatedDraftPicks = [...draftPicks];
            let updatedDraftStatus = draftStatus;
            let updatedTeams: Team[] = teams;

            for (let i = 1; i <= picks; i++) {

                if (updatedDraftStatus.currentRound >= 1 && updatedDraftStatus.currentPick > 1) {

                    updatedDraftStatus = previousTurnSnake(updatedDraftStatus, updatedTeams);

                    // remove player from team back to available players .
                    let teamIndex = updatedDraftStatus.currentTeam - 1
                    let currentTeam: Team = updatedTeams[teamIndex];
                    let lastPlayer = currentTeam.players.pop();
                    updatedDraftPicks.pop();

                    if (lastPlayer) {
                        updatedTeams[teamIndex] = currentTeam;
                        updatedAvailablePlayers.push(lastPlayer);
                    }

                }

            }

            let updated = {
                availablePlayers: updatedAvailablePlayers,
                draftPicks: updatedDraftPicks,
                teams: updatedTeams,
                draftStatus: updatedDraftStatus
            };

            localStorage.setItem('draft', JSON.stringify(updated, undefined, 4));

            this.setState(updated)

        }


        return (
            <Container fluid>
                <Row>
                    <Col lg={4} md={12}>
                        <Button id={"players-upload-parent"}>
                            <PlayerUpload onChangeValue={setAvailablePlayers}/>
                        </Button>

                        <ConfirmationModal buttonText={"Restart Draft"}
                                           onConfirm={() => undoDraftPicks(1000)}></ConfirmationModal>

                        <Button onClick={() => undoDraftPicks(1)}>
                            Undo Pick
                        </Button>

                        <AddPlayerModal onAdd={addPlayer} onDraft={draftPlayers}></AddPlayerModal>


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
                                                 onDraftPlayer={draftPlayers}
                                                 onUpdatedAvailablePlayers={setAvailablePlayers}/>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>

                    </Col>
                </Row>
            </Container>
        );
    }

}