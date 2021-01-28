import { Service } from '@rbxts/crochet';

export class TimeService extends Service {
    public getTime(): number {
        return os.time();
    }
}
