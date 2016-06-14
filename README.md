
[![Build Status](https://travis-ci.org/ka-sh/DQQABwAACgYJCgwCBA8JBg.svg?branch=master)](https://travis-ci.org/ka-sh/DQQABwAACgYJCgwCBA8JBg)
##Currency Rate worker

####ABOUT
This is a POC of building worker services that consume requests for getting conversion currency rates.

Currently support the following currencies only:

['USD', 'AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK',
'GBP', 'HKD', 'HRK', 'HUF', 'IDR', 'ILS', 'INR', 'JPY',
'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON',
'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'ZAR', 'EUR']

####Requirements
Node v4.2.1

mongodb

[beanstalkd](http://kr.github.io/beanstalkd/)

####How to use?

1- Configure beanstalkd server and ports in the config.json.


2- node index to start a worker instance.

Note: you can start more than one worker instance to help reduce the load.

#####Any Carrots ?

: )  OF-COURSE !!!!

######server_status

continuously printing server status to monitor no of jobs consumed, produced,deleted...

```
node server_status  
```
######cleanerService

Nop not the French one!!. purge all jobs on beanstalkd server submitted on bs_tube <check config.json>

```
node cleanerService
```
Note: after you are finished you need to CTRL+C, I know ugly but does the job.

######Producer

Continuously generating random requests every 10 sec for fetching conversion rates, and submit them to bs_tube <check config.json>

```
node producer
```
