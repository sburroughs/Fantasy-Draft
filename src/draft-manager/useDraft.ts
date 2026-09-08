import {useCallback, useEffect, useMemo, useState} from "react";
import {AuctionSettings, CurrentDraftStatus, DraftFormat, Player, Team} from "../common/Player";
import Utility from "../common/Utility";
import draftConfig from '../config/DefaultConfig.json';
import {nextTurnSnake, previousTurnSnake} from "./DraftProgressor";
import {inflationRate as computeInflationRate} from "../common/AuctionCalculator";

export interface DraftState {
    availablePlayers: Player[];
    targetedPlayers: Player[];
    draftPicks: Player[];
    teams: Team[];
    draftStatus: CurrentDraftStatus;
    lastSelectedPlayer?: Player;
    format: DraftFormat;
    auctionSettings: AuctionSettings;
    auctionSettingsCustomized: boolean;
    hasUploaded: boolean;
    hasMerged: boolean;
}

const defaultAuctionSettings = (): AuctionSettings => ({
    totalBudget: draftConfig.auction.totalBudget,
    positionBudgets: {...draftConfig.auction.positionBudgets}
});

const defaultTeamName = (idx: number): string => draftConfig.teamNames[idx] || `Team ${idx + 1}`;

const populateTeams = (): Team[] =>
    Array.from({length: draftConfig.teamCount}, (_, idx) => ({
        name: defaultTeamName(idx),
        players: [],
        budget: draftConfig.auction.totalBudget
    }));

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
        const auctionSettingsCustomized = saved.auctionSettingsCustomized || false;
        return {
            availablePlayers: saved.availablePlayers || [],
            targetedPlayers: saved.targetedPlayers || [],
            draftPicks: saved.draftPicks || [],
            teams: (saved.teams || populateTeams()).map((t, idx) => ({
                name: t.name || defaultTeamName(idx),
                players: t.players,
                budget: t.budget ?? draftConfig.auction.totalBudget
            })),
            draftStatus: saved.draftStatus || defaultDraftStatus(),
            format: saved.format || 'snake',
            // once the user explicitly saves their own budget, it sticks; until then, always
            // track DefaultConfig.json so editing the config file takes effect on reload.
            auctionSettings: auctionSettingsCustomized && saved.auctionSettings
                ? saved.auctionSettings
                : defaultAuctionSettings(),
            auctionSettingsCustomized,
            hasUploaded: saved.hasUploaded || false,
            hasMerged: saved.hasMerged || false
        };
    }
    return {
        availablePlayers: [],
        targetedPlayers: [],
        draftPicks: [],
        teams: populateTeams(),
        draftStatus: defaultDraftStatus(),
        format: 'snake',
        auctionSettings: defaultAuctionSettings(),
        auctionSettingsCustomized: false,
        hasUploaded: false,
        hasMerged: false
    };
};

export function useDraft() {
    const [state, setState] = useState<DraftState>(loadState);
    const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
    const [jumpToPlayerId, setJumpToPlayerId] = useState<number | null>(null);
    const [nominatedPlayer, setNominatedPlayer] = useState<Player | null>(null);

    useEffect(() => {
        localStorage.setItem('draft', JSON.stringify(state, undefined, 4));
    }, [state]);

    const clearPlayers = useCallback(() => {
        setState(prev => ({
            availablePlayers: [],
            targetedPlayers: [],
            draftPicks: [],
            // reset rosters/budgets but keep whatever team names the user has set.
            teams: populateTeams().map((t, idx) => ({...t, name: prev.teams[idx]?.name || t.name})),
            draftStatus: defaultDraftStatus(),
            format: prev.format,
            auctionSettings: prev.auctionSettings,
            auctionSettingsCustomized: prev.auctionSettingsCustomized,
            hasUploaded: false,
            hasMerged: false
        }));
    }, []);

    const addPlayer = useCallback((player: Player) => {
        setState(prev => ({
            ...prev,
            availablePlayers: [...prev.availablePlayers, player]
        }));
    }, []);

    const setAvailablePlayers = useCallback((players: Player[]) => {
        setState(prev => ({...prev, availablePlayers: players}));
    }, []);

    const uploadAvailablePlayers = useCallback((players: Player[]) => {
        setState(prev => ({...prev, availablePlayers: players, hasUploaded: true}));
    }, []);

    const mergeAvailablePlayers = useCallback((players: Player[]) => {
        setState(prev => ({...prev, availablePlayers: players, hasMerged: true}));
    }, []);

    const setFormat = useCallback((format: DraftFormat) => {
        // switching format invalidates whatever was uploaded for the previous shape
        setState(prev => ({...prev, format, hasUploaded: false, hasMerged: false}));
    }, []);

    const setAuctionSettings = useCallback((auctionSettings: AuctionSettings) => {
        setState(prev => ({...prev, auctionSettings, auctionSettingsCustomized: true}));
    }, []);

    const setTeamNames = useCallback((names: string[]) => {
        setState(prev => ({
            ...prev,
            teams: prev.teams.map((t, idx) => ({...t, name: names[idx] ?? t.name}))
        }));
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
                ...prev,
                availablePlayers: updatedAvailablePlayers,
                draftPicks: updatedDraftPicks,
                teams: updatedTeams,
                draftStatus: updatedDraftStatus,
                lastSelectedPlayer: updatedLastSelectedPlayer,
                targetedPlayers: updatedTargetedPlayers
            };
        });
    }, []);

    const draftPlayerAuction = useCallback((player: Player, teamIndex: number, price: number) => {
        setState(prev => {
            const updatedAvailablePlayers = prev.availablePlayers.filter(
                p => Utility.standardizeName(p.name) !== Utility.standardizeName(player.name)
            );
            const updatedTargetedPlayers = prev.targetedPlayers.filter(
                p => Utility.standardizeName(p.name) !== Utility.standardizeName(player.name)
            );

            const wonPlayer: Player = {...player, purchasePrice: price, draftedByTeam: teamIndex};

            const updatedTeams: Team[] = [...prev.teams];
            updatedTeams[teamIndex] = {
                ...updatedTeams[teamIndex],
                players: [...updatedTeams[teamIndex].players, wonPlayer],
                budget: updatedTeams[teamIndex].budget - price
            };

            const updatedDraftStatus: CurrentDraftStatus = {
                ...prev.draftStatus,
                currentPick: prev.draftStatus.currentPick + 1
            };

            return {
                ...prev,
                availablePlayers: updatedAvailablePlayers,
                targetedPlayers: updatedTargetedPlayers,
                draftPicks: [...prev.draftPicks, wonPlayer],
                teams: updatedTeams,
                draftStatus: updatedDraftStatus,
                lastSelectedPlayer: wonPlayer
            };
        });
        setNominatedPlayer(null);
    }, []);

    const nominatePlayer = useCallback((player: Player) => {
        setNominatedPlayer(player);
    }, []);

    const cancelNomination = useCallback(() => {
        setNominatedPlayer(null);
    }, []);

    const selectPlayer = useCallback((player: Player | null) => {
        setSelectedPlayerId(player ? player.id : null);
    }, []);

    const jumpToPlayer = useCallback((player: Player) => {
        setSelectedPlayerId(player.id);
        setJumpToPlayerId(player.id);
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
            if (prev.format === 'auction') {
                let updatedAvailablePlayers = [...prev.availablePlayers];
                let updatedDraftPicks = [...prev.draftPicks];
                let updatedTeams: Team[] = [...prev.teams];
                let updatedDraftStatus = prev.draftStatus;

                for (let i = 1; i <= picks; i++) {
                    if (updatedDraftPicks.length === 0) {
                        break;
                    }
                    const lastPlayer = updatedDraftPicks[updatedDraftPicks.length - 1];
                    updatedDraftPicks = updatedDraftPicks.slice(0, -1);

                    const teamIndex = lastPlayer.draftedByTeam;
                    if (teamIndex !== undefined) {
                        const updatedPlayers = updatedTeams[teamIndex].players.filter(p => p.id !== lastPlayer.id);
                        updatedTeams[teamIndex] = {
                            ...updatedTeams[teamIndex],
                            players: updatedPlayers,
                            budget: updatedTeams[teamIndex].budget + lastPlayer.purchasePrice
                        };
                    }

                    const {purchasePrice, draftedByTeam, ...rest} = lastPlayer;
                    const restoredPlayer: Player = {...rest, purchasePrice: 0};
                    updatedAvailablePlayers = [...updatedAvailablePlayers, restoredPlayer];

                    updatedDraftStatus = {
                        ...updatedDraftStatus,
                        currentPick: Math.max(updatedDraftStatus.currentPick - 1, 1)
                    };
                }

                return {
                    ...prev,
                    availablePlayers: updatedAvailablePlayers,
                    draftPicks: updatedDraftPicks,
                    teams: updatedTeams,
                    draftStatus: updatedDraftStatus
                };
            }

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

    const inflationRate = useMemo(
        () => computeInflationRate(state.availablePlayers, state.teams),
        [state.availablePlayers, state.teams]
    );

    return {
        ...state,
        selectedPlayerId,
        jumpToPlayerId,
        nominatedPlayer,
        inflationRate,
        addPlayer,
        clearPlayers,
        setAvailablePlayers,
        uploadAvailablePlayers,
        mergeAvailablePlayers,
        setFormat,
        setAuctionSettings,
        setTeamNames,
        draftPlayers,
        draftPlayerAuction,
        nominatePlayer,
        cancelNomination,
        selectPlayer,
        jumpToPlayer,
        targetPlayers,
        undoDraftPicks
    };
}
