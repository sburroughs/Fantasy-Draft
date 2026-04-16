import React from "react";
import {CurrentDraftStatus, Player} from "../common/Player";

interface Props {
    status: CurrentDraftStatus
    playerTeam: number
    lastSelectedPlayer?: Player
}

function DraftStatusInsight({ status, playerTeam, lastSelectedPlayer }: Props) {
    return (
        <div className={"panel"}>
            <span>Drafting</span>
            <span> {status.currentRound}.{status.currentRoundPick}</span>
            <span> (#{status.currentPick})</span>
            <span> Team {status.currentTeam}</span>
            {lastSelectedPlayer?.name &&
            <span> (Last Pick: {lastSelectedPlayer.name})</span>}
            {status.currentTeam === playerTeam &&
            <span> Your Turn</span>}
        </div>
    );
}

export default DraftStatusInsight;
