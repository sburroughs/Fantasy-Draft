import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AutoSizer} from 'react-virtualized';
import {ContextMenu, ContextMenuTrigger, MenuItem} from 'react-contextmenu';
import DataGrid, {
    Column,
    DataGridHandle,
    Filters,
    Row as DataGridRow,
    RowRendererProps,
    RowsUpdateEvent,
    SortDirection
} from 'react-data-grid';
import 'react-data-grid/dist/react-data-grid.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../react-contextmenu.css';
import '../Player.css';
import config from '../config/DefaultConfig.json';
import {Player} from '../common/Player';
import {createPortal} from "react-dom";
import {Cells} from "./Cells";
import {useDraftContext} from "../draft-manager/DraftContext";

const columns: readonly Column<Player>[] = config.display["player-board"]["show-column"]
    .filter((fieldName: string) => {
        if (!Cells.has(fieldName)) {
            console.warn(`Field "${fieldName}" is not defined in Cells. Please check your configuration.`);
        }
        return Cells.has(fieldName);
    })
    .map(fieldName => Cells.get(fieldName)!);

const picksInDraft = new Set(getPicksSnake(config.teamCount, config.draftPosition, config.draftRounds));

function getPicksSnake(totalTeams: number, draftPosition: number, totalRounds: number): number[] {
    const myPicks = [];
    for (let round = 1; round <= totalRounds; round++) {
        let overallPick;
        if (round % 2 === 1) {
            overallPick = (round - 1) * totalTeams + draftPosition;
        } else {
            overallPick = (round - 1) * totalTeams + (totalTeams - draftPosition + 1);
        }
        myPicks.push(overallPick);
    }
    return myPicks;
}

const RowRenderer = (props: RowRendererProps<Player>, targetedPlayers: Player[], selectedPlayerId: number | null, currentPick: number, projectedPickByPlayerId: Map<number, number>) => {
    const getGradientClass = (value: number, thresholdKey: string) => {
        const allThresholds: Record<string, Record<string, string>> = config.display["player-board"]["gradient-thresholds"];
        const thresholds: Record<string, string> = allThresholds[thresholdKey];
        let tier = '0';
        for (let i = 1; i < 10; i++) {
            const key = i.toString();
            if (value > Number(thresholds[key])) {
                tier = key;
                break;
            }
        }
        return thresholdKey + "-" + tier;
    };

    const getAdpClass = (adpValue: number, suffix: string) => {
        const picksFromAdp = currentPick - adpValue;
        if (picksFromAdp <= -2 * config.teamCount) {
            return "adp-reach" + suffix; // current pick is 2+ rounds earlier than this player's ADP
        }
        if (picksFromAdp >= 0.5 * config.teamCount) {
            return "adp-value" + suffix; // this player has fallen half a round or more past their ADP
        }
        return "";
    };

    const gridStyles = () => [
        getGradientClass(props.row.relativeValue, "rv"),
        getGradientClass(props.row.vor, "vor"),
        "tier-" + props.row.tier,
        "position-" + props.row.position.toLowerCase(),
        picksInDraft.has(projectedPickByPlayerId.get(props.row.id) ?? -1) ? "projected-pick" : "",
        targetedPlayers.some(player => player.id === props.row.id) ? "targeted-pick" : "",
        selectedPlayerId === props.row.id ? "selected-player" : "",
        getAdpClass(props.row.adp, ""),
    ].join(" ");

    return (
        <ContextMenuTrigger id="grid-context-menu" collect={() => ({rowIdx: props.rowIdx})}>
            <div className={gridStyles()}>
                <DataGridRow {...props} />
            </div>
        </ContextMenuTrigger>
    );
}

function PlayerTable() {
    const {
        availablePlayers,
        targetedPlayers,
        draftPlayers,
        targetPlayers,
        setAvailablePlayers,
        selectedPlayerId,
        jumpToPlayerId,
        selectPlayer,
        draftStatus
    } = useDraftContext();

    const gridRef = useRef<DataGridHandle>(null);

    const [[sortColumn, sortDirection], setSort] = useState<[string, SortDirection]>(['rank', 'ASC']);
    const [selectedRows, setSelectedRows] = useState(() => new Set<number>());
    const [filters, setFilters] = useState<Filters>({
        position: 'All',
        team: 'All',
        name: ''
    });

    const playerSubset: Player[] = useMemo(() => {
        let filteredPlayers: Player[] = [...availablePlayers].filter(p =>
            (filters.position !== 'All' ? p.position === filters.position : true)
            && (filters.name ? p.name.toLowerCase().includes(filters.name.toLowerCase()) : true)
            && (filters.team !== 'All' ? p.team === filters.team : true)
        );

        if (sortDirection === 'NONE') return filteredPlayers;

        let sortedPlayers = [...filteredPlayers];
        switch (sortColumn) {
            case 'name':
            case 'positionRank':
                sortedPlayers = sortedPlayers.sort((a, b) => a[sortColumn].localeCompare(b[sortColumn]));
                break;
            case 'id':
            case 'adp':
            case 'age':
            case 'tier':
            case 'points':
            case 'vor':
            case 'rank':
            case 'relativeValue':
                sortedPlayers = sortedPlayers.sort((a, b) => a[sortColumn] - b[sortColumn]);
                break;
        }
        return sortDirection === 'DESC' ? sortedPlayers.reverse() : sortedPlayers;
    }, [availablePlayers, sortDirection, sortColumn, filters]);

    // assumes remaining players go off the board in rank order from here on, so as players
    // are drafted the projected pick for each remaining player slides up to fill the gap.
    const projectedPickByPlayerId: Map<number, number> = useMemo(() => {
        const map = new Map<number, number>();
        [...availablePlayers]
            .sort((a, b) => a.rank - b.rank)
            .forEach((p, idx) => map.set(p.id, draftStatus.currentPick + idx));
        return map;
    }, [availablePlayers, draftStatus.currentPick]);

    const handleRowsUpdate = useCallback(({fromRow, toRow, updated}: RowsUpdateEvent<Partial<Player>>) => {
        const newRows = [...playerSubset];
        for (let i = fromRow; i <= toRow; i++) {
            newRows[i] = {...newRows[i], ...updated};
        }
        setAvailablePlayers(newRows);
    }, [setAvailablePlayers, playerSubset]);

    const handleSort = useCallback((columnKey: string, direction: SortDirection) => {
        setSort([columnKey, direction]);
    }, []);

    const onPlayerDraft = (e: React.MouseEvent<HTMLDivElement>, {rowIdx}: { rowIdx: number }) => {
        draftPlayers([playerSubset[rowIdx]]);
        setFilters({position: 'All', team: 'All', name: ''});
    }

    const onPlayerTargeted = (e: React.MouseEvent<HTMLDivElement>, {rowIdx}: { rowIdx: number }) => {
        targetPlayers([playerSubset[rowIdx]]);
    }

    const handleRowClick = useCallback((rowIdx: number, row: Player) => {
        selectPlayer(row);
    }, [selectPlayer]);

    useEffect(() => {
        if (jumpToPlayerId != null) {
            setFilters({position: 'All', team: 'All', name: ''});
        }
    }, [jumpToPlayerId]);

    useEffect(() => {
        if (jumpToPlayerId == null) return;
        const rowIdx = playerSubset.findIndex(p => p.id === jumpToPlayerId);
        if (rowIdx !== -1) {
            gridRef.current?.scrollToRow(rowIdx);
        }
    }, [jumpToPlayerId, playerSubset]);

    return (
        <div style={{flex: '1 1 auto', minHeight: '88vh'}}>
            <AutoSizer>
                {({height, width}) => (
                    <DataGrid
                        ref={gridRef}
                        rowKey="id"
                        columns={columns}
                        rows={playerSubset}
                        width={width}
                        height={height}
                        selectedRows={selectedRows}
                        onSelectedRowsChange={setSelectedRows}
                        onRowsUpdate={handleRowsUpdate}
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        enableFilters={true}
                        filters={filters}
                        onFiltersChange={setFilters}
                        onRowClick={handleRowClick}
                        rowRenderer={(rrp) => RowRenderer(rrp, targetedPlayers, selectedPlayerId, draftStatus.currentPick, projectedPickByPlayerId)}
                    />
                )}
            </AutoSizer>
            {createPortal(
                <ContextMenu id="grid-context-menu">
                    <MenuItem onClick={onPlayerDraft}>Draft Player</MenuItem>
                    <MenuItem onClick={onPlayerTargeted}>Target Player</MenuItem>
                </ContextMenu>,
                document.body
            )}
        </div>
    );
}

export default PlayerTable;
