import { Construct } from "constructs";
import { StackProps } from "aws-cdk-lib";
import { makeProductsTable } from "./products";
import { makeCartTable } from "./cart";
import { makeOrdersTable } from "./orders";

export class TablesModule extends Construct {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id);
        makeProductsTable(this);
        makeCartTable(this);
        makeOrdersTable(this);
    };
};