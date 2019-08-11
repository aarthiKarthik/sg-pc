# Assets-Swarm Microservice Installation

## Swarm node

For this code to run, you need a working Swarm node, serving its API on *localhost:8500*. You can install Swarm on Linux/Mac using the instructions in http://swarm-guide.readthedocs.io/en/latest/
If you have a Windows box then installing the Mist Browser should give you Swarm (but also consider your life choices carefully).

If you install Swarm in the path so that you can bring up the node with the command `$swarm` then you can use the `./swarm-up` script in the repo to stand up a temporary singleton node, and `./swarm-kill` to remove it (this won't work on Windows).

You can also run with leveldb but this is deprecated.  In this case, however, there is nothing to install; leveldb is packaged with the code.

Geth is not required, but it does no harm and the `swarm-up` script expects it to be installed.

## Assets-Swarm API server

clone the repo then do:

```
$cd assets-swarm
$npm install
```
then to check the install (This only works on a Mac or Linux because it uses a shell script.  If you are using Windows then run the tests in `test/` individually using Mocha):

`$npm test` (this will fail if Swarm isn't running)

The application can be started thusly:

`$node src/restapi.js --swarm`

As an alternative, one can also run the application with the Leveldb backend.  Just miss out the swarm option:
`$node src/restapi.js`

This will use leveldb rather than swarm.  It starts it's own leveldb instance, so there is nothing to fire up beforehand.  In this case, the data is of course only held locally (in a file in the asset directory).

(obviously, use `\` for Windows)
