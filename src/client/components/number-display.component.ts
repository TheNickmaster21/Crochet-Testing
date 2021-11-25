import { CrochetClient } from '@rbxts/crochet';
import { NumberProperty } from 'shared/attributes';
import { TagComponent } from '@rbxts/crochet/out/core';

export const NumberDisplayTag = 'NUMBER_DISPLAY';

interface DisplayGui extends BillboardGui {
    Frame: Frame & {
        TextLabel: TextLabel;
    };
}

export class NumberDisplayComponent extends TagComponent {
    private changeConnections: RBXScriptConnection[] = [];
    private display: DisplayGui;

    constructor(instance: Instance) {
        super(instance);
        const display = new Instance('BillboardGui');
        display.AlwaysOnTop = true;
        display.Size = new UDim2(0, 50, 0, 50);
        const frame = new Instance('Frame');
        frame.Parent = display;
        frame.Size = new UDim2(1, 0, 1, 0);
        const textLabel = new Instance('TextLabel');
        textLabel.TextScaled = true;
        textLabel.Size = new UDim2(1, 0, 1, 0);
        textLabel.Parent = frame;
        display.Parent = instance;
        display.Adornee = instance.IsA('PVInstance')
            ? instance
            : error('NumberDisplayTag can only be used on PVInstances!');
        this.display = display as DisplayGui;

        this.updateDisplay();

        this.changeConnections.push(
            this.instance.GetAttributeChangedSignal(NumberProperty.name).Connect(() => {
                this.updateDisplay();
            })
        );

        print('NumberDisplayComponent created');
    }

    onTagRemoved(): void {
        this.changeConnections.forEach((connection) => connection.Disconnect());
        this.display.Destroy();
        print('NumberDisplayComponent removed');
    }

    private updateDisplay(): void {
        this.display.Frame.TextLabel.Text =
            tostring(CrochetClient.getAttribute(this.instance, NumberProperty)) ??
            error('Missing NumberProperty attribute on NumberDisplayComponent Instance!');
    }
}
