import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { incrementClicks } from './functions/increment-clicks/resource';
import { createGuestUrl } from './functions/create-guest-url/resource';

const backend = defineBackend({
  auth,
  data,
  incrementClicks,
  createGuestUrl,
});

// Grant the function write access to the Url table
const urlTable = backend.data.resources.tables.Url;
const incrementClicksLambda = backend.incrementClicks.resources.lambda;
const createGuestUrlLambda = backend.createGuestUrl.resources.lambda;

urlTable.grantWriteData(incrementClicksLambda);
urlTable.grantWriteData(createGuestUrlLambda);

// Pass the table name to the function's environment
backend.incrementClicks.addEnvironment('URL_TABLE_NAME', urlTable.tableName);
backend.createGuestUrl.addEnvironment('URL_TABLE_NAME', urlTable.tableName);

