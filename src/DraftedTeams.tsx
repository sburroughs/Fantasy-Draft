import React from "react";
import {Tab, Tabs} from 'react-bootstrap'
import {Player, Team} from "./Player";
import ListGroup from "react-bootstrap/ListGroup";

const TeamSummary = (props: { players: Player[], config: any }) => {

    const qbCount = props.players.filter(p => p.position === "QB").length;
    const rbCount = props.players.filter(p => p.position === "RB").length;
    const wrCount = props.players.filter(p => p.position === "WR").length;
    const teCount = props.players.filter(p => p.position === "TE").length;

    const starting = props.config.roster.starting;
    const max = props.config.roster.max;

    return <div className={"flex-parent"}>
        <div>
            <span className={qbCount < starting.qb ? 'bg-danger' : 'bg-success'}>
                QB: {qbCount} / {max.qb}</span>
        </div>
        <div>
            <span className={rbCount < starting.rb ? 'bg-danger' : 'bg-success'}>
                RB: {rbCount} / {max.rb}</span>
        </div>
        <div>
            <span className={wrCount < starting.wr ? 'bg-danger' : 'bg-success'}>
                WR: {wrCount} / {max.wr}</span>
        </div>
        <div>
            <span className={teCount < starting.te ? 'bg-danger' : 'bg-success'}>
                TE: {teCount} / {max.te}</span>
        </div>
    </div>
}

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
                {teams.map((team, idx) => {


                    return (
                        <Tab eventKey={idx} key={idx} title={(idx + 1)}>
                            <ListGroup>
                                {team.players.length === 0 && <ListGroup.Item>Empty</ListGroup.Item>}
                                {team.players.length !== 0 &&
                                <ListGroup.Item>
                                    <TeamSummary players={team.players} config={draft}></TeamSummary>
                                </ListGroup.Item>}
                                {team.players.map((p, pIdx) =>
                                    <ListGroup.Item>{(pIdx + 1) + " " + p.position + " " + p.name}</ListGroup.Item>
                                )}
                            </ListGroup>
                        </Tab>
                    )
                })}
            </Tabs>
        );
    }
}

export default DraftedTeams;
