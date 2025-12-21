[English](#en) | [中文](#zh)

---

<a id="en"></a>

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

---

## About

This project is an open-source component of [js0.site ⋅ Refactoring the Internet Plan](https://js0.site).

We are redefining the development paradigm of the Internet in a componentized way. Welcome to follow us:

* [Google Group](https://groups.google.com/g/js0-site)
* [js0site.bsky.social](https://bsky.app/profile/js0site.bsky.social)

---

<a id="zh"></a>

# GitHub Action 外部触发配置指南

## CNAME 拉平背景

CNAME 拉平（CNAME Flattening）是一种 DNS 技术，用于将域名指向另一个域名，同时解决根域名不能直接使用 CNAME 记录的限制。这项技术对于以下场景至关重要：

- **CDN 加速**：将网站流量分发到全球节点，提升访问速度
- **负载均衡**：在多个服务器间分配流量，提高可用性
- **服务迁移**：平滑切换后端服务，减少停机时间
- **故障恢复**：快速切换到备用服务，确保业务连续性

由于 DNS 记录的变更需要时间在全球传播，CNAME 拉平服务需要短时间定期运行来：
- 确保记录及时更新，避免服务中断
- 监控域名解析状态，快速响应故障
- 同步多个服务商的 DNS 记录，保持一致性

## 概述

GitHub Actions 的内置定时任务（cron）存在运行延迟问题，5分钟间隔的任务平均半小时才执行一次。本指南介绍如何通过外部服务 [cron-job.org](https://cron-job.org) 实现精确的定时触发，确保 CNAME 拉平服务能够按时执行。

## 解决方案

使用 [cron-job.org](https://cron-job.org) 外部触发 GitHub Actions，确保按时执行任务。

---

## 准备步骤

### 第一步：配置 Workflow 文件

确保您的 GitHub Actions 文件支持 API 触发。

**文件位置：** `.github/workflows/cname_flatten.yml`

在 `on:` 部分添加 `workflow_dispatch:` 触发器：

```yaml
name: CNAME Flatten
on:
  workflow_dispatch:      # ← 必须添加此行
  push:                   # 可选
    branches: [ main ]
  schedule:               # 可选（作为备用）
    - cron: '*/5 * * * *'

jobs:
  # ... 其余代码
```

### 第二步：创建访问令牌

1. 访问 [GitHub Token Settings](https://github.com/settings/tokens/new)
2. **Note（备注）**：填写 `Cron Job Token`
3. **Select scopes（权限选择）**：
   - **公开仓库**：勾选 `public_repo` 和 `workflow`
   - **私有仓库**：勾选 `repo` 和 `workflow`
4. 点击 **Generate token** 并复制生成的令牌（记作 `NEW_TOKEN`）

---

## 配置 [cron-job.org](https://cron-job.org)

### 基本设置

登录 [cron-job.org Console](https://console.cron-job.org/jobs/create)：

| 设置项 | 值 |
|--------|-----|
| **Title** | `Trigger cname_flatten` |
| **URL** | `https://api.github.com/repos/js0-site/cron/actions/workflows/cname_flatten.yml/dispatches` |
| **Execution Schedule** | `Every 5 minutes`（或自定义频率）|

### 高级设置（关键步骤）

#### 请求方法
选择 **`POST`**（默认为 GET，必须修改）

#### 请求头
点击 `Add Header` 添加以下三个请求头：

| Key | Value | 说明 |
|-----|-------|------|
| `Authorization` | `token NEW_TOKEN` | 注意 `token` 和密钥间的空格 |
| `Accept` | `application/vnd.github.v3+json` | 必填 |
| `User-Agent` | `cron-job` | 必填，防止被拦截 |

#### 请求体
- **Type**：选择 **`JSON`**
- **Content**：
```json
{
  "ref": "main"
}
```
> 提示：如果默认分支不是 `main`，请修改上述 `ref` 值

---

## 测试验证

1. 点击 cron-job.org 页面底部的 **Create Job**。
2. 在任务列表中点击 **Test** 或 **Run Now** 进行测试
3. **预期结果**：
   - **Cron-job**：返回状态码 `204`（成功，无内容）
   - **GitHub**：仓库的 Actions 页面出现新的工作流运行记录

---

## 故障排除

| 错误代码 | 可能原因 | 解决方案 |
|----------|----------|----------|
| **404 Not Found** | 仓库名错误、Token 权限不足、Workflow 文件名错误 | 检查仓库名、确认 Token 权限、验证文件名 |
| **401 Unauthorized** | Token 错误或 Header 格式不正确 | 检查 Token 格式 `token <KEY>` |
| **422 Unprocessable Entity** | 缺少 `workflow_dispatch:`、分支名不存在 | 确认 YAML 配置、检查分支名称 |

---

## 关于

本项目为 [js0.site ⋅ 重构互联网计划](https://js0.site) 的开源组件。

我们正在以组件化的方式重新定义互联网的开发范式，欢迎关注：

* [谷歌邮件列表](https://groups.google.com/g/js0-site)
* [js0site.bsky.social](https://bsky.app/profile/js0site.bsky.social)
