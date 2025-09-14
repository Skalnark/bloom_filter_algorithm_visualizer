import HtmlBuilder from './src/HtmlBuilder.js';
import Manager from './src/Manager.js';
import { prompt } from './src/Prompt.js';

window.DEBUG = false;

let htmlBuilder;
let manager;

async function awake() {
    //await initializeLocales();
    manager = new Manager();
    htmlBuilder = new HtmlBuilder();
}

window.addEventListener('DOMContentLoaded', async () => {
    await awake();

    manager.bf.initialize(100, 3);
    manager.redrawGraphics();
    htmlBuilder.setInfoLabels();
    
    greetings();
});

function greetings()
{
    prompt.print("# Welcome to the Bloom Filter Algorithm Visualizer");
    prompt.print("You can learn about the Bloom Filter data structure and how it works by following the execution step-by-step");
    prompt.print("Use the Add and Check buttons to see how items are added and checked in the Bloom Filter");
    prompt.print("Set the number of bits and hash functions to see how they affect the performance");
    prompt.print("Enjoy learning about Bloom Filters!");
    prompt.print();
}

window.addEventListener('refreshUI', () => {
    htmlBuilder.setInfoLabels();
    manager.redrawGraphics();
});

let resizeTimeout;

window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        manager.redrawGraphics();
    }, 200);
});