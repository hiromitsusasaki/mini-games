# mini-games

Tiny web games. Each game is a self-contained folder and gets published via GitHub Pages.

## Dev

- Add a new game scaffold:
  ```bash
  npm run new -- --name my-game
  ```

- Build all games into `public/` (the GitHub Pages publish directory):
  ```bash
  npm run build
  ```

- Serve locally:
  ```bash
  npm run dev
  ```

## Deploy

Push to `main` and GitHub Actions publishes to GitHub Pages.
