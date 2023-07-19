import { Construct } from "constructs";
import { importRole } from "../../../../../helpers/import-role";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from 'path';
import * as lambda from '@aws-cdk/aws-lambda'
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { ParameterDataType, ParameterTier, StringParameter } from "aws-cdk-lib/aws-ssm";

export function makePostOrdersLambda(this: any, app: Construct) {
    const functionName = 'Main-Api-Orders-postInfo';
    const importedRole = importRole(app, 'PostOrdersLambda', 'App@Lambda=FullAccess');

    const resource = new NodejsFunction(app, functionName, {
        handler: 'handler',
        functionName: functionName,
        role: importedRole as any,
        entry: path.join(__dirname, `/handler.ts`),
        runtime: lambda.Runtime.NODEJS_16_X,
        logRetention: RetentionDays.SIX_MONTHS,
        timeout: Duration.seconds(15),
    });

    new StringParameter(app, 'modules.lambda.api.sqs-orders', {
        parameterName: 'modules.lambda.api.sqs-orders',
        stringValue: resource.functionArn,
        dataType: ParameterDataType.TEXT,
        tier: ParameterTier.STANDARD,
    });

    new lambda.LayerVersion(this, 'AxiosLayer', {
        removalPolicy: RemovalPolicy.RETAIN,
        code: lambda.Code.fromAsset(path.resolve(__dirname, './handler.ts')),
        compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],
    });

    return resource;
};