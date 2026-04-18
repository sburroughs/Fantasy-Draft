import React from "react";
import {useDraftContext} from "../draft-manager/DraftContext";

function SelectedPicks() {
    const {draftPicks} = useDraftContext();
    const listItems = [...draftPicks].reverse().map((p) =>
        <li key={p.id}>{p.name}</li>
    );

    return (
        <div className={"panel-scrollable"}>
            <ol reversed>{listItems}</ol>
        </div>
    );
}

export default SelectedPicks;
