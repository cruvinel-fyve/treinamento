import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { postCart } from "../../../../../../../functions/post-cart";

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    console.log('event: ', JSON.stringify(event));
    const response = await postCart(event);
    
    return response;
}