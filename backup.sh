#!/usr/bin/env bash
timestamp=$(date +%s)
API_URL=https://content.dropboxapi.com/2/files/upload
MACHINE_ID=$1
API_TOKEN=$2
FILE=$3
UPLOAD_FILENAME=$4

if [ -z "$4" ]
  then
    UPLOAD_FILENAME="adopisoft-backup-$timestamp.zip"
fi

curl -X POST $API_URL --header "Authorization: Bearer $API_TOKEN" --header "Dropbox-API-Arg: {\"path\": \"/AdoPiSoft/$MACHINE_ID/$UPLOAD_FILENAME\",\"mode\": \"add\",\"autorename\": true,\"mute\": false,\"strict_conflict\": false}" --header "Content-Type: application/octet-stream" --data-binary @$FILE