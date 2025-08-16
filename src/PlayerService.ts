import {Player} from "./Player";
import {ckmeans} from "simple-statistics";
import draftConfig from "./config/DefaultConfig.json"

export function updatePlayersRVandTier(basePlayers: Player[]) {

    let pointsByPosition: any = new Map<string, Player[]>();
    basePlayers.forEach(p => {
        let x = pointsByPosition.has(p.position) ? pointsByPosition.get(p.position) : []
        x.push(p);
        pointsByPosition.set(p.position, x);
    });

    let qb: Player[] = pointsByPosition.get("QB");
    let rb: Player[] = pointsByPosition.get("RB");
    let wr: Player[] = pointsByPosition.get("WR");
    let te: Player[] = pointsByPosition.get("TE");
    let k: Player[] = pointsByPosition.get("K");
    // let def: Player[] = pointsByPosition.get("DEF");

    let qbPoint: number[] = qb.slice(0, 32).map((p: Player) => p.points);
    let rbPoint: number[] = rb.slice(0, 64).map((p: Player) => p.points);
    let wrPoint: number[] = wr.slice(0, 64).map((p: Player) => p.points);
    let tePoint: number[] = te.slice(0, 32).map((p: Player) => p.points);
    let kPoint: number[] = k.slice(0, 32).map((p: Player) => p.points);
    // let defPoint: number[] = def.slice(0, 32).map((p: Player) => p.points);

    let qbCkValue = draftConfig.roster.starting.qb * draftConfig.teamCount;
    let rbCkValue = Math.round(draftConfig.roster.starting.rb * draftConfig.teamCount);
    let wrCkValue = Math.round(draftConfig.roster.starting.wr * draftConfig.teamCount);
    let teCkValue = draftConfig.roster.starting.te * draftConfig.teamCount;
    let kCkValue = draftConfig.roster.starting.k * draftConfig.teamCount;
    // let defCkValue = draftConfig.roster.starting.def * draftConfig.teamCount;

    let qbTiers: number[][] = ckmeans(qbPoint, draftConfig.compute.tiers.qb);
    let rbTiers: number[][] = ckmeans(rbPoint, draftConfig.compute.tiers.rb);
    let wrTiers: number[][] = ckmeans(wrPoint, draftConfig.compute.tiers.wr);
    let teTiers: number[][] = ckmeans(tePoint, draftConfig.compute.tiers.te);
    let kTiers: number[][] = ckmeans(kPoint, draftConfig.compute.tiers.k);
    // let defTiers: number[][] = ckmeans(defPoint, draftConfig.compute.tiers.def);

    // update players tiers
    updateTierAndRv(qb, qbTiers, qbCkValue);
    updateTierAndRv(rb, rbTiers, rbCkValue);
    updateTierAndRv(wr, wrTiers, wrCkValue);
    updateTierAndRv(te, teTiers, teCkValue);
    updateTierAndRv(k, kTiers, kCkValue);
    // updateTierAndRv(def, defTiers, defCkValue);

}

function updateTierAndRv(players: Player[], tiers: number[][], rvIndex: number) {
    let index = 0;
    let tier = 0;

    let rvValue: number = players[rvIndex].points;

    for (let i = tiers.length - 1; i >= 0; i--) {
        tier++;
        for (let j = tiers[i].length - 1; j >= 0; j--) {
            let p: Player = players[index];
            if (tiers[i][j] !== players[index].points) {
                console.log("Mismatch encountered: " + tiers[i][j] + " " + players[index].points);
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
    let defCkValue = draftConfig.roster.starting.k * draftConfig.teamCount;

    let pointsByPosition: any = new Map<string, Player[]>();
    players.forEach(p => {
        let x = pointsByPosition.has(p.position) ? pointsByPosition.get(p.position) : []
        x.push(p);
        pointsByPosition.set(p.position, x);
    });


    function getPoints(pl: Player[], ckValue: number): number {

        if (pl === undefined || pl.length === 0 || ckValue > pl.length - 1) {
            return 0;
        }

        return pl[ckValue] ? pl[ckValue].points : pl[pl.length - 1].points;

    }

    let qb: Player[] = pointsByPosition.get("QB");
    let rb: Player[] = pointsByPosition.get("RB");
    let wr: Player[] = pointsByPosition.get("WR");
    let te: Player[] = pointsByPosition.get("TE");
    let k: Player[] = pointsByPosition.get("K");
    let def: Player[] = pointsByPosition.get("DEF");

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