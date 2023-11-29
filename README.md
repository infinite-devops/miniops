# Tiny Devops

<p float="left">
  <img src="./.coverage/branches.svg">
  <img src="./.coverage/functions.svg">
  <img src="./.coverage/lines.svg">
  <img src="./.coverage/statements.svg">
</p>

A little buddy to help you inyour devops process

## requirements

- Nodejs
  - For windows users https://nodejs.org/en/download
  - For linux users I don't need to explain it

- Pm2

```
npm install -g pm2
```

- Validate the pm2

```
pm2 --version
```

- Clone this repository

## Run

```
set GIT_URL=http://192.168.0.66:6000/asp-wacala.git
set GIT_BRANCH=develop
set YAML_LOCATION=C:\foo\bar\real_001.yaml
npm run init
```

## Logs

```
pm2 logs devops
```

## Delete

```
pm2 delete devops
```

## References

https://betterstack.com/community/guides/scaling-nodejs/pm2-guide/


## Contributors

<table>
  <tbody>    
    <td>
      <img src="https://avatars0.githubusercontent.com/u/3322836?s=460&v=4" width="100px;"/>
      <br />
      <label><a href="http://jrichardsz.github.io/">JRichardsz</a></label>
      <br />
    </td>
  </tbody>
</table>