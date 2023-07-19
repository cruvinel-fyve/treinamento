import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // ES6 import
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb"; // ES6 import

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client); // client is DynamoDB client


export async function getProductsByName (event:any): Promise<any> {
    const name = event.queryStringParameters.search;
    
    const params = new ScanCommand ({
        TableName : 'products-cdk',
        FilterExpression : '#field_name = :this_name',
        ExpressionAttributeValues : {':this_name' : name},
        ExpressionAttributeNames : {'#field_name': 'nome'}
    });
    
    const responsedb = await dynamodb.send(params);
    
    const response = {
        statusCode: 200,
        body: JSON.stringify(responsedb.Items),
    };
    return response;
}