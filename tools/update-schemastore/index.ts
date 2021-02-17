import updateSchemaStore from "./update-schemastore"
import checkDiff from "./check-diff"
import { git, npm } from "./git-and-npm"

export default main()

/** Main */
async function main(): Promise<boolean> {
    await updateSchemaStore()
    if (!(await checkDiff())) {
        return false
    }

    // eslint-disable-next-line no-process-env -- ignore
    const GITHUB_ACTOR = process.env.GITHUB_ACTOR

    if (GITHUB_ACTOR) {
        await git("config", "user.name", GITHUB_ACTOR)
        await git(
            "config",
            "user.email",
            `${GITHUB_ACTOR}@users.noreply.github.com`,
        )
    }
    await git("add", ".")
    await git("commit", "-m", "Update schema store")
    await npm("version", "patch")

    // eslint-disable-next-line no-process-env -- ignore
    const { GITHUB_TOKEN } = process.env
    await git(
        "push",
        `https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/ota-meshi/eslint-plugin-json-schema-validator.git`,
        "main",
        "--tags",
    )

    return true
}