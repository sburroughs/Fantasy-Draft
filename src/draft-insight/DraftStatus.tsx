import React from "react";
import {useDraftContext} from "../draft-manager/DraftContext";
import draftConfig from "../config/DefaultConfig.json";
import * as AuctionCalculator from "../common/AuctionCalculator";

interface Props {
    playerTeam: number
}

function DraftStatusInsight({playerTeam}: Props) {
    const {draftStatus, lastSelectedPlayer, format, teams, auctionSettings} = useDraftContext();

    if (format === "auction") {
        const myTeam = teams[playerTeam - 1];
        const myMaxBid = myTeam ? AuctionCalculator.maxRosterBid(myTeam, draftConfig.roster.size) : 0;

        return (
            <div className={"panel"}>
                <span>Auction Draft</span>
                <span> Picks Logged: {draftStatus.currentPick - 1}</span>
                {myTeam &&
                <span> My Team ({myTeam.name}) Budget: ${myTeam.budget} / ${auctionSettings.totalBudget}</span>}
                {myTeam &&
                <span> My Max Bid: ${myMaxBid}</span>}
                {lastSelectedPlayer?.name &&
                <span> (Last Pick: {lastSelectedPlayer.name} - ${lastSelectedPlayer.purchasePrice})</span>}
            </div>
        );
    }

    const isYourTurn = draftStatus.currentTeam === playerTeam;
    const currentTeamName = teams[draftStatus.currentTeam - 1]?.name || `Team ${draftStatus.currentTeam}`;

    return (
        <div className={"panel" + (isYourTurn ? " panel-your-turn" : "")}>
            <span>Drafting</span>
            <span> {draftStatus.currentRound}.{draftStatus.currentRoundPick}</span>
            <span> (#{draftStatus.currentPick})</span>
            <span> {currentTeamName}</span>
            {lastSelectedPlayer?.name &&
            <span> (Last Pick: {lastSelectedPlayer.name})</span>}
            {isYourTurn &&
            <span className={"your-turn-badge"}>Your Turn</span>}
        </div>
    );
}

export default DraftStatusInsight;
