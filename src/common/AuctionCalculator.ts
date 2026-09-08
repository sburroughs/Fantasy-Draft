import {AuctionSettings, Player, PositionBudgets, Team} from "./Player";

export function inflationRate(availablePlayers: Player[], teams: Team[]): number {
    const remainingBudget = teams.reduce((sum, t) => sum + t.budget, 0);
    const remainingValue = availablePlayers.reduce((sum, p) => sum + p.auctionValue, 0);
    if (remainingValue <= 0) {
        return 1;
    }
    return remainingBudget / remainingValue;
}

export function maxRosterBid(team: Team, rosterSize: number): number {
    const reserved = rosterSize - team.players.length - 1;
    const max = team.budget - Math.max(reserved, 0);
    return Math.max(max, 1);
}

function positionBudgetKey(position: string): keyof PositionBudgets {
    const key = position.toLowerCase();
    if (key === "qb" || key === "rb" || key === "wr" || key === "te" || key === "k" || key === "def") {
        return key;
    }
    return "def";
}

export function positionSpend(team: Team, position: string): number {
    return team.players
        .filter(p => p.position === position)
        .reduce((sum, p) => sum + p.purchasePrice, 0);
}

export function positionBudgetRemaining(team: Team, position: string, settings: AuctionSettings): number {
    const budgeted = settings.positionBudgets[positionBudgetKey(position)];
    return Math.max(budgeted - positionSpend(team, position), 0);
}

export function suggestedBid(player: Player, team: Team, availablePlayers: Player[], teams: Team[], settings: AuctionSettings, rosterSize: number): number {
    const marketValue = Math.round(player.auctionValue * inflationRate(availablePlayers, teams));
    const budgetMax = maxRosterBid(team, rosterSize);
    const positionMax = positionBudgetRemaining(team, player.position, settings);
    return Math.max(Math.min(marketValue, budgetMax, positionMax), 1);
}
