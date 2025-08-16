import React, {useState} from "react";
import {Tab, Tabs} from 'react-bootstrap';
import {Player, Team} from "../Player";
import {TopPlayerList} from "../TopPlayerList";

const SuggestedPlayersInsight = (props: { players: Player[], displayCount: number, onSubmit: any, currentTeam: Team }) => {
    const [key, setKey] = useState("best")
    const players = [...props.players];

    function sortByPoints(p1: Player, p2: Player) {
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
            .sort(sortByPoints)
            .splice(0, limit);
    }

    function getADP(limit: number): Player[] {
        return [...players]
            .sort(sortByADP)
            .splice(0, limit);
    }

    function getBestQB(limit: number): Player[] {
        return [...players]
            .filter((p: Player) => p.position === "QB")
            .splice(0, limit);
    }

    function getBestRB(limit: number): Player[] {
        return [...players]
            .filter((p: Player) => p.position === "RB")
            .splice(0, limit);
    }

    function getBestWR(limit: number): Player[] {
        return [...players]
            .filter((p: Player) => p.position === "WR")
            .splice(0, limit);
    }

    function getBestTE(limit: number): Player[] {
        return [...players]
            .filter((p: Player) => p.position === "TE")
            .splice(0, limit);
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
        </Tabs>
    );
}

export default SuggestedPlayersInsight;
