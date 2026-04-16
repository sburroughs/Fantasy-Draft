import React from "react";
import {Tab, Tabs} from 'react-bootstrap'
import {Player, Team} from "../common/Player";
import ListGroup from "react-bootstrap/ListGroup";
import draftConfig from "../config/DefaultConfig.json";

type DraftConfig = typeof draftConfig;

const TeamSummary = (props: { players: Player[], config: DraftConfig }) => {

    const qb = props.players.filter(p => p.position === "QB");
    const rb = props.players.filter(p => p.position === "RB");
    const wr = props.players.filter(p => p.position === "WR");
    const te = props.players.filter(p => p.position === "TE");

    const qbCount = qb.length;
    const rbCount = rb.length;
    const wrCount = wr.length;
    const teCount = te.length;

    const starting = props.config.roster.starting;
    const max = props.config.roster.max;

    const sumPoints = (a: number, b: Player) => a + b.points;

    return <div className={"flex-parent"}>
        <div>
            <p className={qbCount < starting.qb ? 'bg-danger' : 'bg-success'}>
                QB: {qbCount} / {max.qb}</p>
            <span>+{qb.slice(0, starting.qb).reduce(sumPoints, 0).toFixed(2)}</span>
        </div>
        <div>
            <p className={rbCount < starting.rb ? 'bg-danger' : 'bg-success'}>
                RB: {rbCount} / {max.rb}</p>
            <span>+{rb.slice(0, starting.rb).reduce(sumPoints, 0).toFixed(2)}</span>
        </div>
        <div>
            <p className={wrCount < starting.wr ? 'bg-danger' : 'bg-success'}>
                WR: {wrCount} / {max.wr}</p>
            <span>+{wr.slice(0, starting.wr).reduce(sumPoints, 0).toFixed(2)}</span>
        </div>
        <div>
            <p className={teCount < starting.te ? 'bg-danger' : 'bg-success'}>
                TE: {teCount} / {max.te}</p>
            <span>+{te.slice(0, starting.te).reduce(sumPoints, 0).toFixed(2)}</span>
        </div>
    </div>
}

export class DraftedTeams extends React.Component<{ teams: Team[], currentTeam: number, draft: DraftConfig }, { key: string, lastForcePick: string }> {

    constructor(props: { teams: Team[], currentTeam: number, draft: DraftConfig }) {
        super(props);
        this.state = {
            key: "0",
            lastForcePick: '0'
        };
    }

    componentDidUpdate() {
        const teamIndex = (this.props.currentTeam - 1).toString();
        if (teamIndex !== this.state.lastForcePick) {
            this.setState({
                key: teamIndex,
                lastForcePick: teamIndex
            });
        }
    }

    render() {
        let {teams, currentTeam, draft} = this.props;
        let {key} = this.state;

        const title = (idx: number, currentPick: number, yourTeam: number) => {
            let k = (idx + 1);
            let v: string = k.toString();
            v = (yourTeam === k ? "@" : "") + v;
            v = v + (currentPick === k ? "*" : "");
            return v;
        }

        const setKey = (k: string) => this.setState({key: k})
        return (
            <div className={'panel-scrollable'}>
                <Tabs id="suggested-player-tabs" activeKey={key} onSelect={(k) => setKey(k || '0')}>
                    {teams.map((team, idx) =>
                        <Tab eventKey={idx} key={idx} title={title(idx, currentTeam, draft.draftPosition)}>
                            <ListGroup>
                                {team.players.length === 0 && <ListGroup.Item>Empty</ListGroup.Item>}
                                {team.players.length !== 0 &&
                                <ListGroup.Item>
                                    <TeamSummary players={team.players} config={draft}></TeamSummary>
                                </ListGroup.Item>}
                                {team.players.map((p, pIdx) =>
                                    <ListGroup.Item key={p.id}>{"Round: " + (pIdx + 1) + " " + p.position + " " + p.name}</ListGroup.Item>
                                ).reverse()}
                            </ListGroup>
                        </Tab>
                    )}
                </Tabs>
            </div>
        );
    }
}

export default DraftedTeams;
