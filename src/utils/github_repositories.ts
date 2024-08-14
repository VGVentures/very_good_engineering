import { Octokit } from "@octokit/rest";
import { languageColors, type LanguageColor } from "./github_languages";

export type GithubRepository = {
  name: string;
  organization: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  language: string | null;
  languageColor: LanguageColor | null;
};

export type GithubRepositories = { [key: string]: GithubRepository };

var repositoryCache: GithubRepositories | undefined;
const organizationName = "VGVentures";

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
  const octokit = new Octokit({ auth: process.env["GH_BASIC"] });

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
      fullName: raw["full_name"],
      description: raw["description"] ?? "",
      stars: raw["stargazers_count"] ?? 0,
      forks: raw["forks"] ?? 0,
      language: raw["language"] ?? "",
      languageColor: languageColor,
    };
    repos[repo.fullName] = repo;
    console.log("GitHub Repository: " + repo.fullName);
  }

  return repos;
}
