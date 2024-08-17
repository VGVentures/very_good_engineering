import { Octokit } from "@octokit/rest";
import { languageColors, type LanguageColor } from "./github_languages";

export type GithubRepository = {
  name: string;
  organization: string;
  url: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  language: string | null;
  languageColor: LanguageColor | null;
};

export type GithubRepositories = { [key: string]: GithubRepository };

export const organizationName = "VGVentures";

// Personal access token environment variable name.
// For locally building this project, make your own PAT and set it in your
// environment under this name.
//
// This secret environment value is already provided for the repository so that
// GitHub actions will run accordingly.
export const VGVENTURES_GITHUB_PAT = "VGVENTURES_GITHUB_PAT";

var repositoryCache: GithubRepositories | undefined;

export async function getRepositories(): Promise<GithubRepositories> {
  if (repositoryCache === undefined) {
    repositoryCache =
      await fetchOrganizationPublicRepositories(organizationName);
  }

  return repositoryCache;
}

// Returns a map of repository full names to repository data.
async function fetchOrganizationPublicRepositories(
  organizationName: string,
): Promise<GithubRepositories> {
  const octokit = new Octokit({ auth: process.env[VGVENTURES_GITHUB_PAT] });

  // Get EVERY public repo in the organization.
  const response = await octokit.repos.listForOrg({
    type: "public",
    org: organizationName,
  });

  if (typeof response !== "object" || !Array.isArray(response["data"])) {
    throw new Error(
      "Unexpected response from GitHub API: " +
        JSON.stringify(response, null, 2),
    );
  }

  const data = response["data"];

  // Return a map of repository full names to repository data.
  var repos: GithubRepositories = {};
  for (const raw of data) {
    const language = raw["language"];
    const languageColor =
      language != null ? languageColors[language] ?? null : null;
    const repo: GithubRepository = {
      name: raw["name"],
      organization: organizationName,
      url: raw["html_url"],
      fullName: raw["full_name"],
      description: raw["description"] ?? "",
      stars: raw["stargazers_count"] ?? 0,
      forks: raw["forks"] ?? 0,
      language: raw["language"] ?? "",
      languageColor: languageColor,
    };
    repos[repo.fullName] = repo;
    console.log("GitHub Repository: " + JSON.stringify(repo, null, 2));
  }

  return repos;
}
