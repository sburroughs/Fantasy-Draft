import React, {useCallback} from "react";
import {useDropzone} from "react-dropzone";
import Papa, {ParseResult} from 'papaparse';
import {Player} from "./Player";
import {updatePlayersRVandTier} from "./PlayerService"

export const PlayerUpload = (props: {onChangeValue: any}) => {

    const {onChangeValue} = props;

    const onDrop = useCallback(acceptedFiles => {

        const parse = (data: ParseResult): Player[] => {

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
        }

        const getHeaderIndexes = (indexRow: any): Map<HeaderType, number> => {
            let indexMapping: Map<HeaderType, number> = new Map();
            indexMapping.set(HeaderType.NAME, indexRow.indexOf("Player"));
            indexMapping.set(HeaderType.POSITION, indexRow.indexOf("Pos"));
            indexMapping.set(HeaderType.ADP, indexRow.indexOf("ADP"));
            indexMapping.set(HeaderType.TEAM, indexRow.indexOf("Team"));
            indexMapping.set(HeaderType.POINTS, indexRow.indexOf("FF Pts"));
            return indexMapping;
        }

        const getPlayer = (row: any, headerIndex: Map<HeaderType, number>, idx: any): Player => {

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
                age: 0,
                tier: 1
            };
        }

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
    }, [onChangeValue]);

    const {getRootProps, getInputProps} = useDropzone({onDrop});

    return (
        <span {...getRootProps()}>
            <input {...getInputProps()} />
            <span>Upload Players</span>
        </span>
    );


}