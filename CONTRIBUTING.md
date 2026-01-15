# Contributing to the project

This document defines the development workflow as established by the CICD pipeline.

---
## 🚀 Getting Started

Before you start working on the project, make sure to install dependencies and set up Git hooks:
```bash
npm install
```

This will:
- Install all project dependencies
- Set up Husky Git hooks automatically
- Configure commit message and branch name validation

**You only need to do this once** when you first clone the repository.

---

## 📌 General Guidelines

- Follow the project structure and naming conventions
- Keep commits small, clear, and focused
- Always link your commit to an issue or task when applicable
---

## 🌱 Branching Strategy

All branches must follow this naming convention:

`INITIALS/ISSUEID-description`

- `INITIALS` → Developer initials
- `ISSUEID` → Related **ISSUE ID** (see [Issues](/issues)) OR **OOS** (to precise that it is "**Out Of Scope**")
- `description` → Short, **kebab-case** description of the branch feature

**In case** the branching strategy has not been followed, you will not be able to publish your branch.

Rename your branch locally with (run this command on the branch that needs to be renamed):
```
git branch -m NEW_BRANCH_NAME
```

### Examples

`JB/12-add-api`

`TK/OOS-deploying-app`

`FE/12-ui-improvements`

---

## 📝 Commit Messages

No special attention needed for the commit messages.

**If the branch name follows the [branching strategy](#-branching-strategy)**, the commit message will automatically include the **issue id** or "OOS".