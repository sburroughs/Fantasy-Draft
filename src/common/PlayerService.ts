import {Player} from "./Player";
import {ckmeans} from "simple-statistics";
import draftConfig from "../config/DefaultConfig.json"

export function updatePlayersRVandTier(basePlayers: Player[]) {

    updatePositionRank(basePlayers);

    let pointsByPosition: Map<string, Player[]> = new Map<string, Player[]>();
    basePlayers.forEach(p => {
        let x = pointsByPosition.has(p.position) ? pointsByPosition.get(p.position)! : []
        x.push(p);
        pointsByPosition.set(p.position, x);
    });

    let qb: Player[] = pointsByPosition.get("QB") || [];
    let rb: Player[] = pointsByPosition.get("RB") || [];
    let wr: Player[] = pointsByPosition.get("WR") || [];
    let te: Player[] = pointsByPosition.get("TE") || [];
    let k: Player[] = pointsByPosition.get("K") || [];
    // let def: Player[] = pointsByPosition.get("DEF") || [];

    let qbCkValue = draftConfig.roster.starting.qb * draftConfig.teamCount;
    let rbCkValue = Math.round(draftConfig.roster.starting.rb * draftConfig.teamCount);
    let wrCkValue = Math.round(draftConfig.roster.starting.wr * draftConfig.teamCount);
    let teCkValue = draftConfig.roster.starting.te * draftConfig.teamCount;
    let kCkValue = draftConfig.roster.starting.k * draftConfig.teamCount;
    // let defCkValue = draftConfig.roster.starting.def * draftConfig.teamCount;

    // update players tiers, skipping any position missing from the uploaded file
    computeTierAndRv(qb, draftConfig.compute.tiers.qb, qbCkValue, 32);
    computeTierAndRv(rb, draftConfig.compute.tiers.rb, rbCkValue, 64);
    computeTierAndRv(wr, draftConfig.compute.tiers.wr, wrCkValue, 64);
    computeTierAndRv(te, draftConfig.compute.tiers.te, teCkValue, 32);
    computeTierAndRv(k, draftConfig.compute.tiers.k, kCkValue, 32);
    // computeTierAndRv(def, draftConfig.compute.tiers.def, defCkValue, 32);

}

export function updatePositionRank(players: Player[]) {
    let playersByPosition: Map<string, Player[]> = new Map<string, Player[]>();
    players.forEach(p => {
        let x = playersByPosition.has(p.position) ? playersByPosition.get(p.position)! : []
        x.push(p);
        playersByPosition.set(p.position, x);
    });

    playersByPosition.forEach((positionPlayers, position) => {
        [...positionPlayers]
            .sort((a, b) => a.rank - b.rank)
            .forEach((p, index) => {
                p.positionRank = position + (index + 1);
            });
    });
}

function computeTierAndRv(players: Player[], tierCount: number, rvIndex: number, sliceSize: number) {
    if (players.length === 0) {
        return;
    }
    let sortedByPoints: Player[] = [...players].sort((a, b) => b.points - a.points);
    let points: number[] = sortedByPoints.slice(0, sliceSize).map((p: Player) => p.points);
    let tiers: number[][] = ckmeans(points, Math.min(tierCount, points.length));
    updateTierAndRv(sortedByPoints, tiers, rvIndex);
}

function updateTierAndRv(players: Player[], tiers: number[][], rvIndex: number) {
    let index = 0;
    let tier = 0;

    let rvValue: number = players[Math.min(rvIndex, players.length - 1)].points;

    for (let i = tiers.length - 1; i >= 0; i--) {
        tier++;
        for (let j = tiers[i].length - 1; j >= 0; j--) {
            let p: Player = players[index];
            if (tiers[i][j] !== players[index].points) {
                console.warn("Tier mismatch: expected " + tiers[i][j] + ", got " + players[index].points);
            }
            p.tier = tier;
            p.relativeValue = parseFloat((p.points - rvValue).toFixed(2))
            index++;
        }
    }
    tier++;
    for (index; index < players.length; index++) {
        let p = players[index];
        p.tier = tier;
        p.relativeValue = parseFloat((p.points - rvValue).toFixed(2))
    }
}

export function updateRV(players: Player[]) {

    let qbCkValue = draftConfig.roster.starting.qb * draftConfig.teamCount;
    let rbCkValue = draftConfig.roster.starting.rb * draftConfig.teamCount;
    let wrCkValue = draftConfig.roster.starting.wr * draftConfig.teamCount;
    let teCkValue = draftConfig.roster.starting.te * draftConfig.teamCount;
    let kCkValue = draftConfig.roster.starting.k * draftConfig.teamCount;
    let defCkValue = draftConfig.roster.starting.def * draftConfig.teamCount;

    let pointsByPosition: Map<string, Player[]> = new Map<string, Player[]>();
    players.forEach(p => {
        let x = pointsByPosition.has(p.position) ? pointsByPosition.get(p.position)! : []
        x.push(p);
        pointsByPosition.set(p.position, x);
    });


    function getPoints(pl: Player[], ckValue: number): number {

        if (pl === undefined || pl.length === 0 || ckValue > pl.length - 1) {
            return 0;
        }

        return pl[ckValue] ? pl[ckValue].points : pl[pl.length - 1].points;

    }

    let qb: Player[] = pointsByPosition.get("QB")!;
    let rb: Player[] = pointsByPosition.get("RB")!;
    let wr: Player[] = pointsByPosition.get("WR")!;
    let te: Player[] = pointsByPosition.get("TE")!;
    let k: Player[] = pointsByPosition.get("K")!;
    let def: Player[] = pointsByPosition.get("DEF")!;

    let qbRvValue = getPoints(qb, qbCkValue);
    let rbRvValue = getPoints(rb, rbCkValue);
    let wrRvValue = getPoints(wr, wrCkValue);
    let teRvValue = getPoints(te, teCkValue);
    let kRvValue = getPoints(k, kCkValue);
    let defRvValue = getPoints(def, defCkValue);

    players.forEach((p: Player) => {

        let rvValue = 100;
        switch (p.position) {
            case "QB":
                rvValue = qbRvValue;
                break;
            case "RB":
                rvValue = rbRvValue;
                break;
            case "WR":
                rvValue = wrRvValue;
                break;
            case "TE":
                rvValue = teRvValue;
                break;
            case "K":
                rvValue = kRvValue;
                break;
            case "def":
                rvValue = defRvValue;
                break;
            default:
                console.error("Unknown position: " + p.position)
                break;
        }

        p.relativeValue = parseFloat((p.points - rvValue).toFixed(2))
    });
}