GOPATH=$(which geth)
echo $GOPATH

export BZZKEY=$($GOPATH --password swarm-password.txt account new | awk -F"{|}" '{print $2}')

echo echo "Your account is ready: "$BZZKEY
