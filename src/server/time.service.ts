import { Service } from 'shared/framework';

export class TimeService extends Service {
    public getTime(): number {
        return os.time();
    }
}
