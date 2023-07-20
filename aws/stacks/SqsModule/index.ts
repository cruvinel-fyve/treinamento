import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { SqsModule } from "./infra/queue";

export class SqssModule extends Stack {
    constructor(app: Construct, id: string, props?: StackProps){
        super(app, id, props);
        new SqsModule(this, 'SqsList', props);
    }
}