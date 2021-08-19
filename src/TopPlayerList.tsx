import React from "react";
import {Player} from "./Player";
import './App.css';
import {Tab, Tabs} from "react-bootstrap";
import ListGroup from "react-bootstrap/ListGroup";

export function TopPlayerList(props: { players: Player[], keyId: string }) {
    const {players, keyId} = props;

    return <>

        <ListGroup>
            {players.length === 0 && <ListGroup.Item>Empty</ListGroup.Item>}
            {players.slice(0, 5).map((p) =>
                <ListGroup.Item>{p.position + " " + p.name + " " + p.relativeValue}</ListGroup.Item>
            )}
        </ListGroup>


    </>

}
