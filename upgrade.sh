#!/bin/sh
if [ $# -ne 2 ]
  then
    echo "Usage: upgrade.sh <OLD_BOT_LOCATION> <NEW_BOT_LOCATION>"
    exit 1
fi
export OLD_BOT_LOCATION=$1
export NEW_BOT_LOCATION=$2

cd $OLD_BOT_LOCATION
cp -f client_bot_username.txt processes.json $NEW_BOT_LOCATION

cd ..
rm -rf bedrock-image-gen_bot.old_Version
mv bedrock-image-gen_bot bedrock-image-gen_bot.old_version

cd $NEW_BOT_LOCATION/..
mv $NEW_BOT_LOCATION bedrock-image-gen_bot
