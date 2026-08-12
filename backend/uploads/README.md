# Uploads Directory

This directory stores runtime-generated media files for the backend service.

## Tracked in Git

- Folder structure only
- Placeholder files:
  - `domain-gallery/.gitkeep`
  - `domain-images/.gitkeep`

## Ignored in Git

All generated image binaries in the following folders are ignored:

- `backend/uploads/domain-gallery/`
- `backend/uploads/domain-images/`

This keeps the repository lightweight while preserving required directory structure for local development and deployment.
