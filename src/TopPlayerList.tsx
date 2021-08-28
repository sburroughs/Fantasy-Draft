import React from "react";
import {Player} from "./Player";
import './App.css';
import {Button} from "react-bootstrap";
import ListGroup from "react-bootstrap/ListGroup";

export function TopPlayerList(props: { players: Player[], keyId: string, onSubmit: any }) {
    const {players, onSubmit} = props;

    return <>

        <ListGroup>
            {players.length === 0 && <ListGroup.Item>Empty</ListGroup.Item>}
            {players.map((p) =>
                <ListGroup.Item key={p.id}>
                    <Button className={"float-right"} onClick={() => onSubmit([p])}>
                        Draft
                    </Button>
                    <p className={"m-0 p-0"}>{p.position} {p.name}</p>
                    <small>adp: {p.adp} | tier: {p.tier} | pts: {p.points} | rv: {p.relativeValue}</small>
                </ListGroup.Item>
            )}
        </ListGroup>

    </>

}
