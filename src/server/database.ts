import mongoose, { ConnectOptions } from "mongoose";
import Repository from "../core/Repository";
import config from "../config";
import AnonymizedRepositoryModel from "../core/model/anonymizedRepositories/anonymizedRepositories.model";
import AnonymousError from "../core/AnonymousError";
import AnonymizedPullRequestModel from "../core/model/anonymizedPullRequests/anonymizedPullRequests.model";
import PullRequest from "../core/PullRequest";

function getMongoUrl(): string {
  const { DB_USERNAME, DB_PASSWORD, DB_HOSTNAME } = config;
  if (DB_USERNAME && DB_PASSWORD) {
    return `mongodb://${encodeURIComponent(DB_USERNAME)}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOSTNAME}:27017/`;
  }
  return `mongodb://${DB_HOSTNAME}:27017/`;
}

export const database = mongoose.connection;

export let isConnected = false;

const CONNECT_RETRIES = 10;
const CONNECT_RETRY_DELAY_MS = 3000;

export async function connect() {
  mongoose.set("strictQuery", false);
  const url = getMongoUrl() + "production";
  const options = {
    authSource: "admin",
    appName: "Anonymous GitHub Server",
    compressors: "zstd",
    serverSelectionTimeoutMS: 5000,
  } as ConnectOptions;

  let lastErr: unknown;
  for (let attempt = 1; attempt <= CONNECT_RETRIES; attempt++) {
    try {
      await mongoose.connect(url, options);
      isConnected = true;
      return database;
    } catch (err) {
      lastErr = err;
      if (attempt < CONNECT_RETRIES) {
        console.warn(`MongoDB connection attempt ${attempt}/${CONNECT_RETRIES} failed, retrying in ${CONNECT_RETRY_DELAY_MS}ms...`, err);
        await new Promise((r) => setTimeout(r, CONNECT_RETRY_DELAY_MS));
      }
    }
  }
  throw lastErr;
}

export async function getRepository(repoId: string, opts: {} = {}) {
  if (!repoId || repoId == "undefined") {
    throw new AnonymousError("repo_not_found", {
      object: repoId,
      httpStatus: 404,
    });
  }
  const data = await AnonymizedRepositoryModel.findOne({ repoId }).collation({
    locale: "en",
    strength: 2,
  });
  if (!data)
    throw new AnonymousError("repo_not_found", {
      object: repoId,
      httpStatus: 404,
    });
  return new Repository(data);
}
export async function getPullRequest(pullRequestId: string) {
  if (!pullRequestId || pullRequestId == "undefined") {
    throw new AnonymousError("pull_request_not_found", {
      object: pullRequestId,
      httpStatus: 404,
    });
  }
  const data = await AnonymizedPullRequestModel.findOne({
    pullRequestId,
  });
  if (!data)
    throw new AnonymousError("pull_request_not_found", {
      object: pullRequestId,
      httpStatus: 404,
    });
  return new PullRequest(data);
}
