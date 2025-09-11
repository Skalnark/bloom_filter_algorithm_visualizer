// Reads the files in the journeys directory and builds Journey objects

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
        while (lines.length > 0) {
            l++;

            if (lines.length < 5) break;

            // Extract the first word of the line until the first space
            let firstWord = lines.split(' ')[0].replace(/\n/g, '').trim();
            let delimiter = ';';
            if (firstWord === 'check') delimiter = '{';

            let line = lines.substring(0, lines.indexOf(delimiter) + 1).trim();
            lines = lines.substring(line.length, lines.length).trim();
            line = line.replace(/[\n;]/g, ' ').trim();

            if (line.startsWith('#') || line.trim().length === 0) {
                continue; // Skip comments and empty lines
            }

            let result = this.parseLine(line, lines, l);
            if (!result) {
                console.warn(`Could not parse line: ${line} at line ${l}`);
                continue;
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
                console.error(`Failed to parse line: ${line} at line ${l}`);
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
        let parts = line.split(' ');
        let command = parts[0].toLowerCase();
        let args = parts.slice(1);

        switch (command) {
            case 'print':
                return this.parsePrint(args, lines, l);
            case 'execute':
                return this.parseExecute(args, lines, l);
            case 'check':
                return this.parseCheck(args, lines, l);
            case 'define':
                return this.parseDefine(args, lines, l);
            default:
                console.warn(`Unknown command: ${command} at line ${l}`);
                return null;
        }
    }

    parseDefine(args, lines, l) {
        if (!args || args.length == 0)
            throw new Error("define command requires a variable assignment as argument at line " + l);

        let assignment = args.join(' ').trim();
        let parts = assignment.split('=');
        if (parts.length != 2)
            throw new Error("define command requires a single '=' in the assignment at line " + l);

        let varName = parts[0].trim();
        let valuePart = parts[1].trim();
        if (valuePart[0] === '[') {
            let arr = valuePart.slice(1, -1).split(',').map(s => s.trim());
            valuePart = arr;
        }

        let context = { 'varName': varName, 'varValue': valuePart };

        let step = null;
        try {
            step = Step.createDefineAction();
        } catch (err) {
            throw new Error(`Failed to create define action at line ${l}: ${err.message}`);
        }
        step.name = `define_${varName} - ${l}`;
        step.context = context;
        return step;
    }

    parsePrint(args, lines, l) {
        if (!args || args.length == 0)
            throw new Error("print command requires a message as argument at line " + l);

        let context = {};
        //removes the semicolon at the end if present
        if (args[args.length - 1] === ';')
            args = args.slice(0, args.length - 1);

        args = args.join(' ').trim();

        try {
            let p = args;
            p = p.substring(p.indexOf('(') + 1, p.lastIndexOf(')')).trim();
            context = this.parseParams(p);
        } catch (err) {
            console.warn(`Failed to parse print parameters at line ${l}: ${err.message}`);
        }

        // what's between " and "
        let messageVar = args.substring(args.indexOf('"'), args.lastIndexOf('"') + 1);
        messageVar = messageVar.substring(1, messageVar.length - 1);
        let step = null;
        try {
            step = Step.createMessageAction(messageVar, context);
        } catch (err) {
            throw new Error(`Failed to create print action at line ${l}: ${err.message}`);
        }
        step.name = `print_message - ${l}`;
        return step;
    }

    parseExecute(args, lines, l) {
        if (!args || args.length == 0)
            throw new Error("execute command requires a function name as argument at line " + l);

        let functionName = args[0];
        let context = this.parseParams(args.slice(1).join(' '));

        let step = null;
        step = Step.createExecutionAction(functionName, context);
        step.name = `execute_${functionName} - ${l}`;
        return step;
    }

    parseCheck(line, lines, l) {
        if (!line || line.length == 0)
            throw new Error("check command requires a function name as argument at line " + l);

        line = line.slice(0, line.length - 1); // remove the trailing '{'


        let main = this.parseConditional(line, l);
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

    parseConditional(line, l) {
        if (!line || line.length == 0) {
            console.error("Empty line in parseConditional at line " + l);
            return;
        }
        let functionName = line[0];
        let context = this.parseParams(line.slice(1).join(' '));
        let expectedResult = line[2];

        if (expectedResult !== 'true' && expectedResult !== 'false')
            throw new Error("check command requires expectedResult (true or false) at line " + l);

        expectedResult = expectedResult === 'true' ? true : false;

        context['expectedResult'] = expectedResult;

        let step = null;
        try {
            step = Step.createExecutionAction(functionName, context);
        } catch (err) {
            throw new Error(`Failed to create check action at line ${l}: ${err.message}`);
        }
        step.name = `check_${functionName}`;

        return step;
    }

    parseParams(args) {
        if (args.length == 0) return {};
        let context = {};
        args = args.split(',').map(s => s.trim());

        for (let param of args) {
            if (param.length > 0)
                context[param] = null;
        }

        return context;
    }

    extractBlock(lines) {

        let depth = 0;
        let block = '';
        let i = 0;
        let openingIndex = lines.indexOf('{');
        let closingIndex = -1;
        for (i = 0; i < lines.length; i++) {
            let char = lines[i];
            if (char === '{') depth++;
            else if (char === '}') {
                closingIndex = i;
                depth--;
                if (depth === 0) {
                    block += char;
                    break;
                }
            }
            block += char;
        }
        if (depth !== 0) throw new Error("Unmatched { in block");

        return { block: block.substring(openingIndex + 1, closingIndex).trim(), remaining: lines.substring(i + 1).trim() };
    }
}

export default Parser;