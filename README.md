# Miniops

<p float="left">
  <img src="./coverage/branches.svg">
  <img src="./coverage/functions.svg">
  <img src="./coverage/lines.svg">
  <img src="./coverage/statements.svg">
</p>


<p align="center">
  <img src="./.assets/logo.png" width=200 ></img>
</p>



A little and friendly buddy to help you in your devops automations.

## requirements

- A  hello world  of your favourite language in a git repository

- Git
  - For windows users https://git-scm.com/download/win
  - For linux users I don't need to explain it

- SSH for git
  - COnfigure the ss keys of your favourite git platform (github, bitbucket, gitlab, etc)

- Nodejs
  - For windows users https://nodejs.org/en/download
  - For linux users I don't need to explain it

- pm2

```
npm install -g pm2
```

- miniops tool

```
git clone https://github.com/usil/miniops.git -b 1.0.0-snapshot
```

## Yaml

Similar to the yaml of gitlab, bitbucket, github actions, etc we need to create a valid yaml. You could use one of these

https://github.com/usil/miniops/wiki/Yaml-templates_


## Run - Windows

```
set cron_expression=*/15 * * * * *
set git_url=https://github.com/usil/asp-classic-hello-world.git
set git_branch=develop
set yaml_location=C:\foo\bar\acme.yaml

npm install
npm run pm2:polling
```

## Run - Linux

```
export cron_expression="*/15 * * * * *"
export git_url=https://github.com/foo/java-web-hello-world.git
export git_branch=develop
export yaml_location=/foo/bar/acme.yaml

npm install
npm run pm2:polling
```

## Logs

```
pm2 flush miniops
pm2 logs miniops
```

## Delete

```
pm2 delete miniops
```

## Update

To try another version:

- delete it

```
pm2 delete miniops
```

- clone or pull
- start again

## References

https://betterstack.com/community/guides/scaling-nodejs/pm2-guide/


## Acknowledgments

- https://easydrawingguides.com/how-to-draw-bob-the-minion/
- https://www.textstudio.com/logo/minions-411

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