import { APIGatewayProxyResultV2, SQSHandler } from "aws-lambda";
import { postOrders } from "../../../../../../../functions/post-orders";

export async function handler(event: SQSHandler): Promise<APIGatewayProxyResultV2> {
    console.log('event: ', JSON.stringify(event));
    const response = await postOrders(event);

    return response;
}