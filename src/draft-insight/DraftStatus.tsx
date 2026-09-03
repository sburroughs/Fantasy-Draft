import React from "react";
import {useDraftContext} from "../draft-manager/DraftContext";

interface Props {
    playerTeam: number
}

function DraftStatusInsight({playerTeam}: Props) {
    const {draftStatus, lastSelectedPlayer} = useDraftContext();
    const isYourTurn = draftStatus.currentTeam === playerTeam;

    return (
        <div className={"panel" + (isYourTurn ? " panel-your-turn" : "")}>
            <span>Drafting</span>
            <span> {draftStatus.currentRound}.{draftStatus.currentRoundPick}</span>
            <span> (#{draftStatus.currentPick})</span>
            <span> Team {draftStatus.currentTeam}</span>
            {lastSelectedPlayer?.name &&
            <span> (Last Pick: {lastSelectedPlayer.name})</span>}
            {isYourTurn &&
            <span className={"your-turn-badge"}>Your Turn</span>}
        </div>
    );
}

export default DraftStatusInsight;
