import { defineFunction } from '@aws-amplify/backend';

export const incrementClicks = defineFunction({
  name: 'incrementClicks',
  entry: './handler.ts',
  resourceGroupName: 'data'
});
