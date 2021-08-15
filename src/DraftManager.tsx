import React from "react";
import PlayerTable from "./PlayerTable";
import {Player, Team, IDraftStatus} from "./Player";
import {Col, Container, Row} from "react-bootstrap";
import {PlayerUpload} from "./PlayerUpload";
import SuggestedPlayers from "./SuggestedPlayer";
import DraftedTeams from "./DraftedTeams";
import DraftByText from "./DraftByText"
import DraftStatus from "./DraftStatus";
import Utility from "./Utility";


interface IProps {
    teamCount: number

}

interface IState {
    availablePlayers: Player[];
    draftPicks: Player[];
    teams: Team[];
    draftStatus: IDraftStatus;
}

export class DraftManager extends React.Component<IProps, IState> {

    state: IState;

    constructor(props: any) {
        super(props);

        const populateTeams = (): Team[] => {
            return Array.from({length: props.teamCount}, () => ({
                players: []
            }));
        };

        const defaultDraftStatus = (): IDraftStatus => {
            return {
                currentTeam: 1,
                currentRound: 1,
                currentPick: 1
            }
        }

        this.state = {
            availablePlayers: [],
            draftPicks: [],
            teams: populateTeams(),
            draftStatus: defaultDraftStatus()
        };


    }


    render() {

        let {availablePlayers, draftPicks, teams, draftStatus} = this.state;

        const nextTurnSnake = (draftStatus: IDraftStatus) => {

            let updatedTeam, updatedRound;
            let updatedPick = draftStatus.currentPick + 1

            let count = updatedPick % (teams.length * 2);
            if (count === teams.length + 1 || count === 1) {
                //hold
                updatedTeam = draftStatus.currentTeam;
                updatedRound = draftStatus.currentRound + 1;
            } else if (count <= teams.length && count !== 0) {
                //increase
                updatedTeam = draftStatus.currentTeam + 1;
                updatedRound = draftStatus.currentRound;
            } else if (count > teams.length || count === 0) {
                //decrease
                updatedTeam = draftStatus.currentTeam - 1;
                updatedRound = draftStatus.currentRound;
            }

            return {
                currentTeam: updatedTeam,
                currentRound: updatedRound,
                currentPick: updatedPick
            }
        }

        const nextTurnSequential = (draftStatus: IDraftStatus) => {
            // increment current pick
            let updatedPick = draftStatus.currentPick + 1
            // depending on draft style, switch to next team
            let updatedTeam = draftStatus.currentTeam === teams.length ? 1 : draftStatus.currentTeam + 1;
            let updatedRound = draftStatus.currentTeam === teams.length ? draftStatus.currentRound + 1 : draftStatus.currentRound;
            return {
                currentTeam: updatedTeam,
                currentRound: updatedRound,
                currentPick: updatedPick
            }
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

                updatedDraftStatus = nextTurnSnake(updatedDraftStatus);

            }


            this.setState({
                availablePlayers: updatedAvailablePlayers,
                draftPicks: updatedDraftPicks,
                teams: updatedTeams,
                draftStatus: updatedDraftStatus
            })

        }


        return (
            <Container fluid>
                <Row>
                    <Col>
                        <button id={"players-upload-parent"} className={"btn btn-light"}>
                            <PlayerUpload value={availablePlayers}
                                          onChangeValue={setAvailablePlayers}/>
                        </button>
                    </Col>
                    <Col>
                        <DraftStatus currentRound={draftStatus.currentRound}
                                     currentTeam={draftStatus.currentTeam}
                                     currentPick={draftStatus.currentPick}/>
                    </Col>
                </Row>
                <Row>
                    <Col lg={6} md={12}>
                        {/*<h2 className={"panel"}>Suggestions</h2>*/}
                        {/*<SuggestedPlayers players={availablePlayers}/>*/}


                        <h2 className={"panel"}>Teams</h2>
                        <DraftedTeams teams={teams} selectedPick={draftStatus.currentTeam}/>
                    </Col>

                    <Col lg={6} md={12}>
                        <h2 className={"panel"}>Players</h2>
                        {/*<DraftByText availablePlayers={availablePlayers}*/}
                        {/*             draftedPlayers={draftPicks}*/}
                        {/*             onSubmit={draftPlayers}/>*/}

                        <PlayerTable availablePlayers={availablePlayers}
                                     onDraftPlayer={draftPlayers}
                                     onUpdatedAvailablePlayers={setAvailablePlayers}/>
                    </Col>
                </Row>
            </Container>
        );
    }

}