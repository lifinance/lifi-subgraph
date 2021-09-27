# Deploy a subgraph to Legacy Explorer
Currently, subgraphs on chains other than Ethereum Mainnet need to be deployed to the Legacy Explorer. 
Here, we're using Connext's NXTP subgraph as a template and modifying it according to our needs. 

# Get Started
Subgraphs are used to extract data from a particular smart contract on any of the EVM compatible blockchains. 

# Setup
<br>You'll get started here by creating a subgraph and authorizing your graph cli.

### Step 1:
To get started right away, go to [Legacy Explorer dashboard](https://thegraph.com/legacy-explorer/dashboard) on The Graph
<br>And sign in using your github account. 

### Step 2:
Click on **Add Subgraph**. <br>
Give it a name you like, a simple decription and everything else is optional. 

### Step 3:
Install Graph Cli on your terminal. 
```
yarn global add @graphprotocol/graph-cli
```
If you don't have yarn installed please install yarn from [here](https://classic.yarnpkg.com/en/docs/install/). 

### Step 4:
Authentication to deploy the subgraph from CLI. 
```
graph auth --product hosted-service <ACCESS_TOKEN>
```
You can find the <ACCESS_TOKEN> in your Legacy Explorer Dashboard [here](https://thegraph.com/legacy-explorer/dashboard).

### Step 5:
Clone this repo using your command line. 
```
git clone https://github.com/lifinance/custom_nxtp.git
```
OR
You can also initiate with a scaffold code provided by The Graph, you'll not have the code we have for Connext's smart contracts. Personally, I prefer modifying an existing code. <br>
```
graph init --product hosted-service <GITHUB_USER>/<SUBGRAPH NAME>
```
If you do this, you can skip the next step. 

### Step 6: 
Install all the node modules. 
```
yarn install
```


# Modifying to reuse Connext's subgraph
Here you'll learn how to use the existing Connext's subgraph to modify and deploy for your needs. 

## The files that matter
1. **custom_nxtp/schema.graphql** - The schema or the data format we'll be query in. 
2. **custom_nxtp/src/mapping.ts** - The typescript where you map various data points to the variables in the schema. 
3. **custom_nxtp/subgraph.template.yaml** - The template where we define the different smart contract events we'll be listening to. 
4. **custom_nxtp/package.json** - This is where we have yarn commands that need to be changed to deploy to your Graph account.  

## Modifying the schema and it's mapping. 
Please go through the schema to understand various entities and their types. I will not be going through what they mean right now(maybe I'll, in the future). <br>

The **mapping.ts** file handles the events you'd be listening to from your smart contract. The best way to understand what kind of events you can play with is to go through the smart contract. Please go through this file as well to understand how the events are handled. 

## Configuring deployment for various blockchains
If you have the same contract deployed on multiple L2 side chains, then you can deploy subgraphs for each of those easily by configuring it once. 

### How does it work?
If you go through the **subgraph.template.yaml** file, you'll find 3 variables {{network}}, {{address}} and {{startBlock}}. This is a template file we're using to create the actual file we need for deployment, which is **subgraph.yaml**. So, we have yarn commands on package.json which substitutes the above variables with the actual values for the chain we're deploying. 

Now, how does yarn know where to get these values from? <br>
It's under **custom_nxtp/config/**, each file there has data of the contract present on a particular chain. You can modify a file and/or create another file with respective data for new chain. 

### Configuring for new chains
Alright, where's the code that replaces the variables in the **subgraph.template.yaml** file and replaces **subgraph.yaml** with new data? <br>
Please go to _package.json_ to figure out what commands achieve what purpose. 
1. To create the **subgraph.yaml** file: **yarn prepare:[chain]:prod**, this command uses mustache(library) to take variables from the file specified and substitute in the template file and create the modified **subgraph.yaml** file. Please modify these commands to your needs
2. **yarn deploy:[chain]:prod** - This commands executes the prepare command above and deploys to the subgraph defined in this command. 
3. Replace **0xakshay/nxtpmatic** with your subgraph, i.e., **[YOUR_GITHUB_USERNAME]/[YOUR_SUBGRAPH_NAME]**

## Deploying
Once you have everything ready for your particular chain(s), you can generate necessary files and deploy easily. 
### Step 1: 
This is the procedure to deploy/redeploy the subgraph, always. 
```
yarn codegen
```

### Step 2:
```
yarn deploy:matic:prod
```
That's it. your subgraphs are deployed, check out their page on your dashboard to query or see if they're synced. 

## Redeploying
Every time you deploy you need to execute the above commands. If you're building these files from scratch, it'd be better to look into deploying locally before deploying again and again to The Graph. Check out the **create-local** command on **package.yaml**.

# Troubleshooting
## Failed Sync
This happens when there's an error in your **mapping.ts** file where it can't find the required data, or it can be in your **subgraph.yaml** file, etc.

### To query Subgraph Health, do these steps:<br>
(This will retrieve the error message for failed subgraphs)

### Step 1:
Find your Deployment ID ("Qm....") in your subgraph's page. It is the ID that starts with "Qm". 

### Step 2:
Go to https://graphiql-online.com/ <br>
Enter this in the **GraphQL Endpoint URL** field 
```
https://api.thegraph.com/index-node/graphql
```

### Step 3:
Copy paste the following query:
```
{
  indexingStatuses(subgraphs: ["Qm..."]) {
    subgraph
    synced
    health
    entityCount
    fatalError {
      handler
      message
      deterministic
      block {
        hash
        number
      }
    }
    chains {
      chainHeadBlock {
        number
      }
      earliestBlock {
        number
      }
      latestBlock {
        number
      }
    }
  }
}
```
That's it, you should be able to see the error, fix it and redeploy it. :)

## Thank you
I'll be adding more information here as I learn more about subgraph deployment to the Legacy Explorer. 
