export interface Player {
    id: number
    adp: number
    name: string
    position: string
    team: string
    points: number
    relativeValue: number
    tier: number
}

export interface Team {
    players: Player[]
}

export interface IDraftStatus {
    currentTeam: any
    currentRound: any
    currentPick: any
}


export interface NflTeam {
    code: string
    fullName: string
    shortName: string
    locationName: string
}

export const NflTeams: NflTeam[] = [
    {
        "code": "ARI",
        "fullName": "Arizona Cardinals",
        "shortName": "Cardinals",
        "locationName": "Arizona"
    },
    {
        "code": "ATL",
        "fullName": "Atlanta Falcons",
        "shortName": "Falcons",
        "locationName": "Atlanta"
    },
    {
        "code": "BAL",
        "fullName": "Baltimore Ravens",
        "shortName": "Ravens",
        "locationName": "Baltimore"
    },
    {
        "code": "BUF",
        "fullName": "Buffalo Bills",
        "shortName": "Bills",
        "locationName": "Buffalo"
    },
    {
        "code": "CAR",
        "fullName": "Carolina Panthers",
        "shortName": "Panthers",
        "locationName": "Carolina"
    },
    {
        "code": "CHI",
        "fullName": "Chicago Bears",
        "shortName": "Bears",
        "locationName": "Chicago"
    },
    {
        "code": "CIN",
        "fullName": "Cincinnati Bengals",
        "shortName": "Bengals",
        "locationName": "Cincinnati"
    },
    {
        "code": "CLE",
        "fullName": "Cleveland Browns",
        "shortName": "Browns",
        "locationName": "Cleveland"
    },
    {
        "code": "DAL",
        "fullName": "Dallas Cowboys",
        "shortName": "Cowboys",
        "locationName": "Dallas"
    },
    {
        "code": "DEN",
        "fullName": "Denver Broncos",
        "shortName": "Broncos",
        "locationName": "Denver"
    },
    {
        "code": "DET",
        "fullName": "Detroit Lions",
        "shortName": "Lions",
        "locationName": "Detroit"
    },
    {
        "code": "GB",
        "fullName": "Green Bay Packers",
        "shortName": "Packers",
        "locationName": "Green Bay"
    },
    {
        "code": "HOU",
        "fullName": "Houston Texans",
        "shortName": "Texans",
        "locationName": "Houston"
    },
    {
        "code": "IND",
        "fullName": "Indianapolis Colts",
        "shortName": "Colts",
        "locationName": "Indianapolis"
    },
    {
        "code": "JAC",
        "fullName": "Jacksonville Jaguars",
        "shortName": "Jaguars",
        "locationName": "Jacksonville"
    },
    {
        "code": "KC",
        "fullName": "Kansas City Chiefs",
        "shortName": "Chiefs",
        "locationName": "Kansas City"
    },
    {
        "code": "MIA",
        "fullName": "Miami Dolphins",
        "shortName": "Dolphins",
        "locationName": "Miami"
    },
    {
        "code": "MIN",
        "fullName": "Minnesota Vikings",
        "shortName": "Vikings",
        "locationName": "Minnesota"
    },
    {
        "code": "NYG",
        "fullName": "N.Y. Giants",
        "shortName": "Giants",
        "locationName": "N.Y."
    },
    {
        "code": "NYJ",
        "fullName": "N.Y. Jets",
        "shortName": "Jets",
        "locationName": "N.Y."
    },
    {
        "code": "NE",
        "fullName": "New England Patriots",
        "shortName": "Patriots",
        "locationName": "New England"
    },
    {
        "code": "NO",
        "fullName": "New Orleans Saints",
        "shortName": "Saints",
        "locationName": "New Orleans"
    },
    {
        "code": "OAK",
        "fullName": "Oakland Raiders",
        "shortName": "Raiders",
        "locationName": "Oakland"
    },
    {
        "code": "PHI",
        "fullName": "Philadelphia Eagles",
        "shortName": "Eagles",
        "locationName": "Philadelphia"
    },
    {
        "code": "PIT",
        "fullName": "Pittsburgh Steelers",
        "shortName": "Steelers",
        "locationName": "Pittsburgh"
    },
    {
        "code": "SD",
        "fullName": "San Diego Chargers",
        "shortName": "Chargers",
        "locationName": "San Diego"
    },
    {
        "code": "SF",
        "fullName": "San Francisco 49ers",
        "shortName": "49ers",
        "locationName": "San Francisco"
    },
    {
        "code": "SEA",
        "fullName": "Seattle Seahawks",
        "shortName": "Seahawks",
        "locationName": "Seattle"
    },
    {
        "code": "STL",
        "fullName": "St. Louis Rams",
        "shortName": "Rams",
        "locationName": "St. Louis"
    },
    {
        "code": "TB",
        "fullName": "Tampa Bay Buccaneers",
        "shortName": "Buccaneers",
        "locationName": "Tampa Bay"
    },
    {
        "code": "TEN",
        "fullName": "Tennessee Titans",
        "shortName": "Titans",
        "locationName": "Tennessee"
    },
    {
        "code": "WAS",
        "fullName": "Washington Redskins",
        "shortName": "Redskins",
        "locationName": "Washington"
    }
];