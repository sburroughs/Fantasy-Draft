import React, {useCallback} from "react";
import {useDropzone} from "react-dropzone";
import Papa, {ParseResult} from 'papaparse';
import Button from "react-bootstrap/Button";
import {Player} from "../common/Player";
import {isBlockedAuctionShape, parseAuctionCsv, parseFlatCsv} from "../common/CsvParsers";
import Utility from "../common/Utility";
import {useDraftContext} from "../draft-manager/DraftContext";

const mergeFlatFields = (target: Player, incoming: Player): Player => {
    const merged = {...target};
    if (incoming.adp !== 999) merged.adp = incoming.adp;
    if (incoming.adpEspn !== 999) merged.adpEspn = incoming.adpEspn;
    if (incoming.adpSleeper !== 999) merged.adpSleeper = incoming.adpSleeper;
    if (incoming.adpUnderdog !== 999) merged.adpUnderdog = incoming.adpUnderdog;
    if (incoming.adpFantrax !== 999) merged.adpFantrax = incoming.adpFantrax;
    if (incoming.points !== 0) merged.points = incoming.points;
    if (incoming.vor !== 0) merged.vor = incoming.vor;
    return merged;
};

const mergeAuctionFields = (target: Player, incoming: Player): Player => {
    const merged = {...target};
    if (incoming.auctionValue !== 0) merged.auctionValue = incoming.auctionValue;
    if (incoming.bye !== 0) merged.bye = incoming.bye;
    return merged;
};

export interface MergeStatus {
    matched: number;
    unmatched: number;
}

export const MergePlayerData = (props: { onStatus?: (status: MergeStatus) => void }) => {
    const {onStatus} = props;
    const {availablePlayers, mergeAvailablePlayers} = useDraftContext();

    const onDrop = useCallback(acceptedFiles => {

        const merge = (data: ParseResult<string[]>) => {
            const blocked = isBlockedAuctionShape(data.data);
            const incomingPlayers = blocked ? parseAuctionCsv(data.data) : parseFlatCsv(data.data);
            const mergeFields = blocked ? mergeAuctionFields : mergeFlatFields;

            const byNameAndPosition = new Map<string, number>();
            const byNameOnly = new Map<string, number[]>();
            availablePlayers.forEach((p, idx) => {
                const stdName = Utility.standardizeName(p.name);
                byNameAndPosition.set(stdName + "|" + p.position, idx);
                byNameOnly.set(stdName, [...(byNameOnly.get(stdName) || []), idx]);
            });

            const updated = [...availablePlayers];
            let matched = 0;
            let unmatched = 0;

            incomingPlayers.forEach(incoming => {
                const stdName = Utility.standardizeName(incoming.name);
                let targetIdx = byNameAndPosition.get(stdName + "|" + incoming.position);
                if (targetIdx === undefined) {
                    const candidates = byNameOnly.get(stdName);
                    if (candidates && candidates.length === 1) {
                        targetIdx = candidates[0];
                    }
                }

                if (targetIdx === undefined) {
                    unmatched++;
                    return;
                }

                updated[targetIdx] = mergeFields(updated[targetIdx], incoming);
                matched++;
            });

            mergeAvailablePlayers(updated);
            onStatus?.({matched, unmatched});
        }

        const reader = new FileReader();
        reader.onabort = () => console.warn("file reading was aborted");
        reader.onerror = () => console.error("file reading failed");
        reader.onload = () => {
            const csv: string = reader.result as string
            const unparsedData = Papa.parse<string[]>(csv);
            merge(unparsedData);
        }

        acceptedFiles.forEach((file: File) => reader.readAsText(file));
    }, [availablePlayers, mergeAvailablePlayers, onStatus]);

    const {getRootProps, getInputProps} = useDropzone({onDrop});

    return (
        <Button>
            <span {...getRootProps()}>
                <input {...getInputProps()} />
                <span>Merge Player Data</span>
            </span>
        </Button>
    );
}
