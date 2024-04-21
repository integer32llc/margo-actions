import * as toolCache from "@actions/tool-cache";
import * as actions from "@actions/core";
import * as github from "@actions/github";
import * as exec from "@actions/exec";
import * as glob from "@actions/glob";
import * as authAction from "@octokit/auth-action";

const owner = "integer32llc";
const repo = "margo";
const tag = "0.1.0";

async function downloadStaticRegistryTool(): Promise<string> {
  let authFn = authAction.createActionAuth();
  let auth = await authFn();
  const octokit = github.getOctokit(auth.token);

  const release = await octokit.rest.repos.getReleaseByTag({
    owner,
    repo,
    tag,
  });

  const asset = release.data.assets.find(
    (asset) => asset.name === "margo-linux-x86_64.tar.gz",
  );

  if (!asset) {
    throw new Error("asset missing from release");
  }

  const tarpath = await toolCache.downloadTool(
    asset.url,
    undefined,
    undefined,
    {
      accept: "application/octet-stream",
    },
  );

  const path = await toolCache.extractTar(tarpath);

  return await toolCache.cacheFile(`${path}/margo`, "margo", "margo", tag);
}

async function ensureStaticRegistryTool() {
  let existing = toolCache.find("margo", tag);
  if (!existing) {
    existing = await downloadStaticRegistryTool();
  }
  actions.addPath(existing);
}

async function run() {
  let cratePathsPattern = actions.getInput("crates");
  let cratePathsGlob = await glob.create(cratePathsPattern, {
    matchDirectories: false,
  });
  let cratePaths = await cratePathsGlob.glob();

  await actions.group(
    "Ensure margo binary is available",
    ensureStaticRegistryTool,
  );

  await actions.group("Publish code to registry", async () => {
    for (const cratePath of cratePaths) {
      await exec.getExecOutput("margo", ["add", "--registry", ".", cratePath]);
    }
  });
}

run();
