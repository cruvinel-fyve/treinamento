import {  APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { getProductsByName } from "../../../../../../../functions/get-products-by-name";

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2>{
    console.log('event: ', JSON.stringify(event));
    const response = await getProductsByName(event);

    return response;
}