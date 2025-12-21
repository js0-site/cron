# GitHub Action External Trigger Guide

## CNAME Flattening Background

CNAME Flattening is a DNS technique that points domains to other domains while solving the limitation that root domains cannot directly use CNAME records. This technology is crucial for:

- **CDN Acceleration**: Distributing website traffic to global nodes for improved access speed
- **Load Balancing**: Distributing traffic across multiple servers for higher availability
- **Service Migration**: Smoothly switching backend services with minimal downtime
- **Failover Recovery**: Quickly switching to backup services to ensure business continuity

Since DNS record changes take time to propagate globally, CNAME flattening services need to **run frequently at short intervals** to:
- Ensure records are updated promptly to avoid service interruptions
- Monitor domain resolution status for rapid fault response
- Synchronize DNS records across multiple providers for consistency

## Overview

GitHub Actions' built-in cron jobs experience execution delays, with 5-minute interval tasks running only about once every half hour. This guide explains how to achieve precise scheduled triggers using the external service [cron-job.org](https://cron-job.org), ensuring CNAME flattening services execute on time.

## Solution

Use [cron-job.org](https://cron-job.org) to externally trigger GitHub Actions, ensuring timely task execution.

---

## Preparation Steps

### Step 1: Configure Workflow File

Ensure your GitHub Actions file supports API triggering.

**File Location:** `.github/workflows/cname_flatten.yml`

Add the `workflow_dispatch:` trigger to the `on:` section:

```yaml
name: CNAME Flatten
on:
  workflow_dispatch:      # ← Must add this line
  push:                   # Optional
    branches: [ main ]
  schedule:               # Optional (as backup)
    - cron: '*/5 * * * *'

jobs:
  # ... rest of your code
```

### Step 2: Create Access Token

1. Visit [GitHub Token Settings](https://github.com/settings/tokens/new)
2. **Note**: Fill in `Cron Job Token`
3. **Select scopes**:
   - **Public repository**: Check `public_repo` and `workflow`
   - **Private repository**: Check `repo` and `workflow`
4. Click **Generate token** and copy the generated token (save as `NEW_TOKEN`)

---

## Configure [cron-job.org](https://cron-job.org)

### Basic Settings

Log in to [cron-job.org Console](https://console.cron-job.org/jobs/create):

| Setting | Value |
|---------|-------|
| **Title** | `Trigger cname_flatten` |
| **URL** | `https://api.github.com/repos/js0-site/cron/actions/workflows/cname_flatten.yml/dispatches` |
| **Execution Schedule** | `Every 5 minutes` (or custom frequency)|

### Advanced Settings (Critical Steps)

#### Request Method
Select **`POST`** (default is GET, must be changed)

#### Request Headers
Click `Add Header` to add the following three headers:

| Key | Value | Description |
|-----|-------|-------------|
| `Authorization` | `token NEW_TOKEN` | Note the space between `token` and the key |
| `Accept` | `application/vnd.github.v3+json` | Required |
| `User-Agent` | `cron-job` | Required to prevent blocking |

#### Request Body
- **Type**: Select **`JSON`**
- **Content**:
```json
{
  "ref": "main"
}
```
> Note: If your default branch is not `main`, modify the `ref` value above

---

## Testing & Verification

1. Click **Create Job** at the bottom of the page
2. Click **Test** or **Run Now** in the job list to test
3. **Expected Results**:
   - **Cron-job**: Returns status code `204` (success, no content)
   - **GitHub**: New workflow run appears in repository's Actions page

---

## Troubleshooting

| Error Code | Possible Causes | Solutions |
|------------|----------------|-----------|
| **404 Not Found** | Incorrect repo name, insufficient token permissions, wrong workflow filename | Check repo name, verify token permissions, validate filename |
| **401 Unauthorized** | Incorrect token or header format | Check token format `token <KEY>` |
| **422 Unprocessable Entity** | Missing `workflow_dispatch:`, non-existent branch name | Confirm YAML configuration, check branch name |