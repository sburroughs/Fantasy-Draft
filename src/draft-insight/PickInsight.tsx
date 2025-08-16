import {Player} from "../Player";
import React from "react";

function DraftPicks(props: { picks: Player[] }) {
    const picks = [...props.picks];
    const listItems = picks.reverse().map((p) =>
        <li key={p.id}>{p.name}</li>
    );

    return <div className={"panel-scrollable"}>
        <ol reversed>{listItems}</ol>
    </div>;
}

export default DraftPicks;