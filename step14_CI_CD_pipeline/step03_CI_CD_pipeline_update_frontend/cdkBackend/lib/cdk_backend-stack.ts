import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origions from "@aws-cdk/aws-cloudfront-origins";
import * as s3Deployment from "@aws-cdk/aws-s3-deployment";
import * as CodePipeline from "@aws-cdk/aws-codepipeline";
import * as CodePipelineAction from "@aws-cdk/aws-codepipeline-actions";

export class CdkBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Deploy Gatsby on S3 bucket
    // create new bucket
    const myBucket = new s3.Bucket(this, "GatsbyBucket", {
      bucketName: "GatsbyBucket",
      versioned: true,
      websiteIndexDocument: "index.html",
    });
    // create Cloudfront distribution
    const dist = new cloudfront.Distribution(this, "GatsbyDistribution", {
      defaultBehavior: { origin: new origions.S3Origin(myBucket) },
    });
    // create s3 deployment bundle
    new s3Deployment.BucketDeployment(this, "DeployGatsbyWebsite", {
      sources: [s3Deployment.Source.asset("../gatsbyfrontend/public")],
      destinationBucket: myBucket,
      distribution: dist,
    });

    // URL Ouput on Display
    new cdk.CfnOutput(this, "CloudFrontUrl", {
      value: dist.domainName,
    });

    // Artifacts
    const sourceOutput = new CodePipeline.Artifact();

    // Pipeline
    // Create Pipeline
    const pipeline = new CodePipeline.Pipeline(this, "GtasbyPipeline", {
      pipelineName: "step14-03-pipeline",
      crossAccountKeys: false,
      restartExecutionOnUpdate: true,
    });

    // Stages
    // FirstStage
    pipeline.addStage({
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
    // Second Stage
  }
}
