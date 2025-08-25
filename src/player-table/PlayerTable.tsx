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

const columns: readonly Column<Player>[] = config.display["player-board"]["show-column"]
    .filter((fieldName: string) => {
        if(!Cells.has(fieldName)) {
            console.warn(`Field "${fieldName}" is not defined in Cells. Please check your configuration.`);
        }
        return Cells.has(fieldName);
    })
    .map(fieldName => Cells.get(fieldName));

const RowRenderer = (props: RowRendererProps<Player>) => {

    const getRowBackgroundClass = () => {
        let v = props.row.relativeValue;
        let thresholds: any = config.display["player-board"]["gradient-thresholds"]["rv"];
        let tier = '0'; // defaults to 0 if no matches
        for (let i = 1; i < 10; i++) {
            let key = i.toString();
            let value = thresholds[key];
            if (v > value) {
                tier = key
                break
            }
        }
        return "rv-" + tier;
    };

    const tierStyle = "tier-" + props.row.tier;

    const positionStyles = "position-" + props.row.position.toLowerCase();

    function getPicksSnake(totalTeams:any, draftPosition:any, totalRounds:any) {
        const myPicks = [];

        for (let round = 1; round <= totalRounds; round++) {
            let overallPick;

            if (round % 2 === 1) {
                // Odd rounds: order goes 1 → totalTeams
                overallPick = (round - 1) * totalTeams + draftPosition;
            } else {
                // Even rounds: order goes totalTeams → 1
                overallPick = (round - 1) * totalTeams + (totalTeams - draftPosition + 1);
            }

            myPicks.push(overallPick);
        }

        return myPicks;
    }
    const picksInDraft = new Set(getPicksSnake(config.teamCount, config.draftPosition, config.draftRounds));
    const projectedPickStyles = () => {
        if(picksInDraft.has(props.row.adp)) {
            return "projected-pick";
        }
        return ""
    }

    const gridStyles = () => [
        getRowBackgroundClass(),
        tierStyle,
        positionStyles,
        projectedPickStyles(),
    ].join(" ")

    return (
        <ContextMenuTrigger id="grid-context-menu" collect={() => ({rowIdx: props.rowIdx})}>
            <div className={gridStyles()}>
                <DataGridRow {...props} />
            </div>
        </ContextMenuTrigger>
    );
}


interface Prop {
    availablePlayers: Player[]
    onDraftPlayer: any
    onUpdatedAvailablePlayers: any
}

function PlayerTable(props: Prop) {

    const [[sortColumn, sortDirection], setSort] = useState<[string, SortDirection]>(['adp', 'ASC']);
    const [selectedRows, setSelectedRows] = useState(() => new Set<number>()); //TODO: remove with selectedrow once working
    const [filters, setFilters] = useState<Filters>({
        position: 'All',
        team: 'All',
        name: ''
    });

    const playerSubset: Player[] = useMemo(() => {

        let filteredPlayers: Player[] = [...props.availablePlayers].filter(p => {
            return (
                (filters.position !== 'All' ? p.position === filters.position : true)
                && (filters.name ? p.name.toLowerCase().includes(filters.name.toLowerCase()) : true)
                && (filters.team !== 'All' ? p.team === filters.team : true)
            );
        });

        if (sortDirection === 'NONE') return filteredPlayers;

        let sortedPlayers: Player[] = [...filteredPlayers];
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
            default:
        }
        return sortDirection === 'DESC' ? sortedPlayers.reverse() : sortedPlayers;

    }, [props.availablePlayers, sortDirection, sortColumn, filters]);

    const handleRowsUpdate = useCallback(({fromRow, toRow, updated}: RowsUpdateEvent<Partial<Player>>) => {
        const newRows = [...playerSubset];

        for (let i = fromRow; i <= toRow; i++) {
            newRows[i] = {...newRows[i], ...updated};
        }

        props.onUpdatedAvailablePlayers(newRows);
    }, [props, playerSubset]);

    const handleSort = useCallback((columnKey: string, direction: SortDirection) => {
        setSort([columnKey, direction]);
    }, []);


    const onPlayerDraft = (e: React.MouseEvent<HTMLDivElement>, {rowIdx}: { rowIdx: number }) => {
        let player: Player = playerSubset[rowIdx];

        props.onDraftPlayer([player]);

        setFilters({
            position: 'All',
            team: 'All',
            name: ''
        });

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
                        rowRenderer={RowRenderer}
                    />
                )}
            </AutoSizer>
            {createPortal(
                <ContextMenu id="grid-context-menu">
                    <MenuItem onClick={onPlayerDraft}>Draft Player</MenuItem>
                </ContextMenu>,
                document.body
            )}
        </div>
    );
}

export default PlayerTable;
