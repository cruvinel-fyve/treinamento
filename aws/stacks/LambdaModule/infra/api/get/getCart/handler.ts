import { getCart } from "../../../../../../../functions/get-cart";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    console.log('event: ', JSON.stringify(event));
    const response = await getCart(event);

    return response;
}