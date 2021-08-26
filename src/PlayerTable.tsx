import React, {useCallback, useMemo, useState} from 'react';
import {AutoSizer} from 'react-virtualized';
import {ContextMenu, ContextMenuTrigger, MenuItem, SubMenu} from 'react-contextmenu';
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
import './react-contextmenu.css';
import './Player.css'
import {NflTeam, NflTeams, Player} from './Player';
import {createPortal} from "react-dom";

const columns: readonly Column<Player>[] = [
    {
        key: 'adp',
        name: 'ADP',
        width: 30,
        frozen: true,
        sortable: true,
    },
    {
        key: 'tier',
        name: 'Tier',
        width: 30,
        frozen: true,
        sortable: true,
        cellClass: () => {
            return "tier-filled"
        }
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
        ),
    },
    {
        key: 'points',
        name: 'Points',
        width: 30,
        frozen: true,
        sortable: true
    },
    {
        key: 'relativeValue',
        name: 'RV',
        width: 30,
        frozen: true,
        sortable: true,
        cellClass: () => {
            return "rv-filled"
        }
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
        ),
        cellClass: () => {
            return "position-filled"
        }
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
                    {NflTeams.map((team: NflTeam) =>
                        <option value={team.code}>{team.code}</option>
                    )}
                </select>
            </div>
        )
    }

];

const RowRenderer = (props: RowRendererProps<Player>) => {

    const getRowBackgroundClass = () => {

        let v = props.row.relativeValue;
        let color;
        if (v > 100)
            color = '1'
        else if (v > 80)
            color = '2'
        else if (v > 60)
            color = '3'
        else if (v > 40)
            color = '4'
        else if (v > 0)
            color = '5'
        else
            color = '6'

        return "rv-" + color;
    };

    function getRowTierColor() {
        return "tier-" + props.row.tier;
    }

    function getPositionColor() {
        return "position-" + props.row.position.toLowerCase();
    }

    return (
        <ContextMenuTrigger id="grid-context-menu" collect={() => ({rowIdx: props.rowIdx})}>
            <div className={getRowBackgroundClass() + " " + getRowTierColor() + " " + getPositionColor()}>
                <DataGridRow {...props} />
            </div>
        </ContextMenuTrigger>
    );
}


interface IProp {
    availablePlayers: Player[]
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

    const onPlayerTarget = (e: React.MouseEvent<HTMLDivElement>, {rowIdx}: { rowIdx: number }) => {
        let player: Player = playerSubset[rowIdx];
        console.log("targeting: " + player.name)
    }

    return (
        <div style={{flex: '1 1 auto', minHeight: '90vh'}}>
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
                    <SubMenu title="Target Player">
                        <MenuItem onClick={onPlayerTarget}>Aggressive</MenuItem>
                        <MenuItem onClick={onPlayerTarget}>Stretch</MenuItem>
                    </SubMenu>
                </ContextMenu>,
                document.body
            )}
        </div>
    );
}

export default PlayerTable;
