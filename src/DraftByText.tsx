import React, {useState} from "react";
import Utility from "./Utility";
import {NflTeam, NflTeams, Player} from "./Player";

interface Props {
    availablePlayers: Player[]
    draftedPlayers: Player[]
    onSubmit: any
}

const DraftByText = (props: Props) => {

    const [draftByTextValue, setDraftByTextValue] = useState("[]");
    const [lastImportedIndex, setLastImportedIndex] = useState(0);

    const draftByText = (event: any) => {
        event.preventDefault();

        let playerNames: string[] = [];
        try {
            playerNames = JSON.parse(draftByTextValue);
        } catch (e) {
            console.error(e);
        }

        let draftedIndex = lastImportedIndex;
        let draftedPlayers = props.draftedPlayers;
        let firstDraftedPlayer = draftedPlayers[0];
        if (firstDraftedPlayer) {

            let startAtIndex = Utility.standardizeName(firstDraftedPlayer.name) === Utility.standardizeName(playerNames[0]);
            if (startAtIndex) {
                // set index on start by finding last successful drafted player.
                // this is a workaround used only the draftbytext module
                let startAtIndex = playerNames.findIndex((name) => Utility.standardizeName(name) === Utility.standardizeName(playerNames[draftedPlayers.length - 1]));
                if (startAtIndex >= 0) {
                    draftedIndex = startAtIndex;
                    console.log("Expecting full draft json. Skipping: " + draftedIndex);

                    //remove already drafted players
                    playerNames = playerNames.splice(draftedIndex + 1);
                    console.log("Removed players already drafted: " + draftedIndex);
                }
            }
        }

        let selectedPlayers = [];
        for (let i = 0; i < playerNames.length; i++) {
            let n = playerNames[i];
            let name = Utility.standardizeName(n)

            let matchingPlayers: Player[] = props.availablePlayers.filter((p: Player) => Utility.standardizeName(p.name) === name);

            if (matchingPlayers.length === 0) {
                console.log("No Available Players Matching: " + n);
                //attempt fuzzy match. Def match, etc
                if (name.includes("dst")) {
                    let search = name.substring(0, name.lastIndexOf(' '));
                    let team: NflTeam = NflTeams.find(f => f.shortName.toLowerCase() === search) || {
                        shortName: "UNKNOWN",
                        code: "UNKNOWN",
                        fullName: "UNKNOWN",
                        locationName: "UNKNOWN"
                    }
                    matchingPlayers = props.availablePlayers.filter(p => Utility.standardizeName(p.name).includes(team.locationName.toLowerCase()))
                    if (matchingPlayers.length > 0) {
                        console.log("MATCH: " + matchingPlayers[0].name);
                        // continue;
                    }
                }


                break;
            }

            let selectedPlayer = matchingPlayers[0];
            if (matchingPlayers.length > 1) {
                //TODO: narrow down results by position, team
                selectedPlayer = matchingPlayers[0];
            }
            selectedPlayers.push(selectedPlayer);

        }

        props.onSubmit(selectedPlayers);

        let remainingPlayers = playerNames.splice(selectedPlayers.length);
        let updatedText = JSON.stringify(remainingPlayers);

        setDraftByTextValue(updatedText);
        setLastImportedIndex(draftedIndex + selectedPlayers.length);


    }

    return (


        <form className={"panel"} onSubmit={draftByText}>
            <label>
                Name:
                <textarea id={"draft-by-text-input"} value={draftByTextValue} onChange={
                    (e) => setDraftByTextValue(e.target.value)
                }/>
            </label>
            <input type="submit" value="Submit"/>
        </form>
    );
}

export default DraftByText;