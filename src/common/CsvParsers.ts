import {Player} from "./Player";
import {updatePositionRank} from "./PlayerService";

const BLOCK_WIDTH = 5;

export function isBlockedAuctionShape(rows: string[][]): boolean {
    if (rows.length < 2) {
        return false;
    }
    return rows[1].some(cell => (cell || "").trim() === "$");
}

function emptyPlayer(id: number, name: string, position: string, team: string): Player {
    return {
        id: id,
        name: name,
        position: position,
        team: team,
        adp: 999,
        adpEspn: 999,
        adpSleeper: 999,
        adpUnderdog: 999,
        adpFantrax: 999,
        points: 0,
        vor: 0,
        rank: 999,
        positionRank: "",
        relativeValue: 0,
        age: 0,
        tier: 1,
        auctionValue: 0,
        bye: 0,
        purchasePrice: 0
    };
}

enum HeaderType {
    NAME = "NAME",
    POSITION = "POSITION",
    ADP = "ADP",
    ADP_ESPN = "ADP_ESPN",
    ADP_SLEEPER = "ADP_SLEEPER",
    ADP_UNDERDOG = "ADP_UNDERDOG",
    ADP_FANTRAX = "ADP_FANTRAX",
    TEAM = "TEAM",
    POINTS = "POINTS",
    VOR = "VOR",
    RANK = "RANK"
}

const findColumn = (indexRow: string[], candidates: string[]): number => {
    for (const candidate of candidates) {
        const index = indexRow.indexOf(candidate);
        if (index !== -1) {
            return index;
        }
    }
    return -1;
}

const getHeaderIndexes = (indexRow: string[]): Map<HeaderType, number> => {
    let indexMapping: Map<HeaderType, number> = new Map();
    indexMapping.set(HeaderType.NAME, findColumn(indexRow, ["Player"]));
    indexMapping.set(HeaderType.POSITION, findColumn(indexRow, ["Pos", "Position-Rank", "Position"]));
    indexMapping.set(HeaderType.ADP, findColumn(indexRow, ["ADP", "ADP ( Average )"]));
    indexMapping.set(HeaderType.ADP_ESPN, findColumn(indexRow, ["ADP (ESPN)"]));
    indexMapping.set(HeaderType.ADP_SLEEPER, findColumn(indexRow, ["ADP (Sleeper)"]));
    indexMapping.set(HeaderType.ADP_UNDERDOG, findColumn(indexRow, ["ADP (Underdog)"]));
    indexMapping.set(HeaderType.ADP_FANTRAX, findColumn(indexRow, ["ADP (Fantrax)"]));
    indexMapping.set(HeaderType.TEAM, findColumn(indexRow, ["Team"]));
    indexMapping.set(HeaderType.POINTS, findColumn(indexRow, ["FF Pts"]));
    indexMapping.set(HeaderType.VOR, findColumn(indexRow, ["VOR"]));
    indexMapping.set(HeaderType.RANK, findColumn(indexRow, ["Rank", "Overall Rank", "Overall"]));
    return indexMapping;
}

export function parseFlatCsv(rows: string[][]): Player[] {
    if (rows.length < 2) {
        return [];
    }
    const headerIndex = getHeaderIndexes(rows[0]);

    function resolveIndex(type: HeaderType): number {
        const index = headerIndex.get(type);
        return index === undefined || index === -1 ? 0 : index;
    }

    function resolveAdp(row: string[], type: HeaderType): number {
        const index = headerIndex.get(type);
        if (index === undefined || index === -1) {
            return 999;
        }
        const value = Math.round(Number(row[index]));
        return value ? value : 999;
    }

    return rows
        .slice(1)
        .filter((d: string[]) => d.length > 1)
        .map((row: string[], idx: number): Player => {
            const positionIndex = resolveIndex(HeaderType.POSITION);
            const position = (row[positionIndex] || "").substring(0, 2);

            const name = row[resolveIndex(HeaderType.NAME)];

            let adp = Math.round(Number(row[resolveIndex(HeaderType.ADP)]));
            if (!adp) {
                adp = 999;
            }

            const team = row[resolveIndex(HeaderType.TEAM)];

            const points = parseFloat(row[resolveIndex(HeaderType.POINTS)]);
            const roundedPoints = parseFloat((isNaN(points) ? 0 : points).toFixed(2));

            const vor = parseFloat(row[resolveIndex(HeaderType.VOR)]);
            const roundedVor = parseFloat((isNaN(vor) ? 0 : vor).toFixed(2));

            let rank = Math.round(Number(row[resolveIndex(HeaderType.RANK)]));
            if (!rank) {
                rank = 999;
            }

            return {
                ...emptyPlayer(idx, name, position, team),
                adp: adp,
                adpEspn: resolveAdp(row, HeaderType.ADP_ESPN),
                adpSleeper: resolveAdp(row, HeaderType.ADP_SLEEPER),
                adpUnderdog: resolveAdp(row, HeaderType.ADP_UNDERDOG),
                adpFantrax: resolveAdp(row, HeaderType.ADP_FANTRAX),
                points: roundedPoints,
                vor: roundedVor,
                rank: rank
            };
        });
}

interface PositionBlock {
    position: string;
    nameIndex: number;
    teamIndex: number;
    valueIndex: number;
    byeIndex: number;
}

const getBlocks = (positionRow: string[], subHeaderRow: string[]): PositionBlock[] => {
    const blocks: PositionBlock[] = [];
    for (let col = 0; col < positionRow.length; col += BLOCK_WIDTH) {
        const position = (positionRow[col] || "").trim();
        if (!position) {
            continue;
        }
        const subSlice = subHeaderRow.slice(col, col + BLOCK_WIDTH);
        const findSub = (candidates: string[]): number => {
            for (const candidate of candidates) {
                const idx = subSlice.findIndex(h => (h || "").trim().toLowerCase() === candidate.toLowerCase());
                if (idx !== -1) {
                    return col + idx;
                }
            }
            return -1;
        };
        blocks.push({
            position: position.substring(0, 2).toUpperCase(),
            nameIndex: findSub(["Player"]),
            teamIndex: findSub(["TM", "Team"]),
            valueIndex: findSub(["$"]),
            byeIndex: findSub(["BYE"])
        });
    }
    return blocks;
};

const parseNumericCell = (raw: string): number => {
    const cleaned = (raw || "").replace(/[^0-9.-]/g, "");
    const value = parseFloat(cleaned);
    return isNaN(value) ? 0 : Math.round(value);
};

export function parseAuctionCsv(rows: string[][]): Player[] {
    if (rows.length < 3) {
        return [];
    }

    const blocks = getBlocks(rows[0], rows[1]);
    let id = 0;
    const basePlayers: Player[] = [];

    rows.slice(2).forEach(row => {
        blocks.forEach(block => {
            const name = (row[block.nameIndex] || "").trim();
            if (!name) {
                return;
            }

            basePlayers.push({
                ...emptyPlayer(id++, name, block.position, (row[block.teamIndex] || "").trim()),
                auctionValue: parseNumericCell(row[block.valueIndex]),
                bye: parseNumericCell(row[block.byeIndex])
            });
        });
    });

    basePlayers.sort((a, b) => b.auctionValue - a.auctionValue);
    basePlayers.forEach((p, idx) => p.rank = idx + 1);
    updatePositionRank(basePlayers);

    return basePlayers;
}
