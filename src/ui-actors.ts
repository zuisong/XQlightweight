import { Actor, BaseAlign, Color, Font, Label, Rectangle, ScreenElement, TextAlign, Vector, vec } from "excalibur";

export interface ButtonStyle {
    backgroundColor: Color;
    textColor: Color;
    hoverColor: Color;
}

export const DEFAULT_STYLE: ButtonStyle = {
    backgroundColor: Color.White,
    textColor: Color.Black,
    hoverColor: Color.fromHex('#e5e7eb')
};

export class Button extends Actor {
    private label: Label;
    private callback: () => void;
    private _text: string;
    private style: ButtonStyle;
    private bg: Actor;

    constructor(pos: Vector, text: string, callback: () => void, style: ButtonStyle = DEFAULT_STYLE, width = 200, height = 30) {
        super({
            pos: pos,
            width: width,
            height: height,
            anchor: Vector.Zero,
            z: 100
        });
        this._text = text;
        this.callback = callback;
        this.style = style;

        // Background Rect
        this.bg = new Actor({
            pos: Vector.Zero,
            width: width,
            height: height,
            color: style.backgroundColor,
            anchor: Vector.Zero
        });
        this.addChild(this.bg);

        this.label = new Label({
            text: text,
            pos: vec(width / 2, height / 2),
            font: new Font({
                size: 16,
                color: style.textColor,
                textAlign: TextAlign.Center ,
                baseAlign: BaseAlign.Middle,
            }),
            z: 1
        });
        this.bg.addChild(this.label);

        this.on('pointerup', (evt) => {
            // Prevent bubbling to board
            evt.cancel(); 
            this.callback();
        });
        
        this.on('pointerenter', () => {
            this.bg.color = style.hoverColor;
        });

        this.on('pointerleave', () => {
            this.bg.color = style.backgroundColor;
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
    private bg: Actor;

    constructor(pos: Vector, labelText: string, checked: boolean, callback: (checked: boolean) => void, style: ButtonStyle = DEFAULT_STYLE, width = 200, height = 30) {
        super({
            pos: pos,
            width: width,
            height: height,
            anchor: Vector.Zero,
            z: 100
        });
        this.checked = checked;
        this.callback = callback;

        this.bg = new Actor({
            pos: Vector.Zero,
            width: width,
            height: height,
            color: Color.Transparent, // Transparent bg for checkbox container usually
            anchor: Vector.Zero
        });
        this.addChild(this.bg);

        // Box
        const box = new Actor({
            pos: vec(0, height/2 - 10),
            width: 20,
            height: 20,
            color: style.backgroundColor, 
            anchor: Vector.Zero
        });
        this.bg.addChild(box);

        // Checkmark
        this.checkIndicator = new Actor({
            pos: vec(4, height/2 - 6),
            width: 12,
            height: 12,
            color: Color.fromHex('#3B82F6'),
            anchor: Vector.Zero
        });
        this.checkIndicator.graphics.visible = checked;
        this.bg.addChild(this.checkIndicator);

        // Label
        const label = new Label({
            text: labelText,
            pos: vec(30, height/2),
            font: new Font({
                size: 16,
                color: style.textColor,
                baseAlign: BaseAlign.Middle,
            })
        });
        this.bg.addChild(label);

        this.on('pointerup', (evt) => {
            evt.cancel();
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

    constructor(pos: Vector, text: string, callback: () => void, style: ButtonStyle = DEFAULT_STYLE, selectedColor: Color = Color.Blue, width = 200, height = 20) {
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
            pos: vec(0, height/2),
            font: new Font({
                size: 14,
                color: style.textColor,
                baseAlign: BaseAlign.Middle,
            })
        });
        this.addChild(this.label);

        this.on('pointerup', (evt) => {
            evt.cancel();
            this.callback();
        });
        
        this.on('pointerenter', () => {
            this.label.font.color = selectedColor;
        });

        this.on('pointerleave', () => {
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

export class Modal extends ScreenElement {
    public contentArea: Actor;
    private overlay: Actor;

    constructor(width: number, height: number, backgroundColor: Color = Color.White) {
        super({
            z: 1000 // Top most
        });

        // Full screen overlay
        this.overlay = new Actor({
            pos: Vector.Zero,
            width: 10000, // Huge
            height: 10000,
            color: Color.Black,
            anchor: Vector.Zero
        });
        this.overlay.graphics.opacity = 0.5;
        this.addChild(this.overlay);
        
        // Close on overlay click
        this.overlay.on('pointerup', (evt) => {
            evt.cancel(); // Stop propagation
            this.hide();
        });

        // Centered Content Area
        // Note: ScreenElement position is fixed relative to screen
        this.contentArea = new Actor({
            // We will center this in update or init
            width: width,
            height: height,
            color: backgroundColor,
            anchor: vec(0.5, 0.5)
        });
        this.addChild(this.contentArea);
        
        // Prevent clicks on content passing through
        this.contentArea.on('pointerup', (e) => e.cancel());
        
        this.graphics.visible = false;
    }

    onInitialize(engine: any) {
        // Update overlay size to cover screen
        const screenW = engine.screen.resolution.width;
        const screenH = engine.screen.resolution.height;
        
        // Re-create overlay graphic to fit screen
        const bg = new Rectangle({
            width: screenW * 2,
            height: screenH * 2,
            color: Color.Black
        });
        this.overlay.graphics.use(bg);
        // Update collider for clicks
        (this.overlay.collider as any).useBoxCollider(screenW * 2, screenH * 2);
        
        this.contentArea.pos = vec(screenW / 2, screenH / 2);
    }

    show() {
        this.graphics.visible = true;
        // Re-center just in case
        if (this.scene && this.scene.engine) {
             this.contentArea.pos = vec(this.scene.engine.screen.resolution.width / 2, this.scene.engine.screen.resolution.height / 2);
        }
        // Enable interaction
        this.pos.x = 0; 
    }

    hide() {
        this.graphics.visible = false;
        this.pos.x = -10000; // Move away to ensure no interaction
    }
    
    isOpen() {
        return this.graphics.visible;
    }
}
