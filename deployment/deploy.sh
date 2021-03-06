#!/bin/bash

# ----------------------
# KUDU Deployment Script
# Version: 1.0.17
# ----------------------

# Helpers
# -------

exitWithMessageOnError () {
  if [ ! $? -eq 0 ]; then
    echo "An error has occurred during web site deployment."
    echo $1
    exit 1
  fi
}

# Prerequisites
# -------------

# Verify node.js installed
hash node 2>/dev/null
exitWithMessageOnError "Missing node.js executable, please install node.js, if already installed make sure it can be reached from current environment."

# Setup
# -----

#SCRIPT_DIR="${BASH_SOURCE[0]%\\*}"
SCRIPT_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
echo $SCRIPT_DIR
SCRIPT_DIR="${SCRIPT_DIR%/*}"
echo $SCRIPT_DIR
ARTIFACTS=$SCRIPT_DIR/../artifacts
KUDU_SYNC_CMD=${KUDU_SYNC_CMD//\"}

if [[ ! -n "$DEPLOYMENT_SOURCE" ]]; then
  DEPLOYMENT_SOURCE=$SCRIPT_DIR
fi

if [[ ! -n "$NEXT_MANIFEST_PATH" ]]; then
  NEXT_MANIFEST_PATH=$ARTIFACTS/manifest

  if [[ ! -n "$PREVIOUS_MANIFEST_PATH" ]]; then
    PREVIOUS_MANIFEST_PATH=$NEXT_MANIFEST_PATH
  fi
fi

if [[ ! -n "$DEPLOYMENT_TARGET" ]]; then
  DEPLOYMENT_TARGET=$ARTIFACTS/wwwroot
else
  KUDU_SERVICE=true
fi

if [[ ! -n "$KUDU_SYNC_CMD" ]]; then
  # Install kudu sync
  echo Installing Kudu Sync
  npm install kudusync -g --silent
  exitWithMessageOnError "npm failed"

  if [[ ! -n "$KUDU_SERVICE" ]]; then
    # In case we are running locally this is the correct location of kuduSync
    KUDU_SYNC_CMD=kuduSync
  else
    # In case we are running on kudu service this is the correct location of kuduSync
    KUDU_SYNC_CMD=$APPDATA/npm/node_modules/kuduSync/bin/kuduSync
  fi
fi

# Node Helpers
# ------------

selectNodeVersion () {
  if [[ -n "$KUDU_SELECT_NODE_VERSION_CMD" ]]; then
    SELECT_NODE_VERSION="$KUDU_SELECT_NODE_VERSION_CMD \"$DEPLOYMENT_SOURCE\" \"$DEPLOYMENT_TARGET\" \"$DEPLOYMENT_TEMP\""
    eval $SELECT_NODE_VERSION
    exitWithMessageOnError "select node version failed"

    if [[ -e "$DEPLOYMENT_TEMP/__nodeVersion.tmp" ]]; then
      NODE_EXE=`cat "$DEPLOYMENT_TEMP/__nodeVersion.tmp"`
      exitWithMessageOnError "getting node version failed"
    fi
    
    if [[ -e "$DEPLOYMENT_TEMP/__npmVersion.tmp" ]]; then
      NPM_JS_PATH=`cat "$DEPLOYMENT_TEMP/__npmVersion.tmp"`
      exitWithMessageOnError "getting npm version failed"
    fi

    if [[ ! -n "$NODE_EXE" ]]; then
      NODE_EXE=node
    fi

    NPM_CMD="\"$NODE_EXE\" \"$NPM_JS_PATH\""
  else
    NPM_CMD=npm
    NODE_EXE=node
  fi
}

##################################################################################################################################
# Deployment
# ----------

# echo Handling node.js deployment.

# # 1. KuduSync
# if [[ "$IN_PLACE_DEPLOYMENT" -ne "1" ]]; then
#   "$KUDU_SYNC_CMD" -v 50 -f "$DEPLOYMENT_SOURCE" -t "$DEPLOYMENT_TARGET" -n "$NEXT_MANIFEST_PATH" -p "$PREVIOUS_MANIFEST_PATH" -i ".git;.hg;.deployment;deploy.sh"
#   exitWithMessageOnError "Kudu Sync failed"
# fi

# # 2. Select node version
# selectNodeVersion

# # 3. Install npm packages
# if [ -e "$DEPLOYMENT_TARGET/package.json" ]; then
#   cd "$DEPLOYMENT_TARGET"
#   echo "Running $NPM_CMD install --production"
#   #eval $NPM_CMD install --production
#   eval $NPM_CMD install 
#   exitWithMessageOnError "npm failed"
#   cd - > /dev/null
# fi


#Deployment
echo Handling node.js deployment, running on .cmd .
# 1. Select node version
echo Selecting NodeVersion
#selectNodeVersion
#NPM_CMD="node /opt/nodejs/10.14.1/bin/npm"
NPM_CMD="npm"
#call :SelectNodeVersion

# 1. KuduSync
echo Running KuduSync
if [[ "$IN_PLACE_DEPLOYMENT" -ne "1" ]]; then
  "$KUDU_SYNC_CMD" -v 50 -f "$DEPLOYMENT_SOURCE/pizzachain-api" -t "$DEPLOYMENT_TARGET" -n "$NEXT_MANIFEST_PATH" -p "$PREVIOUS_MANIFEST_PATH" -i ".git;.hg;.deployment;deploy.sh"
  exitWithMessageOnError "Kudu Sync failed"
fi

# Web.config for client side routing
if [ -e "$DEPLOYMENT_SOURCE/web.config" ]; then
  cp "$DEPLOYMENT_SOURCE/web.config" "$DEPLOYMENT_TARGET"
  echo Web.config Copied
fi

# 2. Install npm packages
echo Installing NPM Packages
if [ -e "$DEPLOYMENT_TARGET/package.json" ]; then
  cd "$DEPLOYMENT_TARGET"
  echo Clearing node node_modules
  eval rm -rf node_modules
  echo "Running $NPM_CMD install"
  #eval $NPM_CMD install --production
  eval $NPM_CMD install --supress-warnings
  exitWithMessageOnError "npm failed"
  cd - > /dev/null
fi

# 3. Installing truflle 
echo Installing Truffle 
if [ -e "$DEPLOYMENT_SOURCE/truffle" ]; then
  #mkdir -p "$DEPLOYMENT_TARGET/truffle"
  rm -rf "$DEPLOYMENT_TARGET/truffle"
  cp -R "$DEPLOYMENT_SOURCE/truffle" "$DEPLOYMENT_TARGET"
  echo Truffle Folder Copied
  cd "$DEPLOYMENT_TARGET/truffle"
  #eval $NPM_CMD install -g truffle@5.0.31
  echo Clearing node node_modules
  eval rm -rf node_modules
  echo "Running Truffle $NPM_CMD install at $DEPLOYMENT_TARGET/truffle"
  eval $NPM_CMD install --supress-warnings
  echo Compiling contracts
  eval rm -rf build/
  ./node_modules/.bin/truffle compile --quiet
  echo Migrating contracts
  ./node_modules/.bin/truffle migrate --reset --network pcvm
fi

cd "$DEPLOYMENT_TARGET"
eval mkdir -p images/qr-codes

# 4. App
# echo App work
# if [ -e "$DEPLOYMENT_TARGET" ]; then
#   cd "$DEPLOYMENT_TARGET"
#   echo "Starting App in $DEPLOYMENT_TARGET"
#   eval $NPM_CMD start
#   cd - > /dev/null
# fi

##################################################################################################################################
echo "Finished successfully."
