import { EventDefinition } from './framework';

export const TestRemoteEvent = new EventDefinition<[string, boolean, number]>('TestRemoteEvent');
