const { Octokit } = require("@octokit/rest");
const { exec, spawn } = require("child_process");
const { connected } = require("process");

const args = process.argv.slice(2);

const runnerName = args[0];

if (runnerName == undefined) {
  console.log("Usage: addRunner [runnerName]");
  process.exit(1);
}

const config = require('./config.json');

const host = config.host;
const apiUrl = config.apiUrl;
const githubPAT = config.githubPAT;
const ownerName = config.ownerName;
const repoName = config.repoName;

const haveConfigError = [githubPAT, ownerName, repoName].some((element) => {
  element == undefined || element == null || typeof element != "string"
});

console.log(`configError: ${haveConfigError}`);

console.log(`Add runner by name ${runnerName}`);

const octokit = new Octokit({
  auth: githubPAT,
  baseUrl: apiUrl,
});

async function loadRepositoryToken() {
  const tokenResponse = await octokit.request(
    "POST /repos/{owner}/{repo}/actions/runners/registration-token",
    {
      owner: ownerName,
      repo: repoName,
    }
  );

  const newToken = tokenResponse.data.token;

  console.log(`Created new Repository token: ${newToken}`);

  return newToken;
}

function runDocker(runnerName, repoToken) {
  const script = `
    docker run -d --restart always \
  --name ${runnerName} \
  -e REPO_URL="https://${host}/${ownerName}/${repoName}" \
  -e RUNNER_NAME="docker-runner-${runnerName}" \
  -e RUNNER_TOKEN=${repoToken} \
  -e RUNNER_GROUP="default" \
  -e RUNNER_WORKDIR="/tmp/github-runner-${repoName}" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /tmp/github-runner-${runnerName}:/tmp/github-runner-${repoName} \
  myoung34/github-runner:latest
    `;
  console.log(script);

  if (process.platform == "win32") {
    const runnerSpawn = spawn(script, { 'shell' : 'powershell.exe'});

    runnerSpawn.stdout.on('data', (data) => {
      console.log(data);
    });

    runnerSpawn.stderr.on('data', (data) => {
      console.error(`Make runner error: ${data}`);
    });

    runnerSpawn.on('close', (code) => {
      console.log(`Make runner process exited with code ${code}`);
    });
  } else {
      const runnerSpawn = spawn(script);

    runnerSpawn.stdout.on('data', (data) => {
      console.log(data);
    });

    runnerSpawn.stderr.on('data', (data) => {
      console.error(`Make runner error: ${data}`);
    });

    runnerSpawn.on('close', (code) => {
      console.log(`Make runner process exited with code ${code}`);
    });
  }
}

async function addNewRunner(runnerName) {
  const token = await loadRepositoryToken();
  runDocker(runnerName, token);
}

addNewRunner(runnerName);
