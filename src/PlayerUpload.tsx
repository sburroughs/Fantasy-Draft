import React, {useCallback} from "react";
import {useDropzone} from "react-dropzone";
import Papa, {ParseResult} from 'papaparse';
import {Player} from "./Player";
import {ckmeans, equalIntervalBreaks} from 'simple-statistics'


export const PlayerUpload = (props: any) => {

    const {onChangeValue} = props;

    const onDrop = useCallback(acceptedFiles => {
        const reader = new FileReader();
        reader.onabort = () => console.log("file reading was aborted");
        reader.onerror = () => console.log("file reading failed");
        reader.onload = () => {
            const csv: string = reader.result as string
            const unparsedData = Papa.parse(csv);
            const parsedResults: Player[] = parse(unparsedData);
            onChangeValue(parsedResults);
        }

        acceptedFiles.forEach((file: any) => reader.readAsText(file));
    }, []);

    const {getRootProps, getInputProps} = useDropzone({onDrop});

    function getHeaderIndexes(indexRow: any): Map<HeaderType, number> {
        let indexMapping: Map<HeaderType, number> = new Map();
        indexMapping.set(HeaderType.NAME, indexRow.indexOf("Player"));
        indexMapping.set(HeaderType.POSITION, indexRow.indexOf("Pos"));
        indexMapping.set(HeaderType.ADP, indexRow.indexOf("ADP"));
        indexMapping.set(HeaderType.TEAM, indexRow.indexOf("Team"));
        indexMapping.set(HeaderType.POINTS, indexRow.indexOf("FF Pts"));
        return indexMapping;
    }

    function updateTier(players: Player[], tiers: number[][], rvIndex: number) {
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

    function updatePlayersRVandTier(basePlayers: Player[]) {

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

        let qbPoint: number[] = qb.slice(0, 32).map((p: Player) => p.points);
        let rbPoint: number[] = rb.slice(0, 64).map((p: Player) => p.points);
        let wrPoint: number[] = wr.slice(0, 64).map((p: Player) => p.points);
        let tePoint: number[] = te.slice(0, 32).map((p: Player) => p.points);
        let kPoint: number[] = k.slice(0, 32).map((p: Player) => p.points);

        let qbTiers: number[][] = ckmeans(qbPoint, 12);
        let rbTiers: number[][] = ckmeans(rbPoint, 24);
        let wrTiers: number[][] = ckmeans(wrPoint, 24);
        let teTiers: number[][] = ckmeans(tePoint, 12);
        let kTiers: number[][] = ckmeans(kPoint, 12);

        // update players tiers
        updateTier(qb, qbTiers, 12);
        updateTier(rb, rbTiers, 24);
        updateTier(wr, wrTiers, 24);
        updateTier(te, teTiers, 12);
        updateTier(k, kTiers, 12);

    }

    function parse(data: ParseResult): Player[] {

        let indexMapping = getHeaderIndexes(data.data[0]);
        let basePlayers: Player[] = data.data
            .splice(1) // we already have header indexes. remove index row.
            .filter(d => d.length > 1) // ensure valid row. helps remove "" empty rows.
            .map((d, idx) => getPlayer(d, indexMapping, idx));

        updatePlayersRVandTier(basePlayers);

        return basePlayers;

    }

    enum HeaderType {
        NAME = "NAME",
        POSITION = "POSITION",
        ADP = "ADP",
        TEAM = "TEAM",
        POINTS = "POINTS"
    };

    // function updateValue(player: Player): Player {
    //     player.relativeValue = 100;
    //     return player;
    // }

    //TODO: build in logic so with additional tiers, the dropoff between later tiers is more equalized
    function calculateTierBasedValue(tier: any, tierSpan: any) {
        // 200 represents range of -100 to 100
        let increment = 200 / tierSpan;
        let value = (tierSpan - tier) * increment
        // bring value back into -100 to 100 range.
        let adjustedValue = value - 100;
        return adjustedValue;
    }


    function getPlayer(row: any, headerIndex: Map<HeaderType, number>, idx: any): Player {

        function defaultIndex(): number {
            return 0;
        }

        let positionIndex: number = headerIndex.get(HeaderType.POSITION) || defaultIndex()
        let position = row[positionIndex].substring(0, 2);

        let nameIndex: number = headerIndex.get(HeaderType.NAME) || defaultIndex()
        let name = row[nameIndex]

        let adpIndex: number = headerIndex.get(HeaderType.ADP) || defaultIndex()
        let adp = Math.round(row[adpIndex]);
        if (!adp) {
            adp = 999;// default
        }

        let teamIndex: number = headerIndex.get(HeaderType.TEAM) || defaultIndex()
        let team = row[teamIndex]

        let pointsIndex: number = headerIndex.get(HeaderType.POINTS) || defaultIndex()
        let points: number = parseFloat(row[pointsIndex])
        let roundedPoints: number = parseFloat(points.toFixed(2))

        return {
            id: idx,
            name: name,
            position: position,
            adp: adp,
            team: team,
            points: roundedPoints,
            relativeValue: 0,
            tier: 1
        };

    }


    return (
        <span {...getRootProps()}>
            <input {...getInputProps()} />
            <span>Upload Players</span>
        </span>
    );


}