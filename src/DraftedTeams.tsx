import React from "react";
import {Tab, Tabs} from 'react-bootstrap'
import {Team} from "./Player";
import ListGroup from "react-bootstrap/ListGroup";

export class DraftedTeams extends React.Component<{ teams: Team[], selectedPick: number }, { key: any }> {

    key: any;

    constructor(props: any) {
        super(props);
        this.state = {
            key: "1",
        };
    }

    render() {
        let {teams} = this.props;
        return (
            <Tabs id="suggested-player-tabs">
                {teams.map((team, idx) =>
                    (<Tab eventKey={idx} key={idx} title={(idx + 1)}>

                        <ListGroup>
                            {team.players.map((p, pIdx) => {
                                return <ListGroup.Item key={'team' + idx + pIdx}>{p.position + " " + p.name}</ListGroup.Item>
                            })}
                        </ListGroup>

                    </Tab>))}
            </Tabs>
        );
    }
}

export default DraftedTeams;
