import React from "react";
import {Tab, Tabs} from 'react-bootstrap'
import {Team} from "./Player";
import ListGroup from "react-bootstrap/ListGroup";

export class DraftedTeams extends React.Component<{ teams: Team[], selectedPick: number }, { key: any }> {

    key: any;

    constructor(props: any) {
        super(props);
        this.state = {
            key: "1",
        };
    }

    render() {
        let {teams} = this.props;
        return (
            <Tabs id="suggested-player-tabs">
                {teams.map((team, idx) => (
                    <Tab eventKey={idx} key={idx} title={(idx + 1)}>
                        <ListGroup>
                            {team.players.length === 0 && <ListGroup.Item>Empty</ListGroup.Item>}
                            {team.players.length !== 0 &&
                            <ListGroup.Item>
                                <div className={"flex-parent"}>
                                    <span>QB: {team.players.filter(p => p.position === "QB").length}</span>
                                    <span>RB: {team.players.filter(p => p.position === "RB").length}</span>
                                    <span>WR: {team.players.filter(p => p.position === "WR").length}</span>
                                    <span>TE: {team.players.filter(p => p.position === "TE").length}</span>
                                </div>
                            </ListGroup.Item>}
                            {team.players.map((p, pIdx) =>
                                <ListGroup.Item>{(pIdx + 1) + " " + p.position + " " + p.name}</ListGroup.Item>
                            )}
                        </ListGroup>
                    </Tab>
                ))}
            </Tabs>
        );
    }
}

export default DraftedTeams;
