import {Player} from "../common/Player";
import React from "react";

function TrendInsight(props: { picks: Player[], teamCount: number }) {
    const picks = [...props.picks];
    const teamCount = props.teamCount;
    const headerRow = [...Array(teamCount + 1)].map((_, i) => {
        return <>
            <div>
                {i != 0 && <div>{i}</div>}
            </div>
        </>
    });

    const trend = () => <></>

    const listItems = picks.map((p, index) => {
            let round = Math.trunc(index / teamCount) + 1;
            if (index % teamCount == 0) {
                return <><span>{round}</span><span className={"grid-item position-" + p.position.toLowerCase()}>{p.position}</span></>
            }
            return <span className={"grid-item position-" + p.position.toLowerCase()}>{p.position}</span>
        }
    );

    return <>
        <div>Trend: {trend}</div>
        <div className={"grid-wrapper"}>
            {headerRow}
            {listItems}
        </div>
    </>


}


export default TrendInsight;