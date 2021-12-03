# CI/CD pipeline for Gatsby Frontend

In this step we are setting up a complete CI/CD pipeline for the deployment of Gastby frontend

## Steps to code

1. Create a new directory by using `mkdir cdkBackend`
2. Naviagte to the newly created directory using `cd cdkBackend`
3. Create a cdk app using `cdk init app --language typescript`
4. Use `npm run watch` to auto build our app as we code
5. We need a github access so genrate a personal token with total control by visting [Personal access tokens](https://github.com/settings/tokens)
6. Go to the AWS secret Manager Console and click on store a new secret. Select Secret type other type of secrets and select plaintext and paste the token in the input. Then add a secret name and it will be used in your cdk code then save.
7. Install "aws-s3" module in the app using `npm i @aws-cdk/aws-s3`
8. Update "lib/cdkBackend-stack.ts" to create new s3 bucket in the stack

   ```js
   import * as s3 from "@aws-cdk/aws-s3";
   const myBucket = new s3.Bucket(this, "GatsbyBucket", {
     bucketName: "GatsbyBucket",
     versioned: true,
     websiteIndexDocument: "index.html",
   });
   ```

9. Install "cloudfront" module in the app using `npm i @aws-cdk/aws-cloudfront`
10. Install "cloudfront origions" module in the app using `npm i @aws-cdk/aws-cloudfront-origins`
11. Update "lib/cdkBackend-stack.ts" to create new cloudfront distribution

    ```js
    import * as cloudfront from "@aws-cdk/aws-cloudfront";
    import * as origions from "@aws-cdk/aws-cloudfront-origins";
    const dist = new cloudfront.Distribution(this, "GatsbyDistribution", {
      defaultBehavior: { origin: new origions.S3Origin(myBucket) },
    });
    ```

12. Install "s3 deployment module" using `npm i @aws-cdk/aws-s3-deployment`
13. Update "lib/cdkBackend-stack.ts" to create new s3 deployment bundle

    ```js
    import * as s3Deployment from "@aws-cdk/aws-s3-deployment";
    new s3Deployment.BucketDeployment(this, "DeployGatsbyWebsite", {
      sources: [s3Deployment.Source.asset("../gatsbyfrontend/public")],
      destinationBucket: myBucket,
      distribution: dist,
    });
    ```

14. Update "lib/cdkBackend-stack.ts" to display URL as output

    ```js
    new cdk.CfnOutput(this, "CloudFrontUrl", {
      value: dist.domainName,
    });
    ```

15. Install code pipeline in the app using `npm i @aws-cdk/aws-codepipeline`
16. Update "lib/cdkBackend-stack.ts" to define pipeline.

    ```js
    import * as codePipeline from "@aws-cdk/aws-codepipeline";
    const pipeline = new CodePipeline.Pipeline(this, "GtasbyPipeline", {
      pipelineName: "step14-03-pipeline",
      crossAccountKeys: false,
      restartExecutionOnUpdate: true,
    });
    ```

17. Install code pipeline action in the app using `npm i @aws-cdk/aws-codepipeline-actions`
18. Update "lib/cdkBackend-stack.ts" to define source Stage

    ```js
    import * as CodePipelineAction from "@aws-cdk/aws-codepipeline-actions";
    const sourceOutput = new CodePipeline.Artifact();
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
    ```

19. install codebuild in the app using `npm i @aws-cdk/aws-codebuild`
20. Update "lib/cdkBackend-stack.ts" to define build action

    ```js
    import * as CodeBuild from "@aws-cdk/aws-codebuild";
    const cdkBuild = new CodeBuild.PipelineProject(this, "s3Build", {
      projectName: "step14-03-build-project",
      buildSpec: CodeBuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            "runtime-versions": {
              nodejs: 15,
            },
            commands: [
              "cd step14_CI_CD_pipeline",
              "cd step03_CI_CD_pipeline_update_frontend",
              "cd gatsbyfrontend",
              "npm i -g gatsby",
              "npm install",
            ],
          },
          build: {
            commands: ["gatsby build"],
          },
        },
        artifacts: {
          "base-directory":
            "./step14_CI_CD_pipeline/step03_CI_CD_pipeline_update_frontend/gatsbyfrontend/public",
          files: [`**/*`],
        },
      }),
      environment: {
        buildImage: CodeBuild.LinuxBuildImage.STANDARD_3_0,
      },
    });
    ```

21. install IAM in the app using `npm i @aws-cdk/aws-iam`
22. Update "lib/cdkBackend-stack.ts" to define and assign policy androle to build function

    ```js
    const policy = new PolicyStatement();
    policy.addActions("s3:*");
    policy.addResources("*");
    s3Build.addToRolePolicy(policy);
    ```

23. Update "lib/cdkBackend-stack.ts" to define build stage

    ```js
    const S3Output = new codePipeline.Artifact();
    pipeline.addStage({
      stageName: "BuildStage",
      actions: [
        new CodePipelineAction.CodeBuildAction({
          actionName: "s3Build",
          project: s3Build,
          input: sourceOutput,
          outputs: [S3Output],
        }),
      ],
    });
    ```

24. Update "lib/cdkBackend-stack.ts" to define Deploy stage

    ```js
    pipeline.addStage({
      stageName: "DepolyStage",
      actions: [
        new CodePipelineAction.S3DeployAction({
          actionName: "s3Build",
          input: S3Output,
          bucket: myBucket,
        }),
      ],
    });
    ```

25. Deploy the app using `cdk deploy`
26. Destroy the app using `cdk destroy`
