import React from "react";
import {Tab, Tabs} from 'react-bootstrap'
import {Team} from "./Player";

export class DraftedTeams extends React.Component<{ teams: Team[], selectedPick: number }, { key: any }> {

    key: any;

    constructor(props: any) {
        super(props);
        this.state = {
            key: "team1",
        };
    }

    render() {
        let {teams} = this.props;
        return (
            <Tabs id="suggested-player-tabs">
                {teams.map((team, idx) =>
                    (<Tab eventKey={idx} key={idx} title={"Team " + (idx + 1)}>
                        <div className={"panel-scrollable"}>
                            <h4>{team.name}</h4>
                            <ol>
                                {team.players.map((p, pIdx) => {
                                    return <li key={'team' + idx + pIdx}>{p.name + " " + p.position} </li>
                                })}
                            </ol>
                        </div>
                    </Tab>))}
            </Tabs>
        );
    }
}

export default DraftedTeams;
