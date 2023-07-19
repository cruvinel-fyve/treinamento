import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // ES6 import
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb"; // ES6 import

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client); // client is DynamoDB client

export async function getProducts (event:any): Promise<any> {
    
    const params = new ScanCommand ({
        TableName : 'products-cdk '
    });
    
    const responsedb = await dynamodb.send(params);
    
    const response = {
        statusCode: 200,
        body: JSON.stringify({ 
            products: responsedb.Items
        }),
    };
    return response;
}