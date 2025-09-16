import Step from "./Step.js";
import i18next from "i18next";
import { add_item_code, greetings_code, check_item_code } from "./journeys/journey_code.js";

class Parser {

    constructor() {
        this.messages = i18next.t(`messages`, { returnObjects: true });
    }

    async parseJourney(name) {

        let code = null;

        switch (name) {
            case 'add_item':
                code = add_item_code;
                break;
            case 'greetings':
                code = greetings_code;
                break;
            case 'check_item':
                code = check_item_code;
                break;
            default:
                throw new Error(`Unknown journey: ${name}`);
        }

        if (!code) throw new Error(`Failed to load journey: ${name}`);

        code = code.default || code;

        return this.parseLines(code);
    }

    parseLines(lines, l = 0) {
        let steps = [];
        let tries = 0;
        let pastLine = '';
        while (lines.length > 0) {
            l++;

            let index = lines.indexOf('\n');
            if (index === -1) index = lines.length;

            let line = lines.substring(0, index).trim();

            lines = lines.substring(index).trim();

            if (line.startsWith('#') || line.length === 0) {
                continue;
            }

            let result = this.parseLine(line, lines, l);
            if (!result) {
                throw new Error(`Failed to parse line: ${line} at line ${l}`);
            }

            let step = null;
            if (result instanceof Step)
                step = result;
            else {
                step = result.step;
                lines = result.remainingLines;
                l = result.currentLine;
            }

            if (step) {

                step.line = line;
                steps.push(step);
            } else {
                throw new Error(`Failed to create step from line: ${line} at line ${l}`);
            }
            tries++;
            if (tries > 500) {
                console.error("Too many tries to parse lines, possible infinite loop.");
                break;
            }
        }
        return steps;
    }

    parseLine(line, lines, l) {
        let parts = line.replace(/[\n]/g, '').split(' ');
        let command = parts[0].toLowerCase();
        let args = parts.slice(1);

        switch (command) {
            case 'print':
                return this.parsePrint(args, lines, l);
            case 'execute':
                return this.parseExecute(args, lines, l);
            case 'branch':
                return this.parseBranch(args, lines, l);
            case 'define':
                return this.parseDefine(args, lines, l);
            default:
                throw new Error(`Unknown command: ${command} at line ${l}`);
        }
    }

    parseDefine(args, lines, l) {
        if (!args || args.length == 0)
            throw new Error("define command requires a variable assignment as argument at line " + l);

        let assignment = args.join(' ').trim().replace(/[;]/g, '');
        let parts = assignment.split('=');
        if (parts.length != 2)
            throw new Error("define command requires a single '=' in the assignment at line " + l);

        let varName = parts[0].trim();
        let valuePart = parts[1].trim();
        if (valuePart[0] === '[') {
            let arr = valuePart.slice(1, -1).split(',').map(s => s.trim());
            valuePart = arr;
        }

        let context = { 'destiny': varName, 'origin': valuePart };

        let step = null;
        try {
            step = Step.createDefineAction();
        } catch (err) {
            throw new Error(`Failed to create define action at line ${l}: ${err.message}`);
        }
        step.name = 'define';
        step.context = context;
        return step;
    }

    parsePrint(args, lines, l) {
        if (!args || args.length == 0)
            throw new Error("print command requires a message as argument at line " + l);

        args = args.join(' ').trim().replace(/[;"]/g, '');

        let messageVar = args.trim().substring(0, args.length);
        let step = null;
        try {
            step = Step.createMessageAction(messageVar);
        } catch (err) {
            throw new Error(`Failed to create print action at line ${l}: ${err.message}`);
        }
        step.name = 'print';
        return step;
    }

    parseExecute(line, l) {
        if (!line || line.length == 0) {
            throw new Error("execute command requires a function name as argument at line " + l);
            return;
        }

        let functionName = line[0].replace(/[;]/g, '').trim();
        let context = {};
        let output = this.parseOutput(line[1]);
        if (output !== null) context['output'] = output;

        let expectedResult = line.length > 2 ? line[2] : null;

        expectedResult === 'true' ? expectedResult = true : null;
        expectedResult === 'false' ? expectedResult = false : null;

        if (expectedResult !== null) context['expectedResult'] = expectedResult;


        let step = null;
        step = Step.createExecutionAction(functionName, context);
        step.name = 'execute';
        return step;
    }

    parseBranch(line, lines, l) {
        if (!line || line.length == 0)
            throw new Error("check command requires a function name as argument at line " + l);

        line = line.slice(0, line.length - 1);


        let main = this.parseExecute(line, lines, l);
        if (!main) return null;
        l++;

        let block = this.extractBlock(lines);
        let subRoutine = block.block;
        lines = block.remaining;

        let nextSteps = this.parseLines(subRoutine, l);

        l += nextSteps.length;

        main.possibleNextSteps = nextSteps;
        main.name = `subroutine-${l}`;
        return { step: main, remainingLines: lines, currentLine: l };
    }

    parseOutput(args) {
        if (!args || args.length == 0) return null;
        return args.substring(args.indexOf('(') + 1, args.indexOf(')')).trim();
    }

    extractBlock(lines) {

        let depth = 1;
        let block = '';
        let i = 0;
        let closingIndex = -1;
        for (i = 0; i < lines.length; i++) {
            let char = lines[i];
            if (char === '{') depth++;
            else if (char === '}') {
                closingIndex = i - 1;
                depth--;
                if (depth === 0) {
                    break;
                }
            }
            block += char;
        }
        if (depth !== 0) throw new Error(`unmatched braces in block starting with: ${block.substring(0, 20)}...`);
        let remaining = lines.substring(closingIndex + 2).trim();
        block = block.substring(0, closingIndex).trim();

        return { block, remaining };
    }
}

export default Parser;