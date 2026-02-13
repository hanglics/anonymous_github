# Anonymous Github

**Acknownledgement**

*Thanks to <a href="https://github.com/tdurieux/anonymous_github" target="_blank">@tdurieux</a> for the amazing Anonmyous GitHub work, I was chasing a Conference deadline and I found that the <a href="https://anonymous.4open.science/" target="_blank">https://anonymous.4open.science/</a> does not work anymore, and the issues are piling up. So I decide to fix it and deploy one myself, and here we go.*

Anonymous Github is a system that helps anonymize Github repositories for double-anonymous paper submissions. A public instance of Anonymous Github is hosted at https://open-science.anonymous-github.xyz/.

![screenshot](https://user-images.githubusercontent.com/5577568/217193282-42f608d3-2b46-4ebc-90df-772f248605be.png)


Anonymous Github anonymizes the following:

- Github repository owner, organization, and name
- File and directory names
- File contents of all extensions, including markdown, text, Java, etc.

## Usage

### Public instance

**https://open-science.anonymous-github.xyz/**

### Own instance

You can run your own instance with Docker (recommended) or with Node.js directly.

#### Option A: Run with Docker (recommended)

**Prerequisites:** Docker and Docker Compose (or Docker Compose V2: `docker compose`).

1. **Clone the repository**

   ```bash
   git clone https://github.com/hanglics/anonymous_github.git
   cd anonymous_github
   ```

2. **Create a `.env` file** in the project root with at least:

   ```env
   GITHUB_TOKEN=<your_github_token>
   CLIENT_ID=<your_github_app_client_id>
   CLIENT_SECRET=<your_github_app_client_secret>
   PORT=5000
   AUTH_CALLBACK=http://localhost:5000/github/auth
   DB_USERNAME=admin
   DB_PASSWORD=<choose_a_secure_password>
   ```

   Optional: to expose the app on a different host port, add:

   ```env
   EXPOSED_PORT=5000
   ```

   The app will be available at `http://localhost:<EXPOSED_PORT>` (default 5000).

   - **GITHUB_TOKEN:** Create at https://github.com/settings/tokens/new with `repo` scope.
   - **CLIENT_ID** and **CLIENT_SECRET:** Create a GitHub OAuth App at https://github.com/settings/applications/new. Set the callback URL to `http://<your-host>:<port>/github/auth` (same as `AUTH_CALLBACK`).

3. **Build and start all services**

   The Compose file builds the app image locally (no pre-built image required). First run may take a few minutes to build.

   ```bash
   docker compose up -d
   ```

   Or with Docker Compose V1:

   ```bash
   docker-compose up -d
   ```

4. **Open the app**

   Go to http://localhost:5000 (or the port you set with `EXPOSED_PORT`). For production, put Anonymous GitHub behind a reverse proxy (e.g. nginx) to handle HTTPS.

**Exposing with nginx (HTTPS)**  

A sample nginx config for the domain `open-science.anonymous-github.xyz` is included: `nginx-open-science.anonymous-github.xyz.conf`. 

Copy it to your nginx `sites-available`, enable the site, reload nginx, then run `certbot --nginx -d open-science.anonymous-github.xyz` to get a Let's Encrypt certificate. 

In `.env`, set `AUTH_CALLBACK=https://open-science.anonymous-github.xyz/github/auth` and configure your GitHub OAuth App callback URL to match.

#### Option B: Run with Node.js (without Docker)

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/hanglics/anonymous_github.git
   cd anonymous_github
   npm install
   ```

2. Create a `.env` file as in Option A. Ensure MongoDB and Redis are running and set `DB_HOSTNAME` and `REDIS_HOSTNAME` if they are not on `localhost`.

3. Build and start:

   ```bash
   npm run build
   npm start
   ```

## What is the scope of anonymization?

In double-anonymous peer-review, the boundary of anonymization is the paper plus its online appendix, and only this, it's not the whole world. Googling any part of the paper or the online appendix can be considered as a deliberate attempt to break anonymity ([explanation](https://www.monperrus.net/martin/open-science-double-blind))

## How does it work?

Anonymous Github either downloads the complete repository and anonymizes the content of the file or proxies the request to GitHub. In both cases, the original and anonymized versions of the file are cached on the server.

## Related tools

[gitmask](https://www.gitmask.com/) is a tool to anonymously contribute to a Github repository.

[blind-reviews](https://github.com/zombie/blind-reviews/) is a browser add-on that enables a person reviewing a GitHub pull request to hide identifying information about the person submitting it.

## See also

- [Open-science and double-anonymous Peer-Review](https://www.monperrus.net/martin/open-science-double-blind)
- [ACM Policy on Double-Blind Reviewing](https://dl.acm.org/journal/tods/DoubleBlindPolicy)
