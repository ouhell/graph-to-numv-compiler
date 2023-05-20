import fs from "fs";
import path from "path";
import State from "./module/State";
const file = fs.readFileSync(path.join(__dirname, "data", "test.os"));
const code = file.toString();
const stateNameRegex = /^s\d+/;
const stateDeclarationregex = /^s\d+\(((\d+,)*\d+)\)$/;
const nusmv = generateNusmv(code);

// console.log(nusmv);

fs.writeFileSync(path.join("out", "output.smv"), nusmv);

export function generateNusmv(code: string) {
  const states = parseCode(code).sort((a, b) => a.name.localeCompare(b.name));

  let generatedCode = "MODULE main\n";
  generatedCode += "\n";
  generatedCode += declareVariables(states);
  generatedCode += "\n";
  generatedCode += assigne(states);
  return generatedCode;
}

export function parseCode(code: string) {
  const states: State[] = [];
  const lines = code.split(";");

  lines.forEach((line) => {
    const stateStrings = line
      .split("->")
      .map((str) => str.trim())
      .filter((str) => str);
    let prevState: State | null = null;
    stateStrings.forEach((stateStr) => {
      let newState: State;

      if (stateDeclarationregex.test(stateStr)) {
        newState = new State(stateStr);
        const oldState = states.find((state) => state.name === newState.name);

        if (oldState)
          throw new Error("cant declare a state twice : " + oldState.name);

        states.push(newState);
      } else if (stateNameRegex.test(stateStr)) {
        const oldState = states.find((state) => state.name === stateStr);

        if (!oldState)
          throw new Error("reference to an unexisting state : " + stateStr);

        newState = oldState;
      } else {
        throw new Error("invalid input :" + stateStr);
      }

      if (prevState) {
        if (!prevState.destinations.includes(newState.name))
          prevState.destinations.push(newState.name);
      }

      prevState = newState;
    });
  });

  checkStates(states);

  return states;
}

function declareVariables(states: State[]) {
  let generatedCode = "VAR\n";
  let stateDeclarations = states.map((state) => state.name).join(", ");
  generatedCode += `s : {${stateDeclarations}};\n`;
  const [mins, maxs] = getMinMaxTokenValues(states);
  states[0].tokens.forEach((token, i) => {
    generatedCode += `p${i} : ${mins[i]}..${maxs[i]};\n`;
  });

  return generatedCode;
}

function assigne(states: State[]) {
  let generatedCode = `ASSIGN\n`;
  generatedCode += `init(s) := ${states[0].name};\n`;
  generatedCode += `next(s) := case\n`;

  states.forEach((state, i) => {
    if (state.destinations.length === 0) return;

    const destinations = state.destinations.join(", ");

    let relocation =
      state.destinations.length > 1 ? `{${destinations}}` : destinations;
    generatedCode += ` s = ${state.name} : ${relocation};\n`;
  });

  generatedCode += " esac;\n";

  states[0].tokens.forEach((token, i) => {
    generatedCode += `p${i} := case\n`;
    states.forEach((state) => {
      generatedCode += ` s = ${state.name} : ${state.tokens[i]};\n`;
    });
    generatedCode += " TRUE : 0;\n";
    generatedCode += " esac;\n";
  });
  return generatedCode;
}

function checkStates(states: State[]) {
  console.log(states);
  let tokenCount = -1;
  if (states.length === 0) throw new Error("no states");
  states.forEach((state) => {
    if (state.tokens.length !== tokenCount && tokenCount !== -1)
      throw new Error("states cant have diffrent number of tokens");

    if (state.tokens.length === 0)
      throw new Error("a state cant have no tokens");

    tokenCount = state.tokens.length;
  });
}

function getMinMaxTokenValues(states: State[]): [number[], number[]] {
  const tokens = states.map((state) => state.tokens);

  const maxs = tokens.reduce((prev, current, i) => {
    if (!prev.length) return current;
    const next = [...prev];
    for (let index = 0; index < next.length; index++) {
      const element = next[index];

      if (element < current[index]) next[index] = current[index];
    }
    return next;
  }, []);

  const mins = maxs.map((max) => 0);
  //   const mins = tokens.reduce((prev, current, i) => {
  //     if (!prev.length) return current;
  //     const next = [...prev];
  //     for (let index = 0; index > next.length; index++) {
  //       const element = next[index];

  //       if (element < current[index]) next[index] = current[index];
  //     }
  //     return next;
  //   }, []);

  return [mins, maxs];
}
