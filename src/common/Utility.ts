class Utility {
    static standardizeName(name: string): string {
        let standardized: string = name;
        standardized = standardized.toLowerCase();
        standardized = this.filterTitles(standardized);
        standardized = this.filterAbbreviations(standardized);
        return standardized;
    }

    static filterTitles(name: string): string {
        let standardized: string = name;
        //check for titles
        if (standardized.split(' ').length > 2)
            // filter out additional information.
            standardized = standardized.substring(0, standardized.lastIndexOf(" "));
        return standardized;
    }

    static filterAbbreviations(name: string): string {
        let standardized: string = name;
        standardized = standardized.replace("/[^a-zA-Z ]/g", "");
        standardized = standardized.replaceAll(".", "");
        standardized = standardized.replaceAll("/", "");
        return standardized;
    }

}


export default Utility