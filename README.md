# 2048

## Instructions

1. [Install Yarn](https://yarnpkg.com/en/docs/install).

2. Install packages:

```
yarn
```

3. Start dev server:

```shell
./node_modules/.bin/webpack-dev-server
```

Emoji data comes from here: https://github.com/iamcal/emoji-data


🔵


Loader is from here: https://github.com/webpack-contrib/css-loader


## snabbdom

Apparently if a class changes on a vnode, that vnode will be removed and replaced. To change classes on a vnode while persisting that node, you apparently have to use the `classes` module.

See [this issue](https://github.com/snabbdom/snabbdom/issues/106).
