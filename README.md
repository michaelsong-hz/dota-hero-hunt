# Dota Hero Hunt

The source code for [dotaherohunt.com](https://dotaherohunt.com).

## Project Setup

You need to have `node js`, along with `npm` or `yarn` installed on your computer. Then, clone this repository and run `npm i` in the root directory. You will also need to create a `.env` file with the following contents:

```bash
REACT_APP_VERSION=$npm_package_version
REACT_APP_CDN_URL=https://cdn.dotaherohunt.com/
REACT_APP_PEER_JS_HOST=localhost
REACT_APP_PEER_JS_PATH=/myapp
REACT_APP_PEER_JS_PORT=9000
```

You can now start the React development server using `npm start`.

## Running the backend

You will also need to run a local instance of peer js when developing. If you have docker installed on your machine, you can run peer js with the following command:
You will also need to run a local instance of peer js when developing. There are two ways of running peer js:

### Option 1: Native (with Node JS)

1. Install the package globally:

```bash
npm install peer -g
```

2. Run the server:

```bash
peerjs --port 9000 --key peerjs --path /myapp
```

### Option 2: Docker

```bash
docker run -p 9000:9000 peerjs/peerjs-server
```

## License

Dota Hero Hunt is licensed under the GNU Affero General Public License. See `NOTICE` and `LICENSE.md` in the root of this repository.

![image](https://www.gnu.org/graphics/agplv3-with-text-162x68.png)

## Contact

You can reach me at <hello@michaelsong.me>.

## Deployment

All commits pushed to GitHub on any branch, as well as any PRs will be automatically deployed by Cloudflare Pages to `https://*.dota-hero-hunt.pages.dev/`.

All commits to the `production` branch are automatically deployed to `dotaherohunt.com`, and all new deployments should be versioned.

```bash
npm version 1.0.0 -m "Bump version to %s"
```
