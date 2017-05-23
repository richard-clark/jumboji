# Jumboji

A web application for generating large, emoji versions of... other emoji.

![wave](https://cloud.githubusercontent.com/assets/6880453/26338740/74bb6894-3f50-11e7-8cb4-8641fc043817.png)

## Development

1. [Install Yarn](https://yarnpkg.com/en/docs/install).

2. Install packages:

```
yarn
```

3. Start the Webpack development server:

```shell
./node_modules/.bin/webpack-dev-server --env dev
```

## Building

For compatibility with GitHub, production assets are stored in the `docs/` directory. The compiled files in this directory should be committed to the repository.

To compile (after following the steps in Developing), run:

```
./node_modules/.bin/webpack -p --env prod
```

(Note that CSS styles are applied by `bundle.js`.)
