import React from "react";
import {IDraftStatus} from "../common/Player";

class DraftStatus extends React.Component<{ status: IDraftStatus, playerTeam: number }, {}> {

    render() {
        return (
            <div className={"panel"}>
                <span>Drafting</span>
                <span> {this.props.status.currentRound}.{this.props.status.currentRoundPick}</span>
                <span> (#{this.props.status.currentPick})</span>
                <span> Team {this.props.status.currentTeam}</span>
                {this.props.status.currentTeam === this.props.playerTeam &&
                <span> Your Turn</span>}
            </div>
        );
    }

}

export default DraftStatus;
