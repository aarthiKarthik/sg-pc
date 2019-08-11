#!/bin/bash

# Working directory
cd /tmp

# Preparation
DATADIR=/tmp/BZZ/`date +%s`
mkdir -p $DATADIR
echo "secret" > $DATADIR/my-password
echo
GOPATH=$(which geth)
BZZKEY=$($GOPATH --datadir $DATADIR --password $DATADIR/my-password account new | awk -F"{|}" '{print $2}')

echo "Your account is ready: "$BZZKEY

# Now run swarm in the background
swarm \
    --bzzaccount $BZZKEY \
    --datadir $DATADIR \
    --ens-api '' \
    --verbosity 6 \
    --maxpeers 0 \
    --bzznetworkid 322 \
    &> $DATADIR/swarm.log < <(cat $DATADIR/my-password) &


echo "swarm is running in the background, you can check its logs at "$DATADIR"/swarm.log"

# Cleaning up
# You need to perform this feature manually
# USE THESE COMMANDS AT YOUR OWN RISK!
##
# kill -9 $(ps aux | grep swarm | grep bzzaccount | awk '{print $2}')
# kill -9 $(ps aux | grep geth | grep datadir | awk '{print $2}')
# rm -rf /tmp/BZZ
