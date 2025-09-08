import { Util } from "./Util";

class PromptController {
    constructor() {
        if (PromptController._instance) {
            return PromptController._instance;
        }
        PromptController._instance = this;
        this.lines = [];
        this.lineLimit = 30;
        this.verbose = true;
        this.quietMode = false;
        this.spans = [];
        this.promptSimulatorDiv = document.getElementById('prompt-simulator');
    }

    printVerbose(text, isComand = false) {
        if (!this.verbose) return;
        this.print(text, isComand);
    }

    newLine() {
        this.addSpanToPromptSimulator('', '');
    }

    print(text, isComand = false) {

        if (this.quietMode) return;

        const prefix = isComand ? "$ " : "> ";

        this.addSpanToPromptSimulator(text, prefix);
    }

    setTextarea() {
        this.print("cat README.md", true);
        this.print("# Welcome to the Bloom Filter Visualization Tool!");
        this.print("You can earn Bloom Filters step by step");
        this.print("Resize and add dummy items to the filter if you want");
        this.print("Use the 'Add' and 'Check' to learn how it works");
        this.print("Disable step by step execution if you want");
        this.print("Let's get started!");
        this.newLine();
    }

    addSpanToPromptSimulator(text, prefix = ">") {
        if (!this.promptSimulatorDiv) return;

        if(text.length > 80) console.warn("Long text in prompt:", text);
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

    clearPrompt() {
        if (!this.promptSimulatorDiv) return;
        this.promptSimulatorDiv.innerHTML = '';
        this.spans = [];
    }

}

const prompt = new PromptController();
export default PromptController;
export { PromptController, prompt };

