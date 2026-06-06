export default {
  branches: ["main"],
  plugins: [
    // Determine version bump from conventional commit types:
    // fix: → patch, feat: → minor, BREAKING CHANGE: → major
    "@semantic-release/commit-analyzer",

    // Generate release notes / changelog body from commits
    "@semantic-release/release-notes-generator",

    // Append release notes to CHANGELOG.md
    ["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }],

    // Bump version in package.json (npmPublish: false — this is not published to npm)
    ["@semantic-release/npm", { npmPublish: false }],

    // Commit the CHANGELOG.md and package.json version bump back to main
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json"],
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],

    // Create the GitHub release with generated notes
    "@semantic-release/github",
  ],
};
