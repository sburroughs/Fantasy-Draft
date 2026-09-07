import {NflTeam, NflTeams, Player} from "../common/Player";
import React from "react";
import {Column, FormatterProps} from "react-data-grid";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import {useDraftContext} from "../draft-manager/DraftContext";

interface FilterRendererProps {
    value: string;
    onChange: (value: string) => void;
}

const DraftButtonFormatter = ({row}: FormatterProps<Player>) => {
    const {draftPlayers} = useDraftContext();
    return (
        <Button size="sm" variant="success" onClick={() => draftPlayers([row])}>
            Draft
        </Button>
    );
};

const AdpFormatter = ({row}: FormatterProps<Player>) => {
    const popover = (
        <Popover id={`notes-popover-${row.id}`}>
            <Popover.Header as="h3">{row.name} — ADP by Source</Popover.Header>
            <Popover.Body>
                <div>ESPN: {row.adpEspn}</div>
                <div>Sleeper: {row.adpSleeper}</div>
                <div>Underdog: {row.adpUnderdog}</div>
                <div>Fantrax: {row.adpFantrax}</div>
            </Popover.Body>
        </Popover>
    );
    return (
        <span className="adp-cell-content">
            <span className="adp-value">{row.adp}</span>
            <OverlayTrigger trigger="click" placement="right" overlay={popover} rootClose>
                <Button size="sm" variant="outline-secondary" className="notes-icon-button">
                    📝
                </Button>
            </OverlayTrigger>
        </span>
    );
};

export const Cells: Map<string, Column<Player>> = new Map<string, Column<Player>>([
    ["rank",
        {
            key: 'rank',
            name: 'Rank',
            width: 30,
            frozen: true,
            sortable: true
        }
    ],
    ["adp",
        {
            key: 'adp',
            name: 'ADP',
            width: 70,
            frozen: true,
            sortable: true,
            cellClass: () => {
                return "cell-adp"
            },
            formatter: AdpFormatter
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
            filterRenderer: (p: FilterRendererProps) => (
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
    ["vor",
        {
            key: 'vor',
            name: 'VOR',
            width: 30,
            frozen: true,
            sortable: true,
            cellClass: () => {
                return "vor-filled"
            }
        }
    ],
    ["position-rank",
        {
            key: 'positionRank',
            name: 'Pos Rank',
            width: 60,
            frozen: true,
            sortable: true
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
            filterRenderer: (p: FilterRendererProps) => (
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
            filterRenderer: (p: FilterRendererProps) => (
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
            },
            formatter: DraftButtonFormatter
        }
    ],
]);


