import React, {useCallback} from "react";
import {useDropzone} from "react-dropzone";
import Papa, {ParseResult} from 'papaparse';
import {Player} from "../common/Player";
import {updatePlayersRVandTier} from "../common/PlayerService"

export const PlayerUpload = (props: {onChangeValue: (players: Player[]) => void}) => {

    const {onChangeValue} = props;

    const onDrop = useCallback(acceptedFiles => {

        const parse = (data: ParseResult<string[]>): Player[] => {

            let indexMapping = getHeaderIndexes(data.data[0]);
            let basePlayers: Player[] = data.data
                .slice(1) // we already have header indexes. skip header row.
                .filter((d: string[]) => d.length > 1) // ensure valid row. helps remove "" empty rows.
                .map((d: string[], idx: number) => getPlayer(d, indexMapping, idx));

            updatePlayersRVandTier(basePlayers);

            return basePlayers;

        }

        enum HeaderType {
            NAME = "NAME",
            POSITION = "POSITION",
            ADP = "ADP",
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
            indexMapping.set(HeaderType.TEAM, findColumn(indexRow, ["Team"]));
            indexMapping.set(HeaderType.POINTS, findColumn(indexRow, ["FF Pts"]));
            indexMapping.set(HeaderType.VOR, findColumn(indexRow, ["VOR"]));
            indexMapping.set(HeaderType.RANK, findColumn(indexRow, ["Rank", "Overall Rank", "Overall"]));
            return indexMapping;
        }

        const getPlayer = (row: string[], headerIndex: Map<HeaderType, number>, idx: number): Player => {

            function resolveIndex(type: HeaderType): number {
                const index = headerIndex.get(type);
                return index === undefined || index === -1 ? 0 : index;
            }

            let positionIndex: number = resolveIndex(HeaderType.POSITION)
            let position = (row[positionIndex] || "").substring(0, 2);

            let nameIndex: number = resolveIndex(HeaderType.NAME)
            let name = row[nameIndex]

            let adpIndex: number = resolveIndex(HeaderType.ADP)
            let adp = Math.round(Number(row[adpIndex]));
            if (!adp) {
                adp = 999;// default
            }

            let teamIndex: number = resolveIndex(HeaderType.TEAM)
            let team = row[teamIndex]

            let pointsIndex: number = resolveIndex(HeaderType.POINTS)
            let points: number = parseFloat(row[pointsIndex])
            let roundedPoints: number = parseFloat(points.toFixed(2))

            let vorIndex: number = resolveIndex(HeaderType.VOR)
            let vor: number = parseFloat(row[vorIndex])
            let roundedVor: number = parseFloat((isNaN(vor) ? 0 : vor).toFixed(2))

            let rankIndex: number = resolveIndex(HeaderType.RANK)
            let rank = Math.round(Number(row[rankIndex]));
            if (!rank) {
                rank = 999;// default
            }

            return {
                id: idx,
                name: name,
                position: position,
                adp: adp,
                team: team,
                points: roundedPoints,
                vor: roundedVor,
                rank: rank,
                positionRank: "",
                relativeValue: 0,
                age: 0,
                tier: 1
            };
        }

        const reader = new FileReader();
        reader.onabort = () => console.warn("file reading was aborted");
        reader.onerror = () => console.error("file reading failed");
        reader.onload = () => {
            const csv: string = reader.result as string
            const unparsedData = Papa.parse<string[]>(csv);
            const parsedResults: Player[] = parse(unparsedData);
            onChangeValue(parsedResults);
        }

        acceptedFiles.forEach((file: File) => reader.readAsText(file));
    }, [onChangeValue]);

    const {getRootProps, getInputProps} = useDropzone({onDrop});

    return (
        <span {...getRootProps()}>
            <input {...getInputProps()} />
            <span>Upload Players</span>
        </span>
    );


}