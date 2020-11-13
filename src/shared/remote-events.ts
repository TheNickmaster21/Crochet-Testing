import { EventDefinition } from '@rbxts/crochet';

export const TestRemoteEvent = new EventDefinition<[string, boolean, number]>('TestRemoteEvent');
