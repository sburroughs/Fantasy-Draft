import React, {useCallback} from "react";
import {useDropzone} from "react-dropzone";
import Papa, {ParseResult} from 'papaparse';
import {Player} from "./Player";


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
        indexMapping.set(HeaderType.NAME, indexRow.indexOf("Overall"));
        indexMapping.set(HeaderType.POSITION, indexRow.indexOf("Pos"));
        indexMapping.set(HeaderType.ADP, indexRow.indexOf("ADP"));
        indexMapping.set(HeaderType.TEAM, indexRow.indexOf("Team"));
        indexMapping.set(HeaderType.TIER, indexRow.indexOf("Tier"));
        return indexMapping;
    }

    function parse(data: ParseResult): Player[] {

        let indexMapping = getHeaderIndexes(data.data[0]);
        let basePlayers: Player[] = data.data
            .splice(1) // we already have header indexes. remove index row.
            .filter(d => d.length > 1) // ensure valid row. helps remove "" empty rows.
            .map((d, idx) => getPlayer(d, indexMapping, idx));
        return basePlayers;

    }

    enum HeaderType {
        NAME = "NAME",
        POSITION = "POSITION",
        ADP = "ADP",
        TEAM = "TEAM",
        TIER = "TIER"
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

        let tierIndex: number = headerIndex.get(HeaderType.TIER) || defaultIndex()
        let tier = row[tierIndex]

        let value = calculateTierBasedValue(tier, 16);

        return {
            id: idx,
            name: name,
            position: position,
            adp: adp,
            team: team,
            relativeValue: value
        };

    }



    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            <p>Upload Players</p>
        </div>
    );


}