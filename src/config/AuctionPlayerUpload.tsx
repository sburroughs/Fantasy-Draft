import React, {useCallback} from "react";
import {useDropzone} from "react-dropzone";
import Papa, {ParseResult} from 'papaparse';
import {Player} from "../common/Player";
import {updateAuctionPlayersValueAndTier} from "../common/PlayerService"
import {parseAuctionCsv} from "../common/CsvParsers";

export const AuctionPlayerUpload = (props: { onChangeValue: (players: Player[]) => void }) => {

    const {onChangeValue} = props;

    const onDrop = useCallback(acceptedFiles => {

        const parse = (data: ParseResult<string[]>): Player[] => {
            const basePlayers = parseAuctionCsv(data.data);
            updateAuctionPlayersValueAndTier(basePlayers);
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
            <span>Upload Auction Values</span>
        </span>
    );

}
