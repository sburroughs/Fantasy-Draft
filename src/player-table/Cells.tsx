import {NflTeam, NflTeams} from "../common/Player";
import React from "react";

export const Cells: any = new Map<string, any>([
    ["adp",
        {
            key: 'adp',
            name: 'ADP',
            width: 30,
            frozen: true,
            sortable: true
        }
    ],
    ["tier",
        {
            key: 'tier',
            name: 'Tier',
            width: 30,
            frozen: true,
            sortable: true,
            cellClass: () => {
                return "tier-filled"
            }
        }
    ],
    ["name",
        {
            key: 'name',
            name: 'Name',
            frozen: true,
            sortable: true,
            filterRenderer: (p: any) => (
                <div className="rdg-filter-container">
                    <input
                        className="rdg-filter input-sm"
                        value={p.value}
                        onChange={e => p.onChange(e.target.value)}
                    />
                </div>
            ),
        }
    ],
    ["points",
        {
            key: 'points',
            name: 'Points',
            width: 30,
            frozen: true,
            sortable: true
        }
    ],
    ["rv",
        {
            key: 'relativeValue',
            name: 'RV',
            width: 30,
            frozen: true,
            sortable: true,
            cellClass: () => {
                return "rv-filled"
            }
        }
    ],
    ["age",
        {
            key: 'age',
            name: 'Age',
            width: 30,
            frozen: true,
            sortable: true
        }
    ],
    ["position",
        {
            key: 'position',
            name: 'Position',
            width: 30,
            frozen: true,
            sortable: false,
            filterRenderer: (p: any) => (
                <div className="rdg-filter-container">
                    <select className="rdg-filter" value={p.value} onChange={e => p.onChange(e.target.value)}>
                        <option value="All">All</option>
                        <option value="QB">QB</option>
                        <option value="RB">RB</option>
                        <option value="WR">WR</option>
                        <option value="TE">TE</option>
                        <option value="K">K</option>
                        <option value="DEFENSE">DEF</option>
                    </select>
                </div>
            ),
            cellClass: () => {
                return "position-filled"
            }
        }
    ],
    ["team",
        {
            key: 'team',
            name: 'Team',
            width: 60,
            frozen: true,
            sortable: false,
            filterRenderer: (p: any) => (
                <div className="rdg-filter-container">
                    <select className="rdg-filter" value={p.value} onChange={e => p.onChange(e.target.value)}>
                        <option value="All">All</option>
                        {NflTeams.map((team: NflTeam) =>
                            <option key={team.code} value={team.code}>{team.code}</option>
                        )}
                    </select>
                </div>
            )
        }
    ],
    ["draft-player",
        {
            key: 'draft-player',
            name: 'Draft',
            width: 60,
            frozen: true,
            sortable: false,
            cellClass: () => {
                return "draft-cell"
            }
        }
    ],
]);


