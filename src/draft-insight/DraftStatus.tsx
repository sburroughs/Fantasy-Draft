import React from "react";
import {useDraftContext} from "../draft-manager/DraftContext";

interface Props {
    playerTeam: number
}

function DraftStatusInsight({playerTeam}: Props) {
    const {draftStatus, lastSelectedPlayer} = useDraftContext();

    return (
        <div className={"panel"}>
            <span>Drafting</span>
            <span> {draftStatus.currentRound}.{draftStatus.currentRoundPick}</span>
            <span> (#{draftStatus.currentPick})</span>
            <span> Team {draftStatus.currentTeam}</span>
            {lastSelectedPlayer?.name &&
            <span> (Last Pick: {lastSelectedPlayer.name})</span>}
            {draftStatus.currentTeam === playerTeam &&
            <span> Your Turn</span>}
        </div>
    );
}

export default DraftStatusInsight;
