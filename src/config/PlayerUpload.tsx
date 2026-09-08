import React, {useCallback} from "react";
import {useDropzone} from "react-dropzone";
import Papa, {ParseResult} from 'papaparse';
import {Player} from "../common/Player";
import {updatePlayersRVandTier} from "../common/PlayerService"
import {parseFlatCsv} from "../common/CsvParsers";

export const PlayerUpload = (props: {onChangeValue: (players: Player[]) => void}) => {

    const {onChangeValue} = props;

    const onDrop = useCallback(acceptedFiles => {

        const parse = (data: ParseResult<string[]>): Player[] => {
            const basePlayers = parseFlatCsv(data.data);
            updatePlayersRVandTier(basePlayers);
            return basePlayers;
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
