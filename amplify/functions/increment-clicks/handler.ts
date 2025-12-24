import type { Schema } from "../../data/resource";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler: Schema["incrementClicks"]["functionHandler"] = async (event) => {
  const { urlId } = event.arguments;
  const tableName = process.env.URL_TABLE_NAME;

  if (!tableName) throw new Error("URL_TABLE_NAME missing");
  if (!urlId) throw new Error("URL ID missing");

  try {
    await client.send(new UpdateItemCommand({
      TableName: tableName,
      Key: {
        id: { S: urlId }
      },
      UpdateExpression: "ADD clicks :inc",
      ExpressionAttributeValues: {
        ":inc": { N: "1" }
      }
    }));
    
    // Return dummy value since we don't need the new count on the client immediately
    return 0;
  } catch (e) {
    console.error("Error incrementing clicks:", e);
    // Don't throw to avoid breaking the client if stats fail
    return 0; 
  }
};

