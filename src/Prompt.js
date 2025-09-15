import { Util } from "./Util";

class Prompt {
    constructor() {
        if (Prompt._instance) {
            return Prompt._instance;
        }
        Prompt._instance = this;
        this.lineLimit = 5;
        this.quietMode = false;
        this.spans = [];
        this.promptSimulatorDiv = document.getElementById('prompt-simulator');
        this.pseudoCodeSimulatorDiv = document.getElementById('pseudo-code-simulator');
        this.pseudoCode = [];
        this.initListeners();
        this.lineCounter = 0;
    }

    newLine() {
        let span = document.createElement('span');
        span.innerHTML = '<br>';
        span.id = `prompt-line-${this.lineCounter++}`;
        this.spans.push(span);
        this.promptSimulatorDiv.appendChild(span);
        this.promptSimulatorDiv.scrollTop = this.promptSimulatorDiv.scrollHeight;
    }

    async print(text = '', delay = 0) {
        if (this.quietMode) return;
        if (text === '') return this.newLine();

        this.addSpanToPromptSimulator(text, '> ');
        await Util.delay(delay);
    }

    addSpanToPromptSimulator(text, prefix = ">") {
        if (!this.promptSimulatorDiv) return;

        let span = this.createSpan(text, prefix);
        this.promptSimulatorDiv.appendChild(span);
        while (this.spans.length > this.lineLimit) {
            const line = this.spans.shift();
            if (line && line.parentNode) {
                Util.deleteElementById(line.id);
            }
        }
        this.promptSimulatorDiv.scrollTop = this.promptSimulatorDiv.scrollHeight;
    }

    createSpan(text, prefix = '') {
        const prefixSpan = document.createElement('span');
        prefixSpan.textContent = prefix;
        prefixSpan.className = 'prompt-line-prefix';

        const span = document.createElement('span');
        span.textContent = text;
        span.className = 'prompt-line';
        span.id = `prompt-line-${this.lineCounter++}`;
        span.prepend(prefixSpan);
        this.spans.push(span);
        return span;
    }

    clear() {
        this.lines = [];
        this.spans = [];
        if (this.promptSimulatorDiv) {
            this.promptSimulatorDiv.innerHTML = '';
        }
    }

    printJourneyMessage(message, context = {}) {
        for (const ctxKey in context) {
            const placeholder = `%${ctxKey}%`;
            message = message.replace(new RegExp(placeholder, 'g'), context[ctxKey]);
        }

        this.print(message);
    }

    initListeners() {
        window.addEventListener('journey-started', () => {
            this.clear();
        });
    }

    initPseudoCode(pseudoCode) {
        this.currentPseudoCodeLine = 0;
        let textLines = pseudoCode.split('\n');
        let lines = [];

        for (let l of textLines) {
            let line = document.createElement('code');
            if (l.trim().length === 0) continue;
            line.className = 'prompt-line';
            line.textContent = l;
            lines.push(line);
            this.pseudoCodeSimulatorDiv.appendChild(line);
        }

        this.pseudoCode = lines;
        this.simulatePseudoCode();
    }

    async nextLine(line) {
        if(line === undefined) throw new Error("Line number is required");
        this.currentPseudoCodeLine = line - 1;

        this.simulatePseudoCode();
        await Util.delay(1000);
    }

    async simulatePseudoCode() {
        if (this.pseudoCode.length === 0) return;

        this.pseudoCodeSimulatorDiv.innerHTML = '';

        for (let line of this.pseudoCode) {
            this.pseudoCodeSimulatorDiv.appendChild(line);
        }

        for (let i = 0; i < this.pseudoCode.length; i++) {
            if (i === this.currentPseudoCodeLine) {
                this.pseudoCode[i].style.backgroundColor = '#333';
                // scrolls to the line
                this.pseudoCodeSimulatorDiv.scrollTop = this.pseudoCode[i].offsetTop - this.pseudoCodeSimulatorDiv.offsetTop;
            } else {
                this.pseudoCode[i].style.backgroundColor = 'transparent';
            }
        }
    }
}

const prompt = new Prompt();
export default Prompt;
export { Prompt, prompt };

