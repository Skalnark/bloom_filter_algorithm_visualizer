
class PromptController {
    constructor() {
        if (PromptController._instance) {
            return PromptController._instance;
        }
        PromptController._instance = this;
        this.lines = [];
        this.lineLimit = 40;
        this.verbose = true;
        this.quietMode = false;
    }

    printVerbose(text, isComand = false) {
        if (!this.verbose) return;
        this.print(text, isComand);
    }

    print(text, isComand = false) {

        if(this.quietMode) return;

        this.textarea.value = '';
        let line = '';
        if (isComand) line += '$ ';
        else line += '> ';
        line += text;
        this.lines.push(line);
        if (this.lines.length > this.lineLimit) {
            this.lines.shift();
        }

        for(let i = 0; i < this.lines.length; i++) {
            this.textarea.value += this.lines[i] + '\n';
        }
        this.textarea.scrollTop = this.textarea.scrollHeight;
    }

    setTextarea(textarea) {
        this.textarea = textarea;

        this.print("cat instructions.txt", true);
        this.print("--------------------------------------------------");
        this.print("Welcome to the Bloom Filter Visualization Tool!");
        this.print("This tool will help you understand how a Bloom Filter works step by step.");
        this.print("Use the input fields above to set the Bloom Filter parameters and add items.");
        this.print("Press the 'Next Step' button to proceed through each step of the hashing process.");
        this.print("Let's get started!");
        this.print("--------------------------------------------------");
    }
}

const prompt = new PromptController();
export default PromptController;
export { PromptController, prompt };

