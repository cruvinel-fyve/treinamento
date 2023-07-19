import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { getProducts } from "../../../../../../../functions/get-products";

export async function handler(event: APIGatewayProxyEventV2): Promise <APIGatewayProxyResultV2>{
    console.log('event: ', JSON.stringify(event));
    const response = await getProducts(event);
    
    return response;
}