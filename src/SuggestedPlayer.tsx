import React, {useState} from "react";
import {Tab, Tabs} from 'react-bootstrap';
import {Player} from "./Player";
import {TopPlayerList} from "./TopPlayerList";

const SuggestedPlayers = (props: any) => {
    const [key, setKey] = useState("best")
    const players = [...props.players];

    function getBestAvailable(limit: number): Player[] {
        return [...players]
            .splice(0, 5);
    }

    function getTeamNeed(limit: number): Player[] {
        return [...players]
            .splice(0, 5);
    }

    function getBestQB(limit: number): Player[] {
        return [...players]
            .filter((p: Player) => p.position === "QB")
            .splice(0, limit);
    }

    function getBestRB(limit: number): Player[] {
        return [...players]
            .filter((p: Player) => p.position === "RB")
    }

    function getBestWR(limit: number): Player[] {
        return [...players]
            .filter((p: Player) => p.position === "WR")
    }

    function getBestTE(limit: number): Player[] {
        return [...players]
            .filter((p: Player) => p.position === "TE")
    }

    return (
        <Tabs id="suggested-player-tabs"
              activeKey={key}
              onSelect={setKey}>
            <Tab eventKey="best" title="BEST">
                <TopPlayerList players={getBestAvailable(5)} keyId={"best"}></TopPlayerList>
            </Tab>
            <Tab eventKey="team" title="TEAM">
                <TopPlayerList players={getTeamNeed(5)} keyId={"team"}></TopPlayerList>
            </Tab>
            <Tab eventKey="qb" title="QB">
                <TopPlayerList players={getBestQB(5)} keyId={"qb"}></TopPlayerList>
            </Tab>
            <Tab eventKey="rb" title="RB">
                <TopPlayerList players={getBestRB(5)} keyId={"rb"}></TopPlayerList>
            </Tab>
            <Tab eventKey="wr" title="WR">
                <TopPlayerList players={getBestWR(5)} keyId={"wr"}></TopPlayerList>
            </Tab>
            <Tab eventKey="te" title="TE">
                <TopPlayerList players={getBestTE(5)} keyId={"te"}></TopPlayerList>
            </Tab>
        </Tabs>
    );
}

export default SuggestedPlayers;
