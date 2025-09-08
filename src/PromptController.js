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

    print(text, isComand = false) {

        if (this.quietMode) return;

        const prefix = isComand ? "$ " : "> ";

        this.addSpanToPromptSimulator(text, prefix);
    }

    setTextarea(textarea) {
        this.textarea = textarea;

        this.print("cat instructions.txt", true);
        this.print("-------------------------");
        this.print("Welcome to the Bloom Filter Visualization Tool!");
        this.print("This tool will help you understand how a Bloom Filter works step by step.");
        this.print("Use the input fields above to set the Bloom Filter parameters and add dummy data.");
        this.print("Then, use the 'Add Item' and 'Check Item' buttons to interact with the Bloom Filter.");
        this.print("Disable step by step execution if you want to speed things up.");
        this.print("Let's get started!");
        this.print("-------------------------");
    }

    addSpanToPromptSimulator(text, prefix = ">") {
        if (!this.promptSimulatorDiv) return;

        const width = document.getElementById('prompt-holder').clientWidth;
        const fontSize = width <= 900 ? 16 : 20;
        const characterSize = Util.getTextWidth('A', `${fontSize}px Fira Mono`);
        const maxCharsPerLine = Math.floor(width / characterSize);

        let lines = [];
        if (text.length > maxCharsPerLine) {
            while(text.length > maxCharsPerLine) {
                let sliceIndex = text.lastIndexOf(' ', maxCharsPerLine);
                if (sliceIndex === -1) sliceIndex = maxCharsPerLine;
                lines.push(text.slice(0, sliceIndex));
                text = text.slice(sliceIndex).trim();
            }
            if (text.length > 0) {
                lines.push(text);
            }
        }
        else {
            lines = [text];
        }

        let first = true;
        for (let line of lines) {
            let span = this.createSpan(line, first ? prefix : '  ');
            this.promptSimulatorDiv.appendChild(span);
            first = false;
        }

        if (this.spans.length >= this.lineLimit) {
            const firstSpan = this.spans.shift();
            if (firstSpan && firstSpan.parentNode) {
                firstSpan.parentNode.removeChild(firstSpan);
            }
        }

        this.promptSimulatorDiv.scrollTop = this.promptSimulatorDiv.scrollHeight;
    }


    createSpan(text, prefix = '  ') {
        console.log(`prefix: "${prefix}"`);
        const prefixSpan = document.createElement('span');
        prefixSpan.textContent = prefix;
        prefixSpan.className = 'prompt-line-prefix';

        const span = document.createElement('span');
        span.textContent = text;
        span.className = 'prompt-line';
        span.prepend(prefixSpan);
        this.spans.push(prefixSpan);
        console.log(span);
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

