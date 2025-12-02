import { Loader, Vector } from 'excalibur';
import { loader as resourceLoader } from './resources';

export class CustomLoader extends Loader {
    constructor() {
        super([...resourceLoader.resources]); // Pass the resources from our existing loader
        this.suppressPlayButton = true; // Suppress the "Start Game" button
        this.logoPosition = new Vector(-100, -100); // No logo
        // You can optionally customize the progress bar or other UI here
        // For a completely blank loading screen, you might want to hide the progress bar too:
    }
}