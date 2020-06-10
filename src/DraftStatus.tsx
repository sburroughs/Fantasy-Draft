import React from "react";

export interface IDraftStatus {
    currentTeam: any
    currentRound: any
    currentPick: any
}

class DraftStatus extends React.Component<IDraftStatus, {}> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={"panel"}>
                <p>Round: {this.props.currentRound} | Team: {this.props.currentTeam}</p>
                <p>Pick: {this.props.currentPick}</p>
            </div>
        );
    }

}

export default DraftStatus;
