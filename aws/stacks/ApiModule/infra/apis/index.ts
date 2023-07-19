import { StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { makeMainApi } from "./main";

export class ApiModule extends Construct {
    constructor (scope: Construct, id: string, props?: StackProps) {
        super(scope, id);
        makeMainApi(this);
    }
}