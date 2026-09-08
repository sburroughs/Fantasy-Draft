import React, {useEffect, useState} from "react";
import {Tab, Tabs} from 'react-bootstrap'
import {AuctionSettings, Player, Team} from "../common/Player";
import ListGroup from "react-bootstrap/ListGroup";
import draftConfig from "../config/DefaultConfig.json";
import {useDraftContext} from "../draft-manager/DraftContext";
import * as AuctionCalculator from "../common/AuctionCalculator";

type DraftConfig = typeof draftConfig;

const AuctionTeamSummary = ({team, auctionSettings}: { team: Team, auctionSettings: AuctionSettings }) => {
    const positions: { key: keyof AuctionSettings["positionBudgets"], label: string }[] = [
        {key: "qb", label: "QB"},
        {key: "rb", label: "RB"},
        {key: "wr", label: "WR"},
        {key: "te", label: "TE"}
    ];

    return <div className={"flex-parent"}>
        <div>
            <p className={team.budget <= 0 ? 'bg-danger' : 'bg-success'}>
                Budget: ${team.budget} / ${auctionSettings.totalBudget}</p>
        </div>
        {positions.map(({key, label}) => {
            const spent = AuctionCalculator.positionSpend(team, label);
            const cap = auctionSettings.positionBudgets[key];
            const count = team.players.filter(p => p.position === label).length;
            return (
                <div key={key}>
                    <p className={spent > cap ? 'bg-danger' : 'bg-success'}>
                        {label}: {count} - ${spent} / ${cap}</p>
                </div>
            );
        })}
    </div>
}

const TeamSummary = ({players, config}: { players: Player[], config: DraftConfig }) => {
    const qb = players.filter(p => p.position === "QB");
    const rb = players.filter(p => p.position === "RB");
    const wr = players.filter(p => p.position === "WR");
    const te = players.filter(p => p.position === "TE");

    const starting = config.roster.starting;
    const max = config.roster.max;

    const sumPoints = (a: number, b: Player) => a + b.points;

    return <div className={"flex-parent"}>
        <div>
            <p className={qb.length < starting.qb ? 'bg-danger' : 'bg-success'}>
                QB: {qb.length} / {max.qb}</p>
            <span>+{qb.slice(0, starting.qb).reduce(sumPoints, 0).toFixed(2)}</span>
        </div>
        <div>
            <p className={rb.length < starting.rb ? 'bg-danger' : 'bg-success'}>
                RB: {rb.length} / {max.rb}</p>
            <span>+{rb.slice(0, starting.rb).reduce(sumPoints, 0).toFixed(2)}</span>
        </div>
        <div>
            <p className={wr.length < starting.wr ? 'bg-danger' : 'bg-success'}>
                WR: {wr.length} / {max.wr}</p>
            <span>+{wr.slice(0, starting.wr).reduce(sumPoints, 0).toFixed(2)}</span>
        </div>
        <div>
            <p className={te.length < starting.te ? 'bg-danger' : 'bg-success'}>
                TE: {te.length} / {max.te}</p>
            <span>+{te.slice(0, starting.te).reduce(sumPoints, 0).toFixed(2)}</span>
        </div>
    </div>
}

function DraftedTeams() {
    const {teams, draftStatus, format, auctionSettings} = useDraftContext();
    const [key, setKey] = useState("0");

    useEffect(() => {
        setKey((draftStatus.currentTeam - 1).toString());
    }, [draftStatus.currentTeam]);

    const title = (team: Team, idx: number, currentPick: number, yourTeam: number) => {
        let k = idx + 1;
        let v = (yourTeam === k ? "@" : "") + team.name;
        v = v + (currentPick === k ? "*" : "");
        return v;
    }

    return (
        <div className={'panel-scrollable'}>
            <Tabs id="suggested-player-tabs" activeKey={key} onSelect={(k) => setKey(k || '0')}>
                {teams.map((team, idx) =>
                    <Tab eventKey={idx} key={idx} title={title(team, idx, draftStatus.currentTeam, draftConfig.draftPosition)}>
                        <ListGroup>
                            {team.players.length === 0 && <ListGroup.Item>Empty</ListGroup.Item>}
                            {format === "auction" &&
                            <ListGroup.Item>
                                <AuctionTeamSummary team={team} auctionSettings={auctionSettings}/>
                            </ListGroup.Item>}
                            {format !== "auction" && team.players.length !== 0 &&
                            <ListGroup.Item>
                                <TeamSummary players={team.players} config={draftConfig}/>
                            </ListGroup.Item>}
                            {team.players.map((p, pIdx) =>
                                <ListGroup.Item key={p.id}>
                                    {(format === "auction" ? "$" + p.purchasePrice + " " : "Round: " + (pIdx + 1) + " ") + p.position + " " + p.name}
                                </ListGroup.Item>
                            ).reverse()}
                        </ListGroup>
                    </Tab>
                )}
            </Tabs>
        </div>
    );
}

export default DraftedTeams;
