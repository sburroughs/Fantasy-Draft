import React, {useEffect, useState} from "react";
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import draftConfig from "./DefaultConfig.json";
import {useDraftContext} from "../draft-manager/DraftContext";
import * as AuctionCalculator from "../common/AuctionCalculator";

function AuctionDraftModal() {
    const {
        nominatedPlayer,
        cancelNomination,
        draftPlayerAuction,
        teams,
        availablePlayers,
        auctionSettings,
        inflationRate
    } = useDraftContext();

    const [teamIndex, setTeamIndex] = useState(0);
    const [price, setPrice] = useState(1);

    const team = teams[teamIndex];

    const suggested = nominatedPlayer && team
        ? AuctionCalculator.suggestedBid(nominatedPlayer, team, availablePlayers, teams, auctionSettings, draftConfig.roster.size)
        : 1;

    const marketValue = nominatedPlayer ? Math.round(nominatedPlayer.auctionValue * inflationRate) : 0;
    const budgetMax = team ? AuctionCalculator.maxRosterBid(team, draftConfig.roster.size) : 0;
    const positionLeft = nominatedPlayer && team
        ? AuctionCalculator.positionBudgetRemaining(team, nominatedPlayer.position, auctionSettings)
        : 0;

    useEffect(() => {
        if (nominatedPlayer) {
            setTeamIndex(0);
        }
    }, [nominatedPlayer]);

    useEffect(() => {
        if (nominatedPlayer && teams[teamIndex]) {
            setPrice(AuctionCalculator.suggestedBid(nominatedPlayer, teams[teamIndex], availablePlayers, teams, auctionSettings, draftConfig.roster.size));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nominatedPlayer, teamIndex]);

    if (!nominatedPlayer) {
        return null;
    }

    const overBudget = team ? price > team.budget : false;
    const overPositionCap = team ? price > AuctionCalculator.positionBudgetRemaining(team, nominatedPlayer.position, auctionSettings) : false;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();
        draftPlayerAuction(nominatedPlayer, teamIndex, price);
    };

    return (
        <Modal show={!!nominatedPlayer} onHide={cancelNomination}>
            <Modal.Header closeButton>
                <Modal.Title>Record Auction Pick</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h5>{nominatedPlayer.position} {nominatedPlayer.name} ({nominatedPlayer.team})</h5>
                <Form noValidate onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Winning Team</Form.Label>
                        <Form.Select value={teamIndex} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTeamIndex(Number(e.target.value))}>
                            {teams.map((t, idx) =>
                                <option key={idx} value={idx}>
                                    {t.name} (${t.budget} left)
                                </option>
                            )}
                        </Form.Select>
                    </Form.Group>

                    <div className="mb-3">
                        <div>Market Value: ${marketValue}</div>
                        <div>Your Budget Max: ${budgetMax}</div>
                        <div>Position Budget Left: ${positionLeft}</div>
                        <div><strong>Suggested Bid: ${suggested}</strong></div>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Winning Price</Form.Label>
                        <Form.Control
                            type="number"
                            min={1}
                            value={price}
                            onChange={e => setPrice(Number(e.target.value))}
                        />
                    </Form.Group>

                    {overBudget &&
                    <p className="text-danger">Warning: this exceeds {team?.name}'s remaining budget.</p>}
                    {!overBudget && overPositionCap &&
                    <p className="text-danger">Warning: this exceeds {team?.name}'s {nominatedPlayer.position} spending cap.</p>}

                    <Button variant="secondary" onClick={cancelNomination}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                        Confirm Pick
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default AuctionDraftModal;
