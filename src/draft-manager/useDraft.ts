import {useCallback, useEffect, useState} from "react";
import {CurrentDraftStatus, Player, Team} from "../common/Player";
import Utility from "../common/Utility";
import draftConfig from '../config/DefaultConfig.json';
import {nextTurnSnake, previousTurnSnake} from "./DraftProgressor";

export interface DraftState {
    availablePlayers: Player[];
    targetedPlayers: Player[];
    draftPicks: Player[];
    teams: Team[];
    draftStatus: CurrentDraftStatus;
    lastSelectedPlayer?: Player;
}

const populateTeams = (): Team[] =>
    Array.from({length: draftConfig.teamCount}, () => ({players: []}));

const defaultDraftStatus = (): CurrentDraftStatus => ({
    currentTeam: 1,
    currentRound: 1,
    currentPick: 1,
    currentRoundPick: 1
});

const loadState = (): DraftState => {
    const stored = localStorage.getItem("draft");
    if (stored) {
        const saved = JSON.parse(stored) as Partial<DraftState>;
        return {
            availablePlayers: saved.availablePlayers || [],
            targetedPlayers: saved.targetedPlayers || [],
            draftPicks: saved.draftPicks || [],
            teams: saved.teams || populateTeams(),
            draftStatus: saved.draftStatus || defaultDraftStatus()
        };
    }
    return {
        availablePlayers: [],
        targetedPlayers: [],
        draftPicks: [],
        teams: populateTeams(),
        draftStatus: defaultDraftStatus()
    };
};

export function useDraft() {
    const [state, setState] = useState<DraftState>(loadState);

    useEffect(() => {
        localStorage.setItem('draft', JSON.stringify(state, undefined, 4));
    }, [state]);

    const addPlayer = useCallback((player: Player) => {
        setState(prev => ({
            ...prev,
            availablePlayers: [...prev.availablePlayers, player]
        }));
    }, []);

    const setAvailablePlayers = useCallback((players: Player[]) => {
        setState(prev => ({...prev, availablePlayers: players}));
    }, []);

    const draftPlayers = useCallback((players: Player[]) => {
        setState(prev => {
            let updatedAvailablePlayers = prev.availablePlayers;
            let updatedDraftPicks = [...prev.draftPicks];
            let updatedDraftStatus = prev.draftStatus;
            let updatedTeams: Team[] = [...prev.teams];
            let updatedLastSelectedPlayer = prev.lastSelectedPlayer;
            let updatedTargetedPlayers = prev.targetedPlayers;

            for (let player of players) {

                // remove player from available players.
                const availableAfterPick = updatedAvailablePlayers.filter(
                    p => Utility.standardizeName(p.name) !== Utility.standardizeName(player?.name)
                );
                if (updatedAvailablePlayers.length === availableAfterPick.length + 1) {
                    updatedAvailablePlayers = [...availableAfterPick];
                }

                // add player to current team's roster.
                const teamIndex = updatedDraftStatus.currentTeam - 1;
                updatedTeams[teamIndex] = {
                    ...updatedTeams[teamIndex],
                    players: [...updatedTeams[teamIndex].players, player]
                };

                // add to draft picks and advance turn.
                updatedDraftPicks = [...updatedDraftPicks, player];
                updatedDraftStatus = nextTurnSnake(updatedDraftStatus, updatedTeams);
                updatedLastSelectedPlayer = player;

                // remove from targeted players if present.
                updatedTargetedPlayers = updatedTargetedPlayers.filter(
                    p => Utility.standardizeName(p.name) !== Utility.standardizeName(player.name)
                );
            }

            return {
                availablePlayers: updatedAvailablePlayers,
                draftPicks: updatedDraftPicks,
                teams: updatedTeams,
                draftStatus: updatedDraftStatus,
                lastSelectedPlayer: updatedLastSelectedPlayer,
                targetedPlayers: updatedTargetedPlayers
            };
        });
    }, []);

    const targetPlayers = useCallback((players: Player[]) => {
        setState(prev => {
            const newPlayers = players.filter(
                p => !prev.targetedPlayers.some(
                    tp => Utility.standardizeName(tp.name) === Utility.standardizeName(p.name)
                )
            );
            return {...prev, targetedPlayers: [...prev.targetedPlayers, ...newPlayers]};
        });
    }, []);

    const undoDraftPicks = useCallback((picks: number) => {
        setState(prev => {
            let updatedAvailablePlayers = [...prev.availablePlayers];
            let updatedDraftPicks = [...prev.draftPicks];
            let updatedDraftStatus = prev.draftStatus;
            let updatedTeams: Team[] = [...prev.teams];

            for (let i = 1; i <= picks; i++) {
                if (updatedDraftStatus.currentRound >= 1 && updatedDraftStatus.currentPick > 1) {
                    updatedDraftStatus = previousTurnSnake(updatedDraftStatus, updatedTeams);

                    const teamIndex = updatedDraftStatus.currentTeam - 1;
                    const updatedPlayers = [...updatedTeams[teamIndex].players];
                    const lastPlayer = updatedPlayers.pop();
                    updatedTeams[teamIndex] = {...updatedTeams[teamIndex], players: updatedPlayers};
                    updatedDraftPicks = updatedDraftPicks.slice(0, -1);

                    if (lastPlayer) {
                        updatedAvailablePlayers = [...updatedAvailablePlayers, lastPlayer];
                    }
                }
            }

            return {
                ...prev,
                availablePlayers: updatedAvailablePlayers,
                draftPicks: updatedDraftPicks,
                teams: updatedTeams,
                draftStatus: updatedDraftStatus
            };
        });
    }, []);

    return {
        ...state,
        addPlayer,
        setAvailablePlayers,
        draftPlayers,
        targetPlayers,
        undoDraftPicks
    };
}
