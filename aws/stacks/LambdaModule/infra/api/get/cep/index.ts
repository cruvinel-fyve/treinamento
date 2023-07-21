import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from 'path';
import * as lambda from '@aws-cdk/aws-lambda'
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Duration } from "aws-cdk-lib";
import { ParameterDataType, ParameterTier, StringParameter } from "aws-cdk-lib/aws-ssm";
import { importRole } from "../../../../../helpers/import-role";

export function makeSearchAdress(app: Construct) {
    const functionName = 'Main-Api-Cep-Adress';
    const importedRole = importRole(app, 'SearchAdress', 'App@Lambda=FullAccess');
    const resource = new NodejsFunction(app, functionName, {
        handler: 'handler',
        functionName: functionName,
        role: importedRole as any,
        entry: path.join(__dirname, `/handler.ts`),
        runtime: lambda.Runtime.NODEJS_16_X,
        logRetention: RetentionDays.SIX_MONTHS,
        timeout: Duration.seconds(15),
    });


    new StringParameter(app, 'modules.lambda.api.cep-adress', {
        parameterName: 'modules.lambda.api.cep-adress',
        stringValue: resource.functionArn,
        dataType: ParameterDataType.TEXT,
        tier: ParameterTier.STANDARD,
    });

    return resource;
};