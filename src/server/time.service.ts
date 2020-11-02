import { Service } from 'shared/server-framework';

export class TimeService extends Service {
    public getTime(): number {
        return os.time();
    }
}
