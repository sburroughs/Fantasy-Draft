import React, {useState} from "react";
import {Tab, Tabs} from 'react-bootstrap';
import {Player, Team} from "../common/Player";
import {TopPlayerList} from "./TopPlayerList";

const SuggestedPlayersInsight = (props: { players: Player[], targets: Player[], displayCount: number, onSubmit: (players: Player[]) => void, currentTeam: Team }) => {
    const [key, setKey] = useState("best")
    const players = [...props.players];
    const targets = props.targets;

    function sortByRV(p1: Player, p2: Player) {
        return p2.relativeValue - p1.relativeValue;
    }

    function sortByADP(p1: Player, p2: Player) {
        return p1.adp - p2.adp;
    }

    function getBestAvailable(team: Team, limit: number): Player[] {
        return [...players]
            // remove kickers and defense. We don't desire them in Best suggestions, ever.
            .filter((p:Player)=> !(p.position === "K" || p.position === "DEF"))
            // remove qbs from best if already drafted
            .filter((p:Player)=> !(p.position === "QB" && team.players.some(p => p.position === 'QB')))
            .sort(sortByRV)
            .slice(0, limit);
    }

    function getADP(limit: number): Player[] {
        return [...players]
            .sort(sortByADP)
            .slice(0, limit);
    }

    function getBestQB(limit: number): Player[] {
        return [...players]
            .filter((p: Player) => p.position === "QB")
            .slice(0, limit);
    }

    function getBestRB(limit: number): Player[] {
        return [...players]
            .filter((p: Player) => p.position === "RB")
            .slice(0, limit);
    }

    function getBestWR(limit: number): Player[] {
        return [...players]
            .filter((p: Player) => p.position === "WR")
            .slice(0, limit);
    }

    function getBestTE(limit: number): Player[] {
        return [...players]
            .filter((p: Player) => p.position === "TE")
            .slice(0, limit);
    }

    function getBestTargets(limit: number): Player[] {
        return [...targets]
            .sort(sortByRV)
            .slice(0, limit);
    }

    return (
        <Tabs id="suggested-player-tabs"
              activeKey={key}
            // @ts-ignore
              onSelect={(k) => setKey(k)}>
            <Tab eventKey="adp" title="ADP">
                <TopPlayerList players={getADP(props.displayCount)} keyId={"best"} onSubmit={props.onSubmit}></TopPlayerList>
            </Tab>
            <Tab eventKey="best" title="BEST">
                <TopPlayerList players={getBestAvailable(props.currentTeam, props.displayCount)} keyId={"best"} onSubmit={props.onSubmit}></TopPlayerList>
            </Tab>
            <Tab eventKey="qb" title="QB">
                <TopPlayerList players={getBestQB(props.displayCount)} keyId={"qb"} onSubmit={props.onSubmit}></TopPlayerList>
            </Tab>
            <Tab eventKey="rb" title="RB">
                <TopPlayerList players={getBestRB(props.displayCount)} keyId={"rb"} onSubmit={props.onSubmit}></TopPlayerList>
            </Tab>
            <Tab eventKey="wr" title="WR">
                <TopPlayerList players={getBestWR(props.displayCount)} keyId={"wr"} onSubmit={props.onSubmit}></TopPlayerList>
            </Tab>
            <Tab eventKey="te" title="TE">
                <TopPlayerList players={getBestTE(props.displayCount)} keyId={"te"} onSubmit={props.onSubmit}></TopPlayerList>
            </Tab>
            <Tab eventKey="targets" title="★">
                <TopPlayerList players={getBestTargets(props.displayCount)} keyId={"targets"} onSubmit={props.onSubmit}></TopPlayerList>
            </Tab>
        </Tabs>
    );
}

export default SuggestedPlayersInsight;
