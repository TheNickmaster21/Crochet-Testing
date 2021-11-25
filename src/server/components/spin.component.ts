import { TagComponent } from '@rbxts/crochet/out/core';

export const SpinTag = 'SPIN';

export class SpinComponent extends TagComponent {
    private spinner: BodyAngularVelocity;

    constructor(instance: Instance) {
        super(instance);
        this.spinner = new Instance('BodyAngularVelocity');
        this.spinner.Parent = instance;
    }

    onTagRemoved(): void {
        this.spinner.Destroy();
    }
}
