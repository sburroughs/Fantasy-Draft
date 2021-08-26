import React from "react";
import PlayerTable from "./PlayerTable";
import {Player, Team, IDraftStatus} from "./Player";
import {Col, Container, Row} from "react-bootstrap";
import {PlayerUpload} from "./PlayerUpload";
import DraftedTeams from "./DraftedTeams";
import DraftStatus from "./DraftStatus";
import Utility from "./Utility";
import ConfigurationModal from "./ConfigurationModal";
import Button from "react-bootstrap/Button";
import SuggestedPlayers from "./SuggestedPlayer";
import draftConfig from './DefaultConfig.json';
import {updateRV} from "./PlayerService";


interface IProps {
    defaultTeamCount: number
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

        const getTeamCount = (): number => {
            return localStorage.getItem("config")
                ? localStorage.getItem("config.teamCount")
                : props.defaultTeamCount;
        };

        const populateTeams = (): Team[] => {
            return Array.from({length: getTeamCount()}, () => ({
                players: []
            }));
        };

        const defaultDraftStatus = (): IDraftStatus => {
            return {
                currentTeam: 1,
                currentRound: 1,
                currentPick: 1,
                currentRoundPick: 1
            }
        };

        //TODO: calling getTeamCount twice is lazy
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

            let updatedTeam, updatedRound, updatedRoundPick;
            let updatedPick = draftStatus.currentPick + 1

            let count = updatedPick % (teams.length * 2);
            if (count === teams.length + 1 || count === 1) {
                //hold
                updatedTeam = draftStatus.currentTeam;
                updatedRound = draftStatus.currentRound + 1;
                updatedRoundPick = 1;
            } else if (count <= teams.length && count !== 0) {
                //increase
                updatedTeam = draftStatus.currentTeam + 1;
                updatedRound = draftStatus.currentRound;
                updatedRoundPick = draftStatus.currentRoundPick + 1;
            } else if (count > teams.length || count === 0) {
                //decrease
                updatedTeam = draftStatus.currentTeam - 1;
                updatedRound = draftStatus.currentRound;
                updatedRoundPick = draftStatus.currentRoundPick + 1
            }

            return {
                currentTeam: updatedTeam,
                currentRound: updatedRound,
                currentRoundPick: updatedRoundPick,
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

            updateRV(updatedAvailablePlayers);

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
                    <Col lg={4} md={12}>
                        <Button id={"players-upload-parent"}>
                            <PlayerUpload onChangeValue={setAvailablePlayers}/>
                        </Button>

                        <ConfigurationModal/>

                    </Col>
                    <Col lg={8} md={12}>
                        <DraftStatus status={draftStatus} playerTeam={draftConfig.draftPosition}/>
                    </Col>
                </Row>
                <Row>
                    <Col lg={4} md={12}>
                        <h2 className={"panel"}>Suggestions</h2>
                        <SuggestedPlayers players={availablePlayers} onSubmit={draftPlayers}/>
                        <h2 className={"panel"}>Teams</h2>
                        <DraftedTeams teams={teams} selectedPick={draftStatus.currentTeam} draft={draftConfig}/>
                    </Col>

                    <Col lg={8} md={12}>
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