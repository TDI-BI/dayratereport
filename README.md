This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

idk how to unbind vercel from the github so just ignore that its throwing errors, everything works lol

INITIAL SETUP
1)  confirm you have both node.js and node package manager installed
    -   npm -v
    -   node -v
2)  clone the repository
4)  navigate to your directory in command line
3)  set up dependencies
    -   npm install
5)  if neccecary, follow instructions in your command line to audit and repair vaunerabilities
6)  if neccecary, set up your mysql database (see later item)
7)  modify @/utils/getPort.tsx @/utils/connectToDb.tsx @/utils/fetchboth.tsx to reflect your local development enviorment

DEVELOPMENT
-    npm run dev -> localhost:3000
-    npm run dev_live -> localhost:8080, our live port

these enviorments refresh as you save making them ideal for development, however the live inturpretation/compiling of your code causes them to operate slowly.

SHIPPING / DEPLOYING:
1)  build/compile the code using the npm inturpreter
        npm run build
2)  run the compiled code in a forked process
        pm2 start deploy.json
3)  wait a few seconds then check to ensure that there have been no errors in our task
        pm2 list

you will need to create a weekly cron task for /scripts/check_then_curl.sh or domestic users will not have periods update
this is linux only now, but it shuoldnt be too hard to write something simmilar for another os maybe

if you had a version running before 9/30/24 there is an api/updatedb to help migrate tracking foreign vs domestic from day to users

DATABASE
the only other dependency you have to set up is our database, I am using mariadb. formatted as follows:
-   dayratereport
- -     users
- - -       username    varchar(255)
- - -       password    varchar(255)
- - -       uid         varchar(255)
- - -       email       varchar(255)
- - -       isAdmin     varchar(255)
- - -       lastConfirm varchar(255)
- - -       isdomestic  tinyint(1)
- -     days
- - -       uid         varchar(255)
- - -       day         varchar(255)
- - -       ship        varchar(255)
- - -       username    varchar(255)
- - -       type        varchar(255)
- -     msgs 
- - -       msg varchar(255)
- -     logs
- - -       email       varchar(255)
- - -       date        varchar(255)
- - -       request     text
- - -       type        varchar(255)
- -     periodstarts
- - -       id          int auto_increment
- - -       date        varchar(50)

icon masterlist @ https://ionic.io/ionicons