import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origions from "@aws-cdk/aws-cloudfront-origins";
import * as s3Deployment from "@aws-cdk/aws-s3-deployment";

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
  }
}
