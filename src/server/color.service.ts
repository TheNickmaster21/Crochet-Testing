import { ClientFunction, Service } from 'shared/framework';

export class ColorService extends Service {
    public getBrickColors(): BrickColor[] {
        return [BrickColor.Black(), BrickColor.Gray(), BrickColor.White()];
    }

    public getColor3s(): Color3[] {
        return [Color3.fromRGB(0, 0, 0), Color3.fromRGB(255, 255, 255)];
    }
}

export type ClientColorService = ClientFunction<ColorService>;
