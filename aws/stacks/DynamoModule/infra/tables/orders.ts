import { Construct } from "constructs";
import { AttributeType, BillingMode, StreamViewType, Table } from "aws-cdk-lib/aws-dynamodb";
import { ParameterTier, ParameterDataType, StringParameter } from "aws-cdk-lib/aws-ssm";

export function makeOrdersTable(app: Construct) {
    const resource = new Table(app, 'OrdersTable', {
        partitionKey: { name: 'userId', type: AttributeType.STRING },
        sortKey: { name: 'date', type: AttributeType.STRING},
        tableName: 'orders',
        stream: StreamViewType.NEW_AND_OLD_IMAGES,
        billingMode: BillingMode.PAY_PER_REQUEST,
        pointInTimeRecovery: true,
    });

    new StringParameter(app, 'module.orders.dynamodb.table.orders', {
        parameterName: 'modules.dynamodb.tables.orders',
        stringValue: resource.tableName,
        dataType: ParameterDataType.TEXT,
        tier: ParameterTier.STANDARD
    });
    return resource;
};