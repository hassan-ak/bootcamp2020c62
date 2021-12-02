# CI/CD pipeline for cdk backend

In this step we are setting up a complete CI/CD pipeline for the deployment of cdk backend stack

## Steps to code

1. Create a new directory by using `mkdir step02_01_pipeline`
2. Naviagte to the newly created directory using `cd step02_01_pipeline`
3. Create a cdk app using `cdk init app --language typescript`
4. Use `npm run watch` to auto build our app as we code
5. We need a github access so genrate a personal token with total control by visting [Personal access tokens](https://github.com/settings/tokens)
6. Go to the AWS secret Manager Console and click on store a new secret. Select Secret type other type of secrets and select plaintext and paste the token in the input. Then add a secret name and it will be used in your cdk code then save.
7. Install code pipeline in the app using `npm i @aws-cdk/aws-codepipeline`
8. Update "lib.step02_01_pipeline-stack.ts" to define artifact which is going to store output from source and build stage.

   ```js
   import * as codePipeline from "@aws-cdk/aws-codepipeline";
   const sourceOutput = new codePipeline.Artifact();
   const CDKOutput = new codePipeline.Artifact();
   ```

9. Update "lib.step02_01_pipeline-stack.ts" to define pipeline.

   ```js
   const piplin = new codePipeline.Pipeline(this, "CDKPipeLine", {
     pipelineName: "step14-02-01-pipeline",
     crossAccountKeys: false,
     restartExecutionOnUpdate: true,
   });
   ```

10. Install code pipeline action in the app using `npm i @aws-cdk/aws-codepipeline-actions`
11. Update "lib.step02_01_pipeline-stack.ts" to define source Stage

    ```js
    import * as CodePipelineAction from "@aws-cdk/aws-codepipeline-actions";
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
    ```

12. install codebuild in the app using `npm i @aws-cdk/aws-codebuild`
13. Update "lib.step02_01_pipeline-stack.ts" to define build action

    ```js
    const cdkBuild = new CodeBuild.PipelineProject(this, "CdkBuild", {
      projectName: "step14-02-01-build-project",
      buildSpec: CodeBuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            "runtime-versions": {
              nodejs: 12,
            },
            commands: [
              "cd step14_CI_CD_pipeline",
              "cd step02_01_CI_CD_for_backend",
              "cd step02_01_backend",
              "npm install",
            ],
          },
          build: {
            commands: ["npm run build", "npm run cdk synth -- -o dist"],
          },
        },
        artifacts: {
          "base-directory":
            "./step14_CI_CD_pipeline/step02_01_CI_CD_for_backend/step02_01_backend/dist",
          files: [`Step0201BackendStack.template.json`],
        },
      }),
      environment: {
        buildImage: CodeBuild.LinuxBuildImage.STANDARD_3_0,
      },
    });
    ```

14. Update "lib.step02_01_pipeline-stack.ts" to define build stage

    ```js
    piplin.addStage({
      stageName: "BuildStage",
      actions: [
        new CodePipelineAction.CodeBuildAction({
          actionName: "cdkBuild",
          project: cdkBuild,
          input: sourceOutput,
          outputs: [CDKOutput],
        }),
      ],
    });
    ```

15. Update "lib.step02_01_pipeline-stack.ts" to define Deploy stage

    ```js
    piplin.addStage({
      stageName: "DepolyStage",
      actions: [
        new CodePipelineAction.CloudFormationCreateUpdateStackAction({
          actionName: "AdministerPipeline",
          templatePath: CDKOutput.atPath(`Step0201BackendStack.template.json`), ///Input artifact with the CloudFormation template to deploy
          stackName: "Step0201BackendStack",
          adminPermissions: true,
        }),
      ],
    });
    ```

16. Deploy the app using `cdk deploy`
17. From now ownward any commits to github will be deployed automaticly
18. Destroy the app using `cdk destroy`
