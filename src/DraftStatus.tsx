import React from "react";
import Card from "react-bootstrap/Card"
import ListGroup from "react-bootstrap/ListGroup"

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
            <div className={"panel"}>Drafting {this.props.currentRound}.{this.props.currentTeam } (#{this.props.currentPick})</div>
        );
    }

}

export default DraftStatus;
