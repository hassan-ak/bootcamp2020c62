import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

export class Step0201BackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const hello = new lambda.Function(this, "HelloHandler", {
      functionName: "LambdaFunction",
      runtime: lambda.Runtime.NODEJS_14_X,
      // in case we need to upload something, a file or code we need to call fromAsset
      code: lambda.Code.fromAsset("lambda"),
      handler: "hello.handler",
    });
  }
}
