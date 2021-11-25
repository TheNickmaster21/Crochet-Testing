import { PromptActionText, PromptObjectText } from 'shared/attributes';

import { CrochetServer } from '@rbxts/crochet';
import { TagComponent } from '@rbxts/crochet/out/core';

export const PromptTag = 'PROMPT';

export class PromptComponent extends TagComponent {
    private changeConnections: RBXScriptConnection[] = [];
    private prompt: ProximityPrompt;

    constructor(instance: Instance) {
        super(instance);
        this.prompt = new Instance('ProximityPrompt');
        this.prompt.Parent = instance;

        this.updateObjectText();
        this.updateActionText();

        this.changeConnections.push(
            this.instance.GetAttributeChangedSignal(PromptObjectText.name).Connect(() => {
                this.updateObjectText();
            })
        );
        this.changeConnections.push(
            this.instance.GetAttributeChangedSignal(PromptObjectText.name).Connect(() => {
                this.updateActionText();
            })
        );
    }

    onTagRemoved(): void {
        this.changeConnections.forEach((connection) => connection.Disconnect());
        this.prompt.Destroy();
    }

    private updateObjectText(): void {
        this.prompt.ObjectText =
            CrochetServer.getAttribute(this.instance, PromptObjectText) ??
            error('Missing PromptObjectText attribute on PromptComponent Instance!');
    }

    private updateActionText(): void {
        this.prompt.ActionText =
            CrochetServer.getAttribute(this.instance, PromptActionText) ??
            error('Missing PromptActionText attribute on PromptComponent Instance!');
    }
}
