import { Stack, StackProps } from "aws-cdk-lib";
import { TablesModule } from "./infra/tables";
import { Construct } from "constructs";

export class DynamoModule extends Stack {
    constructor(app: Construct, name: string, props?: StackProps) {
        super(app, name, props);
        new TablesModule(this, 'TablesModule', props);
    }
}