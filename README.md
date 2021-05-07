# Slapfiliate

Slapfiliate is a lightweight application designed to handle Tapfiliate payouts
via PayPal.  To keep the footprint small, it was built without scheduling
capabilities and is meant to be run via cronjob or task scheduler.

## What it does

Running the application will:

- Query tapfiliate for outstanding affiliate balances
- If a pay floor is established, filter out affiliates with balances less than
  the pay floor
- Retrieve payout methods for each affiliate with a balance (currently only
  supports PayPal)
- If the number of potential payouts exceeds 15,000 (PayPal's batch payment
  limit), prioritize the highest balances and discard the
  remainder
- Post a batch payment to PayPal
- Post payment information back to Tapfiliate

## How it works

Slapfiliate is paranoid and will fail as early as possible (prior to posting
batch payments) instead of half-completing jobs.  If the environment is not set
to production (`NODE_ENV=production`), slapfiliate will inject sandbox accounts
to prevent actual payouts from being created in PayPal (though, these balances
will still be posted to Tapfiliate).  With no `NODE_ENV` set, slapfiliate will
default to `development`.

## Setup

1. First install nodejs with `sudo apt install nodejs` on Debian-based systems
   (alternatively, check out https://nodejs.org/en/download/ for other
   installation options).
2. Pull the repository down to your local machine by cloning the repository.
  - By [installing git](https://github.com/git-guides/install-git) and running:
    `cd /opt/ && git clone https://github.com/iangoodnight/slapfiliate.git`
  - Or using cUrl with:
    `curl -L https://github.com/iangoodnight/slapfiliate/archive/master.zip > \
    slapfiliate.tar.gz && tar -zxvf slapfiliate.tar.gz`
3. Install dependencies with `cd slapfiliate/ && npm install` for the entire
   package, or with `cd slapfiliate/ && npm install --production` to install the
   package without development dependencies.
4. Set your secret keys using `.env.example` and filling in the missing values.
5. Rename `.env.example` with `mv .env.example .env`.
6. If you have installed the entire package (with devDependencies) you can test
   your installation with `npm test`.
7. If everything looks right, you can run the application with `npm start`.
8. Logs will be mailed to the email address provided in the `.env` file.

## Creating a cronjob

1. Grant the 'execute' permission to the root of slapfiliate:
  `sudo chmod +x /opt/slapfiliate/index.js`
2. Setup your crontab with the command:
  `crontab -e`
3. Crontab uses the syntax `m h dom mon dow command` referring to `minute`,
   `hour`, `day of month`, `month`, and `day of week` respectively with `*`
   actiing as a wildcard for 'any'.  Occasionally, the relative paths called
   from node programs don't play nice with cronjobs, so we are going to start
   our <command> by changing directories to the root of slapfiliate.  So, if we
   wanted to run our script once a week our crontab entry might look like:
   `0 5 * * 1 cd /opt/slapfiliate/ && NODE_ENV=production ./index.js`

In the example above, we are setting the `NODE_ENV` directly as part of the
command itself.  The `NODE_ENV` can be set throught the `.env` file as well, but
in any cases where it is not set, slapfiliate will default to `development`.
Especially in testing, it is best practice to leave this environmental variable
set to `development` and to explicitly override it when calling the script.
This helps to keep erroneous payments from going out during setup or
troubleshooting.  By default, the output from cronjobs goes to `/var/mail/`, but
you can override this by redirecting the output as part of the command. So the
crontab entry:
`0 5 * * 1 cd /opt/slapfiliate/ && NODE_ENV=production ./index.js > ./run.log`
Runs the program in the `production` environment, and saves the output from that
last job to the file `/opt/slapfiliate/run.log` for review.
