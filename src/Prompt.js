import { Util } from "./Util";

class Prompt {
    constructor() {
        if (Prompt._instance) {
            return Prompt._instance;
        }
        Prompt._instance = this;
        this.lines = [];
        this.lineLimit = 30;
        this.quietMode = false;
        this.spans = [];
        this.promptSimulatorDiv = document.getElementById('prompt-simulator');
        this.initListeners();
    }

    newLine() {
        let span = document.createElement('span');
        span.innerHTML = '<br>';
        this.spans.push(span);
        this.promptSimulatorDiv.appendChild(span);
        this.promptSimulatorDiv.scrollTop = this.promptSimulatorDiv.scrollHeight;
    }

    async print(text = '', delay = 0) {
        if (this.quietMode) return;
        if(text === '') return this.newLine();

        this.addSpanToPromptSimulator(text, '> ');
        await Util.delay(delay);
    }

    addSpanToPromptSimulator(text, prefix = ">") {
        if (!this.promptSimulatorDiv) return;

        let span = this.createSpan(text, prefix);
        this.promptSimulatorDiv.appendChild(span);
        if (this.spans.length >= this.lineLimit) {
            const firstSpan = this.spans.shift();
            if (firstSpan && firstSpan.parentNode) {
                firstSpan.parentNode.removeChild(firstSpan);
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
        span.prepend(prefixSpan);
        this.spans.push(prefixSpan);
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
            const placeholder =  `%${ctxKey}%`;
            message = message.replace(new RegExp(placeholder, 'g'), context[ctxKey]);
        }

        this.print(message);
    }

    initListeners() {
        window.addEventListener('journey-started', () => {
            this.clear();
        });
    }
}

const prompt = new Prompt();
export default Prompt;
export { Prompt, prompt };

