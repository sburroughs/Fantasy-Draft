import React from "react";
import draftConfig from "../config/DefaultConfig.json";
import {useDraftContext} from "../draft-manager/DraftContext";

function TrendInsight() {
    const {draftPicks} = useDraftContext();
    const teamCount = draftConfig.teamCount;

    const headerRow = [...Array(teamCount + 1)].map((_, i) =>
        <div key={i}>{i !== 0 && <div>{i}</div>}</div>
    );

    const listItems = draftPicks.map((p, index) => {
        const round = Math.trunc(index / teamCount) + 1;
        if (index % teamCount === 0) {
            return <React.Fragment key={index}>
                <span>{round}</span>
                <span className={"grid-item position-" + p.position.toLowerCase()}>{p.position}</span>
            </React.Fragment>
        }
        return <span key={index} className={"grid-item position-" + p.position.toLowerCase()}>{p.position}</span>
    });

    return (
        <div className={"grid-wrapper"}>
            {headerRow}
            {listItems}
        </div>
    );
}

export default TrendInsight;
