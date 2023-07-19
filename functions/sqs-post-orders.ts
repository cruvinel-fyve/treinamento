import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs"; // ES Modules import
// const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs"); // CommonJS import
const sqs = new SQSClient({});

export async function sqsPostOrders (event:any): Promise<any> {
    console.log(typeof event)
    // Configurando mensagem sqs
    const messageSQS = JSON.stringify(event);
    const input = { // SendMessageRequest
    QueueUrl: "https://sqs.us-east-1.amazonaws.com/974775373655/requestOrderCreate", // required
    MessageBody: messageSQS, // required
    };
    console.log(messageSQS)

    const command = new SendMessageCommand(input);
    const responseSQS = await sqs.send(command);

    const response = {
        statusCode: 200,
        body: JSON.stringify(responseSQS),
    };
    return response;
}