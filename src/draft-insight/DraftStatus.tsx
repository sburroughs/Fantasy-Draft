import React from "react";
import {CurrentDraftStatus, Player} from "../common/Player";

class DraftStatusInsight extends React.Component<{ status: CurrentDraftStatus, playerTeam: number, lastSelectedPlayer?: Player}, {}> {

    render() {
        return (
            <div className={"panel"}>
                <span>Drafting</span>
                <span> {this.props.status.currentRound}.{this.props.status.currentRoundPick}</span>
                <span> (#{this.props.status.currentPick})</span>
                <span> Team {this.props.status.currentTeam}</span>
                {this.props.lastSelectedPlayer?.name &&
                <span> (Last Pick: {this.props.lastSelectedPlayer?.name})</span>}
                {this.props.status.currentTeam === this.props.playerTeam &&
                <span> Your Turn</span>}
            </div>
        );
    }

}

export default DraftStatusInsight;
