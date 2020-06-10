import React from "react";
import {Player} from "./Player";

export class DraftedPlayers extends React.Component<{ players: any }> {
    render() {
        let {players} = this.props;
        return (
            <div className={"panel-scrollable"}>
                <ol reversed>
                    {players.map(playerItems).reverse()}
                </ol>
            </div>
        );

        function playerItems(p: Player) {
            return <li key={p.id}>{p.name}</li>;
        }
    }
}

export default DraftedPlayers;
