---
name: gitlab
description: Read and act on GitLab issues, merge requests, pipelines, and notes with the glab CLI and the `bb gitlab` command. Use when a task references a GitLab issue (#123), a merge request (!456), a GitLab project path, a pipeline failure, or when opening/updating a merge request.
---

# Working with GitLab

Two tools, different jobs:

- `bb gitlab …` — the plugin's cached view across every tracked project. Fast,
  no network, no host flags. Use it to find things.
- `glab …` — the GitLab CLI, live. Use it to read details and to write.

## Find work

```sh
bb gitlab projects                       # tracked projects, host-qualified
bb gitlab issues [host/group/project]    # cached open issues
bb gitlab mrs [host/group/project]       # cached open merge requests
bb gitlab sync                           # refresh the cache now
```

A project is always host-qualified — `gitlab.example.dev/group/subgroup/app` —
because a namespace path has any number of segments and the same path may exist
on two instances. Issues print as `<project>#<iid>`, merge requests as
`<project>!<iid>`.

## Read details

```sh
glab issue view <iid> -R <project> --comments
glab mr view <iid> -R <project> --comments
glab mr diff <iid> -R <project>
glab ci status -R <project>              # pipeline for the current branch
```

`-R` accepts the same host-qualified ref `bb gitlab` prints.

For anything the subcommands do not cover, call the REST API directly. The
project path is one URL-encoded id segment, and `--hostname` takes the bare
hostname only — never a scheme, a port, or a path:

```sh
glab api --hostname <host> "projects/group%2Fsubgroup%2Fapp/merge_requests/12/discussions"
glab api --hostname <host> "projects/group%2Fsubgroup%2Fapp/pipelines/26774/jobs"
```

Self-managed instances need nothing extra here. How a host is really reached —
`https` or `http`, a non-default port (`api_host`), a subfolder install
(`subfolder`), a separate SSH name (`ssh_host`), a private CA (`ca_cert`) — is
already in that host's glab config, and glab applies it. Read it, never
hardcode a URL:

```sh
glab config get subfolder --host <host>   # e.g. "gitlab" for https://example.com/gitlab/
glab config get api_host --host <host>    # e.g. "example.com:8443"
glab auth status --hostname <host>        # prints the resolved REST endpoint
```

## Write

Prefer `glab` subcommands; they set the right defaults.

```sh
glab mr create --fill --target-branch <base> -R <project>
glab mr note <iid> -R <project> -m "message"
glab issue note <iid> -R <project> -m "message"
glab issue close <iid> -R <project>
```

Through the API, text belongs in `--raw-field` (commas and quotes survive) and
array parameters belong in the query string, which GitLab reads for `PUT` too:

```sh
glab api --hostname <host> --method POST --raw-field "body=Looks good" \
  "projects/group%2Fapp/merge_requests/12/notes"
glab api --hostname <host> --method PUT \
  "projects/group%2Fapp/issues/7?assignee_ids[]=24"
```

## GitLab vocabulary that changes behavior

- Merge request, never pull request. Close an issue from an MR description with
  `Closes #7` (`Fixes #7` is GitHub-only and does nothing on GitLab).
- States are `opened`, `closed`, `merged`, `locked`; draft is a separate flag,
  set by a `Draft:` title prefix.
- `iid` is the per-project number a human quotes; `id` is the instance-wide id
  the API also accepts. Always pass `iid` to the endpoints above.
- Mergeability lives in `detailed_merge_status` (`mergeable`, `need_rebase`,
  `ci_must_pass`, …), not in a boolean.
- CI is a pipeline of jobs. A `manual` or `skipped` job is not a failure.
- Approvals replace reviews: `approvals_left` is the gate to watch.

## Do not

- Do not push, comment, approve, merge, or close anything the user did not ask
  for. Reviewing means reporting findings.
- Do not run `glab auth login` — the plugin reports an unauthenticated host and
  the user fixes it.
