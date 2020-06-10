import React from "react";
import {Player} from "./Player";
import './App.css';

export function TopPlayerList(props: { players: Player[], keyId: string }) {
    const {players, keyId} = props;

    return <>
        {players.slice(0, 5).map((player, idx) => {
            return (
                <div key={"player-list-player-" + keyId + idx} className={"panel"}>
                    <h4>{player.name}</h4>
                    <div className={"flex-parent"}>
                        <p>{player.position}</p>
                        <p>{player.relativeValue}</p>
                    </div>
                </div>
            );
        })}
    </>

}
