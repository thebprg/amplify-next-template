import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomBytes } from "crypto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.URL_TABLE_NAME;

function generateShortCode(length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  // Use crypto for better randomness
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export const handler = async (event: any) => {
  console.log("Create Guest URL Event:", JSON.stringify(event, null, 2));

  // 1. Inputs
  // AppSync passes arguments in event.arguments
  const { originalUrl } = event.arguments;
  const ip = event.identity?.sourceIp || 'unknown';

  if (!originalUrl) {
    throw new Error("originalUrl is required");
  }

  // 2. Validate URL (Basic check, frontend/action does more)
  let urlToShorten = originalUrl.trim();
  if (!/^https?:\/\//i.test(urlToShorten)) {
    urlToShorten = 'https://' + urlToShorten;
  }

  if (!TABLE_NAME) {
    throw new Error("URL_TABLE_NAME is not defined");
  }

  // 3. Generate Short Code
  const shortCode = generateShortCode();

  // 4. Calculate Expiration (3 months)
  const expirationDate = new Date();
  expirationDate.setMonth(expirationDate.getMonth() + 3);
  const expirationTimestamp = Math.floor(expirationDate.getTime() / 1000);

  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;

  // 5. Create Item in DynamoDB
  // Note: We are bypassing the AppSync "createdAt/updatedAt" auto-generation 
  // so we must populate them if the schema expects them (Amplify Gen 2 does).
  const item = {
    id: crypto.randomUUID(), 
    shortCode,
    originalUrl: urlToShorten,
    clicks: 0,
    expiration: expirationTimestamp,
    createdAt,
    updatedAt,
    __typename: 'Url', // Required for AppSync if we were returning to it directly? Not strictly for DDB.
  };

  try {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      // Ensure specific shortCode uniqueness if it was the PK?
      // Our schema has 'id' as PK and 'shortCode' as GSI.
      // We should technically check for shortCode uniqueness, but collision prob is low for now.
    });

    await docClient.send(command);

    console.log("Created URL:", item.id);

    return item; 
  } catch (err) {
    console.error("DynamoDB Error:", err);
    throw new Error("Failed to create URL");
  }
};
