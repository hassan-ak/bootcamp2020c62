# CDK App deployed through CI/CD pipeline

## Steps to code

1. Create a new directory by using `mkdir step02_01_backend`
2. Naviagte to the newly created directory using `cd step02_01_backend`
3. Create a cdk app using `cdk init app --language typescript`
4. Install lambda in the app using `npm i @aws-cdk/aws-lambda`
5. Update "lib.step02_01_backend-stack.ts" to define lambda function in the app.

   ```js
   import * as lambda from "@aws-cdk/aws-lambda";
   const hello = new lambda.Function(this, "HelloHandler", {
     runtime: lambda.Runtime.NODEJS_14_X,
     code: lambda.Code.fromAsset("lambda"),
     handler: "hello.handler",
   });
   ```

6. Create "lambda/hello.ts" to define lambda handler

   ```js
   export async function handler(event: any) {
     console.log("request:", JSON.stringify(event, undefined, 2));

     return {
       statusCode: 200,
       headers: { "Content-Type": "text/plain" },
       body: `Hello, CDK! You've hit ${event.path}\n`,
     };
   }
   ```

7. We dont need to deploy the app this will be done automatically as this is connected with pipeline project
8. After testing distroy the app
