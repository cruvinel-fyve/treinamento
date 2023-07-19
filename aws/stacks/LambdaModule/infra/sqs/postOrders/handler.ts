import { APIGatewayProxyEventV2, SQSEvent, SQSHandler } from "aws-lambda";
import { sqsPostOrders } from "../../../../../../functions/sqs-post-orders";

export async function handler(event: APIGatewayProxyEventV2): Promise<SQSHandler> {
    console.log('event: ', JSON.stringify(event));
    const response = await sqsPostOrders(event);

    return response;
}