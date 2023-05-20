class State {
  tokens: number[];
  name: string;
  destinations: string[];
  constructor(stateLine: string) {
    const plitpoint = stateLine.indexOf("(");
    const name = stateLine.substring(0, plitpoint);
    const body = stateLine.substring(plitpoint);

    const tokens = body.slice(1, -1).split(",");

    this.tokens = tokens.map((str) => {
      const parsed = parseInt(str.trim(), 10);
      return parsed;
    });

    this.name = name;
    this.destinations = [];
  }
}

export default State;
