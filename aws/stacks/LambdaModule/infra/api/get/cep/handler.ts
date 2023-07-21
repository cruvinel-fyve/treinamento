import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { SearchAdress } from "../../../../../../../functions/search-adress";

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    console.log('event: ', JSON.stringify(event));
    const response = SearchAdress(event);
    
    return response;
}