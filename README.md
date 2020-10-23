# Dota Hero Hunt

The source code for <https://dotaherohunt.com>.

## Project Setup

You need to have `node js`, along with `npm` or `yarn` installed on your computer. Then, clone this repository and run `npm i` in the root directory. You will also need to create a `.env` file with the following contents:

```bash
REACT_APP_CDN_URL=https://cdn.dotaherohunt.com/
REACT_APP_PEER_JS_HOST=localhost
REACT_APP_PEER_JS_PATH=/myapp
REACT_APP_PEER_JS_PORT=9000
```

You can now start the React development server at `npm start`.

## Running the backend

You will also need to run a local instance of peer js when developing. If you have docker installed on your machine, you can run peer js with the following command:
```bash
docker run -p 9000:9000 peerjs/peerjs-server
```

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## License

Dota Hero Hunt is licensed under the GNU Affero General Public License. See `LICENSE` and `COPYING.md` in the root of this repository.

![image](https://www.gnu.org/graphics/agplv3-with-text-162x68.png)

## Contact

You can reach me via <hello@michaelsong.me>
