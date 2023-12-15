# Image Generation with AWS Wickr using Amazon Bedrock and the Stable Diffusion XL model

This sample will allow you to deploy a Generative AI text-to-image bot to your AWS Wickr network. It uses Amazon Bedrock and the Stable Diffusion XL model. 

## Prerequisites and limitations

## Prerequisites

- Access to Amazon Bedrock, and the **stability.stable-diffusion-xl-v1** model enabled 
- An existing AWS Wickr bot username and password
- A supported host with Docker CE installed. This repo was tested on Ubuntu 22.04
- IAM credentials configured on the host in the `~/.aws/config` and `~/.aws/credentials` file (see [here](https://docs.aws.amazon.com/cli/latest/reference/configure/) for details). The user must have the following IAM policy at a minimum (update with your Bedrock region):
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel"
            ],
            "Resource": [
                "arn:aws:bedrock:<region>::foundation-model/stability.stable-diffusion-xl-v1"
            ]
        }
    ]
}
```

## Limitations

This bot will store sent voice-memos on the host where the bot is running, inside the `/opt/WickrIO/clients/<username>/attachments/` directory. To periodically delete these, you could configure a crontab with the following entry to delete data when it is older than 1 day: `0 0 * * * /usr/bin/find /opt/WickrIO/clients/stable-diffusion_bot/attachments/ -name "*" -type f -mtime +1 -exec rm -f {} \;`

## Installation

1. Clone this repo and then enter the directory.
2. Confirm you are within the repo directory, then zip and compress the contents: `tar czvf software.tar.gz *`. This will leave you with a file called `software.tar.gz`
3. Create the bot folder: `sudo mkdir /opt/WickrIO`
4. Copy this file to /opt/WickrIO: `sudo cp software.tar.gz /opt/WickrIO/`
5. Start the WickrIO container with the following command: `docker run -v /home/ubuntu/.aws:/home/wickriouser/.aws -v /opt/WickrIO:/opt/WickrIO --restart=always --name="stable-diffusion_bot" -ti public.ecr.aws/x3s2s6k3/wickrio/bot-cloud:latest`
6. You will now be at the command line within the bot.

## Configuration

1. Select `yes` if you wish see welcome message on startup
2. Enter `add` when prompted to enter a command
3. Enter the bot username and password when prompted
4. Select `yes` to auto-login
5. When asked to **Enter the bot configuration to use**, enter `import`
6. When asked for the location, enter `/opt/WickrIO`
7. Enter `stable-diffusion_bot` for the integration name

The bot will now install.

8. Enter your Amazon Bedrock region and credential profile when asked
9. When you see **Successfully added record to the database!**, enter `start` and then provide the password when prompted
10. Type `list` to see the status of the bot, it should say **Running** after a few seconds
11. Send a message to the bot!

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
