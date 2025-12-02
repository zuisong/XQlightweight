import { Actor, BaseAlign, Color, Font, Label, Text, TextAlign, vec, Vector } from "excalibur";

export interface ButtonStyle {
    backgroundColor: Color;
    textColor: Color;
    hoverColor: Color;
}

export class Button extends Actor {
    private label: Label;
    private callback: () => void;
    private _text: string;
    private style: ButtonStyle;

    constructor(pos: Vector, text: string, callback: () => void, style: ButtonStyle, width = 200, height = 30) {
        super({
            pos: pos,
            width: width,
            height: height,
            color: style.backgroundColor,
            anchor: Vector.Zero,
            z: 100
        });
        this._text = text;
        this.callback = callback;
        this.style = style;

        this.label = new Label({
            text: text,
            pos: vec(width / 2, height / 2),
            font: new Font({
                size: 16,
                color: style.textColor,
                textAlign: TextAlign.Center,
                baseAlign: BaseAlign.Middle
            })
        });
        this.addChild(this.label);

        this.on('pointerup', () => {
            this.callback();
        });
        
        this.on('pointerenter', () => {
            this.color = style.hoverColor;
        });

        this.on('pointerleave', () => {
            this.color = style.backgroundColor;
        });
    }

    setText(text: string) {
        this._text = text;
        this.label.text = text;
    }
}

export class Checkbox extends Actor {
    private checked: boolean;
    private callback: (checked: boolean) => void;
    private checkIndicator: Actor;

    constructor(pos: Vector, labelText: string, checked: boolean, callback: (checked: boolean) => void, style: ButtonStyle, width = 200, height = 30) {
        super({
            pos: pos,
            width: width,
            height: height,
            anchor: Vector.Zero,
            z: 100
        });
        this.checked = checked;
        this.callback = callback;

        // Box
        const box = new Actor({
            pos: vec(0, 5),
            width: 20,
            height: 20,
            color: style.backgroundColor, // Use UI background or button bg? Button bg is usually 'surface'
            anchor: Vector.Zero
        });
        this.addChild(box);

        // Checkmark
        this.checkIndicator = new Actor({
            pos: vec(4, 9),
            width: 12,
            height: 12,
            color: Color.fromHex('#3B82F6'), // Always blue-ish?
            anchor: Vector.Zero
        });
        this.checkIndicator.graphics.visible = checked;
        this.addChild(this.checkIndicator);

        // Label
        const label = new Label({
            text: labelText,
            pos: vec(30, 15),
            font: new Font({
                size: 16,
                color: style.textColor,
                baseAlign: BaseAlign.Middle
            })
        });
        this.addChild(label);

        this.on('pointerup', () => {
            this.toggle();
        });
    }

    toggle() {
        this.checked = !this.checked;
        this.checkIndicator.graphics.visible = this.checked;
        this.callback(this.checked);
    }
}

export class TextButton extends Actor {
    private callback: () => void;
    private label: Label;
    private style: ButtonStyle;
    private selectedColor: Color;

    constructor(pos: Vector, text: string, callback: () => void, style: ButtonStyle, selectedColor: Color, width = 200, height = 20) {
        super({
            pos: pos,
            width: width,
            height: height,
            anchor: Vector.Zero,
            z: 100
        });
        this.callback = callback;
        this.style = style;
        this.selectedColor = selectedColor;

        this.label = new Label({
            text: text,
            pos: vec(0, 10),
            font: new Font({
                size: 14,
                color: style.textColor,
                baseAlign:BaseAlign.Middle
            })
        });
        this.addChild(this.label);

        this.on('pointerup', () => {
            this.callback();
        });
        
        this.on('pointerenter', () => {
            this.label.font.color = selectedColor; // Hover effect
        });

        this.on('pointerleave', () => {
            // We need to know if we are selected to restore color properly
            // Simpler: just restore to text color, and let update logic handle re-selection color
            this.label.font.color = style.textColor;
        });
    }
    
    setText(text: string) {
        this.label.text = text;
    }
    
    setSelected(selected: boolean) {
        if (selected) {
            this.label.font.bold = true;
             this.label.font.color = this.selectedColor;
        } else {
            this.label.font.bold = false;
            this.label.font.color = this.style.textColor;
        }
    }
}