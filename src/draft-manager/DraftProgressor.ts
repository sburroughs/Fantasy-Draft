import {IDraftStatus} from "../common/Player";

export const nextTurnSnake = (draftStatus: IDraftStatus, teams: any) => {

    let updatedTeam, updatedRound, updatedRoundPick;
    let updatedPick = draftStatus.currentPick + 1

    let count = updatedPick % (teams.length * 2);
    if (count === teams.length + 1 || count === 1) {
        //hold
        updatedTeam = draftStatus.currentTeam;
        updatedRound = draftStatus.currentRound + 1;
        updatedRoundPick = 1;
    } else if (count <= teams.length && count !== 0) {
        //increase
        updatedTeam = draftStatus.currentTeam + 1;
        updatedRound = draftStatus.currentRound;
        updatedRoundPick = draftStatus.currentRoundPick + 1;
    } else if (count > teams.length || count === 0) {
        //decrease
        updatedTeam = draftStatus.currentTeam - 1;
        updatedRound = draftStatus.currentRound;
        updatedRoundPick = draftStatus.currentRoundPick + 1
    }

    return {
        currentTeam: updatedTeam,
        currentRound: updatedRound,
        currentRoundPick: updatedRoundPick,
        currentPick: updatedPick
    }
}

export const previousTurnSnake = (draftStatus: IDraftStatus, teams: any) => {

    let updatedTeam, updatedRound, updatedRoundPick;
    let updatedPick = draftStatus.currentPick - 1

    let count = updatedPick % (teams.length * 2);
    if (count === teams.length || count === 0) {
        //hold
        updatedTeam = draftStatus.currentTeam;
        updatedRound = draftStatus.currentRound - 1;
        updatedRoundPick = teams.length;
    } else if (count <= teams.length && count !== 0) {
        //decrease
        updatedTeam = draftStatus.currentTeam - 1;
        updatedRound = draftStatus.currentRound;
        updatedRoundPick = draftStatus.currentRoundPick - 1;
    } else if (count > teams.length || count === 0) {
        //increase
        updatedTeam = draftStatus.currentTeam + 1;
        updatedRound = draftStatus.currentRound;
        updatedRoundPick = draftStatus.currentRoundPick - 1
    }

    return {
        currentTeam: updatedTeam,
        currentRound: updatedRound,
        currentRoundPick: updatedRoundPick,
        currentPick: updatedPick
    }
}