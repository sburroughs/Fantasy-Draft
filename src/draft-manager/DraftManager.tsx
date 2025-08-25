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
    targetedPlayers: Player[];
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
            targetedPlayers: draftState().targetedPlayers ? draftState().targetedPlayers : [],
            draftPicks: draftState().draftPicks ? draftState().draftPicks : [],
            teams: draftState().teams ? draftState().teams : populateTeams(),
            draftStatus: draftState().draftStatus ? draftState().draftStatus : defaultDraftStatus()
        };

    }


    render() {

        let {availablePlayers, targetedPlayers, draftPicks, teams, draftStatus, lastSelectedPlayer} = this.state;

        const addPlayer = (player: Player) => {
            let updated: Player[] = availablePlayers;
            updated.push(player);

            // update local storage draft with updated available players.
            localStorage.setItem('draft', JSON.stringify({
                ...this.state,
                availablePlayers: updated
            }, undefined, 4));

            console.log("added player: " + player.name);

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
            let updatedTargetedPlayers = targetedPlayers;
            for (let player of players) {

                // remove player from available players.
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

                // adds to last draft pick.
                updatedDraftPicks.push(player);

                // progresses to next turn via selected draft style (snake).
                updatedDraftStatus = nextTurnSnake(updatedDraftStatus, teams);

                // update last selected player.
                updatedLastSelectedPlayer = player;

                // remove player from targeted players if it exists.
                updatedTargetedPlayers = updatedTargetedPlayers.filter(p => Utility.standardizeName(p.name) !== Utility.standardizeName(player.name));

            }

            let updated = {
                availablePlayers: updatedAvailablePlayers,
                draftPicks: updatedDraftPicks,
                teams: updatedTeams,
                draftStatus: updatedDraftStatus,
                lastSelectedPlayer: updatedLastSelectedPlayer,
                targetedPlayers: updatedTargetedPlayers
            };

            localStorage.setItem('draft', JSON.stringify(updated, undefined, 4));

            console.log("targets: " + updatedTargetedPlayers.map(p => p.name).join(", "));

            this.setState(updated)

        }

        const targetPlayers = (players: Player[]) => {
            let addPlayers = players.filter(p => !targetedPlayers.some(tp => Utility.standardizeName(tp.name) === Utility.standardizeName(p.name)))
            let updatedTargetedPlayers = [...targetedPlayers, ...addPlayers];

            // update local storage draft with updated targeted players.
            localStorage.setItem('draft', JSON.stringify({
                ...this.state,
                targetedPlayers: updatedTargetedPlayers
            }, undefined, 4));

            console.log("targets: " + updatedTargetedPlayers.map(p => p.name).join(", "));

            this.setState({
                targetedPlayers: updatedTargetedPlayers
            });
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

}