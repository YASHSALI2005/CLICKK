@echo off
:loop
echo Syncing S3 bucket to local folder at %date% %time%
aws s3 sync s3://neweverbucketcreated "D:/major project/CLICK/server/projects/demo/"
echo Waiting 60 seconds before next sync...
timeout /t 60
goto loop 