import React, {useCallback, useMemo, useState} from 'react';
import {AutoSizer} from 'react-virtualized';
import {ContextMenu, ContextMenuTrigger, MenuItem} from 'react-contextmenu';
import DataGrid, {
    Column,
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

const RowRenderer = (props: RowRendererProps<Player>, targetedPlayers: Player[]) => {
    const getRowBackgroundClass = () => {
        const v = props.row.relativeValue;
        const thresholds: Record<string, string> = config.display["player-board"]["gradient-thresholds"]["rv"];
        let tier = '0';
        for (let i = 1; i < 10; i++) {
            const key = i.toString();
            if (v > Number(thresholds[key])) {
                tier = key;
                break;
            }
        }
        return "rv-" + tier;
    };

    const gridStyles = () => [
        getRowBackgroundClass(),
        "tier-" + props.row.tier,
        "position-" + props.row.position.toLowerCase(),
        picksInDraft.has(props.row.adp) ? "projected-pick" : "",
        targetedPlayers.some(player => player.id === props.row.id) ? "targeted-pick" : "",
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
    const {availablePlayers, targetedPlayers, draftPlayers, targetPlayers, setAvailablePlayers} = useDraftContext();

    const [[sortColumn, sortDirection], setSort] = useState<[string, SortDirection]>(['adp', 'ASC']);
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
                sortedPlayers = sortedPlayers.sort((a, b) => a[sortColumn].localeCompare(b[sortColumn]));
                break;
            case 'id':
            case 'adp':
            case 'age':
            case 'tier':
            case 'relativeValue':
                sortedPlayers = sortedPlayers.sort((a, b) => a[sortColumn] - b[sortColumn]);
                break;
        }
        return sortDirection === 'DESC' ? sortedPlayers.reverse() : sortedPlayers;
    }, [availablePlayers, sortDirection, sortColumn, filters]);

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

    return (
        <div style={{flex: '1 1 auto', minHeight: '88vh'}}>
            <AutoSizer>
                {({height, width}) => (
                    <DataGrid
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
                        rowRenderer={(rrp) => RowRenderer(rrp, targetedPlayers)}
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
