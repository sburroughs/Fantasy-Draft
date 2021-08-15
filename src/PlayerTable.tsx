import React, {useCallback, useMemo, useState} from 'react';
import {AutoSizer} from 'react-virtualized';
import {ContextMenu, ContextMenuTrigger, MenuItem, SubMenu} from 'react-contextmenu';
import DataGrid, {
    Column,
    Filters,
    Row as DataGridRow,
    RowRendererProps,
    RowsUpdateEvent,
    SelectColumn,
    SortDirection
} from 'react-data-grid';
import 'react-data-grid/dist/react-data-grid.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './react-contextmenu.css';
import './Player.css'
import {NflTeam, NflTeams, Player, Team} from './Player';
import {createPortal} from "react-dom";


const columns: readonly Column<Player>[] = [
    SelectColumn,
    {
        key: 'adp',
        name: 'ADP',
        width: 30,
        frozen: true,
        sortable: true
    },
    {
        key: 'name',
        name: 'Name',
        frozen: true,
        sortable: true,
        filterRenderer: p => (
            <div className="rdg-filter-container">
                <input
                    className="rdg-filter input-sm"
                    value={p.value}
                    onChange={e => p.onChange(e.target.value)}
                />
            </div>
        )
    },
    {
        key: 'relativeValue',
        name: 'RV',
        width: 90,
        frozen: true,
        sortable: true
    },
    {
        key: 'position',
        name: 'Position',
        width: 30,
        frozen: true,
        sortable: false,
        filterRenderer: p => (
            <div className="rdg-filter-container">
                <select className="rdg-filter" value={p.value} onChange={e => p.onChange(e.target.value)}>
                    <option value="All">All</option>
                    <option value="QB">QB</option>
                    <option value="RB">RB</option>
                    <option value="WR">WR</option>
                    <option value="TE">TE</option>
                </select>
            </div>
        )
    },
    {
        key: 'team',
        name: 'Team',
        width: 60,
        frozen: true,
        sortable: false,
        filterRenderer: p => (
            <div className="rdg-filter-container">
                <select className="rdg-filter" value={p.value} onChange={e => p.onChange(e.target.value)}>
                    <option value="All">All</option>
                    {NflTeams.map((team: NflTeam) => {
                        return <option value={team.code}>{team.code}</option>
                    })}
                </select>
            </div>
        )
    }

];

function RowRenderer(props: RowRendererProps<Player>) {
    return (
        <ContextMenuTrigger id="grid-context-menu" collect={() => ({rowIdx: props.rowIdx})}>
            <DataGridRow {...props} />
        </ContextMenuTrigger>
    );
}


interface IProp {
    availablePlayers: any
    onDraftPlayer: any
    onUpdatedAvailablePlayers: any
}

function PlayerTable(props: IProp) {

    const [[sortColumn, sortDirection], setSort] = useState<[string, SortDirection]>(['adp', 'ASC']);
    const [selectedRows, setSelectedRows] = useState(() => new Set<number>()); //TODO: remove with selectedrow once working
    const [filters, setFilters] = useState<Filters>({
        position: 'All',
        team: 'All',
        name: ''
    });

    const playerSubset: readonly Player[] = useMemo(() => {

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
            case 'relativeValue':
                sortedPlayers = sortedPlayers.sort((a, b) => a[sortColumn] - b[sortColumn]);
                break;
            default:
        }
        return sortDirection === 'DESC' ? sortedPlayers.reverse() : sortedPlayers;

    }, [props.availablePlayers, sortDirection, sortColumn, filters]);


    function clearFilters() {
        setFilters({
            position: 'All',
            team:'All',
            name: ''
        });
    }


    const handleRowsUpdate = useCallback(({fromRow, toRow, updated}: RowsUpdateEvent<Partial<Player>>) => {
        const newRows = [...playerSubset];

        for (let i = fromRow; i <= toRow; i++) {
            newRows[i] = {...newRows[i], ...updated};
        }

        props.onUpdatedAvailablePlayers(newRows);
    }, [playerSubset, selectedRows]);

    const handleSort = useCallback((columnKey: string, direction: SortDirection) => {
        setSort([columnKey, direction]);
    }, []);


    function onPlayerDraft(e: React.MouseEvent<HTMLDivElement>, {rowIdx}: { rowIdx: number }) {
        let player: Player = playerSubset[rowIdx];

        props.onDraftPlayer([player]);

        clearFilters();

    }

    function blankCallback(e: React.MouseEvent<HTMLDivElement>, {rowIdx}: { rowIdx: number }) {
    }


    return (
        <div style={{flex: '1 1 auto', height: '95vh'}}>
            <AutoSizer>
                {({height, width}) => (
                    <DataGrid
                        rowKey="id"
                        columns={columns}
                        rows={playerSubset}
                        width={width}
                        height={height - 150}
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
                    <SubMenu title="Target Player">
                        <MenuItem onClick={blankCallback}>Aggressive</MenuItem>
                        <MenuItem onClick={blankCallback}>Stretch</MenuItem>
                    </SubMenu>
                </ContextMenu>,
                document.body
            )}
        </div>
    );
}

export default PlayerTable;
