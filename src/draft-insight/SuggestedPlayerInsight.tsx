import React, {useState} from "react";
import {Tab, Tabs} from 'react-bootstrap';
import {Player, Team} from "../common/Player";
import {TopPlayerList} from "./TopPlayerList";
import {useDraftContext} from "../draft-manager/DraftContext";

interface Props {
    displayCount: number
    onSubmit: (players: Player[]) => void
}

const SuggestedPlayersInsight = ({displayCount, onSubmit}: Props) => {
    const {availablePlayers, targetedPlayers, draftStatus, teams} = useDraftContext();
    const [key, setKey] = useState("best");

    const players = [...availablePlayers];
    const targets = targetedPlayers;
    const currentTeam: Team = teams[draftStatus.currentTeam - 1];

    function sortByRV(p1: Player, p2: Player) {
        return p2.relativeValue - p1.relativeValue;
    }

    function sortByADP(p1: Player, p2: Player) {
        return p1.adp - p2.adp;
    }

    function getBestAvailable(team: Team, limit: number): Player[] {
        return [...players]
            // remove kickers and defense. We don't desire them in Best suggestions, ever.
            .filter((p: Player) => !(p.position === "K" || p.position === "DEF"))
            // remove qbs from best if already drafted
            .filter((p: Player) => !(p.position === "QB" && team.players.some(p => p.position === 'QB')))
            .sort(sortByRV)
            .slice(0, limit);
    }

    function getADP(limit: number): Player[] {
        return [...players]
            .sort(sortByADP)
            .slice(0, limit);
    }

    function getByPosition(position: string, limit: number): Player[] {
        return [...players]
            .filter((p: Player) => p.position === position)
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
                <TopPlayerList players={getADP(displayCount)} keyId={"adp"} onSubmit={onSubmit}/>
            </Tab>
            <Tab eventKey="best" title="BEST">
                <TopPlayerList players={getBestAvailable(currentTeam, displayCount)} keyId={"best"} onSubmit={onSubmit}/>
            </Tab>
            <Tab eventKey="qb" title="QB">
                <TopPlayerList players={getByPosition("QB", displayCount)} keyId={"qb"} onSubmit={onSubmit}/>
            </Tab>
            <Tab eventKey="rb" title="RB">
                <TopPlayerList players={getByPosition("RB", displayCount)} keyId={"rb"} onSubmit={onSubmit}/>
            </Tab>
            <Tab eventKey="wr" title="WR">
                <TopPlayerList players={getByPosition("WR", displayCount)} keyId={"wr"} onSubmit={onSubmit}/>
            </Tab>
            <Tab eventKey="te" title="TE">
                <TopPlayerList players={getByPosition("TE", displayCount)} keyId={"te"} onSubmit={onSubmit}/>
            </Tab>
            <Tab eventKey="targets" title="★">
                <TopPlayerList players={getBestTargets(displayCount)} keyId={"targets"} onSubmit={onSubmit}/>
            </Tab>
        </Tabs>
    );
}

export default SuggestedPlayersInsight;
