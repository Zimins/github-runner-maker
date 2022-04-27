# github-runner-maker

Adds new self-hosted runner(Github Action) by Docker with nodejs.

Depends on https://github.com/myoung34/docker-github-actions-runner.

This repository is a node wrapper with config file for convinient.

## Usage 
Required install: Docker(execute docker before start this), Nodejs 


First, write config.json on root directory.

You need 5 parameters. 


```
{
    "host": "github.com",
    "apiUrl": "https://api.github.com",
    "githubPAT": "your personal access token",
    "ownerName": "zimins", // your name 
    "repoName": "fun-repository"  // target respository name
}
```

Then run addRunner with Runner Name. 

```
npm install 
npm run addRunner [runnerName]
```

And check your respositorys setting > actions. Enjoy!
