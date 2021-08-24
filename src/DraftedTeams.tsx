import React from "react";
import {Tab, Tabs} from 'react-bootstrap'
import {Team} from "./Player";
import ListGroup from "react-bootstrap/ListGroup";

export class DraftedTeams extends React.Component<{ teams: Team[], selectedPick: number, draft: any }, { key: any }> {

    key: any;

    constructor(props: any) {
        super(props);
        this.state = {
            key: "1",
        };
    }

    render() {
        let {teams, draft} = this.props;
        return (
            <Tabs id="suggested-player-tabs">
                {teams.map((team, idx) => (
                    <Tab eventKey={idx} key={idx} title={(idx + 1)}>
                        <ListGroup>
                            {team.players.length === 0 && <ListGroup.Item>Empty</ListGroup.Item>}
                            {team.players.length !== 0 &&
                            <ListGroup.Item>
                                <div className={"flex-parent"}>
                                    <span
                                        className={team.players.filter(p => p.position === "QB").length < draft.roster.starting.qb ? 'bg-danger' : 'bg-success'}>
                                        QB: {team.players.filter(p => p.position === "QB").length} / {draft.roster.max.qb}</span>
                                    <span
                                        className={team.players.filter(p => p.position === "RB").length < draft.roster.starting.rb ? 'bg-danger' : 'bg-success'}>
                                        RB: {team.players.filter(p => p.position === "RB").length} / {draft.roster.max.rb}</span>
                                    <span
                                        className={team.players.filter(p => p.position === "WR").length < draft.roster.starting.wr ? 'bg-danger' : 'bg-success'}>
                                        WR: {team.players.filter(p => p.position === "WR").length} / {draft.roster.max.wr}</span>
                                    <span
                                        className={team.players.filter(p => p.position === "TE").length < draft.roster.starting.te ? 'bg-danger' : 'bg-success'}>
                                        TE: {team.players.filter(p => p.position === "TE").length} / {draft.roster.max.te}</span>
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
