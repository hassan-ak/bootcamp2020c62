import * as cdk from "@aws-cdk/core";
import * as codePipeline from "@aws-cdk/aws-codepipeline";
import * as CodePipelineAction from "@aws-cdk/aws-codepipeline-actions";

export class Step01SetupBasicPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Artifact to store output of stage one
    const sourceOutput = new codePipeline.Artifact();

    // Define Pipeline
    const piplin = new codePipeline.Pipeline(this, "CDKPipeLine", {
      crossAccountKeys: false, //Pipeline construct creates an AWS Key Management Service (AWS KMS) which cost $1/month. this will save your $1.
      restartExecutionOnUpdate: true, //Indicates whether to rerun the AWS CodePipeline pipeline after you update it.
    });

    // Adding Stages
    // Source Stage - First Stage
    piplin.addStage({
      stageName: "SourceStage",
      actions: [
        new CodePipelineAction.GitHubSourceAction({
          actionName: "Checkout",
          owner: "hassan-ak",
          repo: "bootcamp2020c62",
          oauthToken: cdk.SecretValue.secretsManager("Github-Personal-Secret"),
          output: sourceOutput,
          branch: "main",
        }),
      ],
    });
  }
}
