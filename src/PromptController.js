class PromptController {
    constructor() {}

    setTextarea(textarea) {
        this.textarea = textarea;
    }

    updatePrompt(newPrompt) {
        if (this.textarea) {
            this.textarea.value = newPrompt;
        } else {
            console.warn('Textarea not set in PromptController');
        }
    }
}
