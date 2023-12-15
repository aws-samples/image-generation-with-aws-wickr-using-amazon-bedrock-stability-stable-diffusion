// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const WickrIOAPI = require('wickrio_addon');
const WickrIOBotAPI = require('wickrio-bot-api');
const util = require('util')
const logger = require('wickrio-bot-api').logger
const { fromIni } = require('@aws-sdk/credential-providers');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime')
const { v4: uuidv4 } = require('uuid');

console.log = function () {
  logger.info(util.format.apply(null, arguments))
}
console.error = function () {
  logger.error(util.format.apply(null, arguments))
}

var fs = require('fs');

module.exports = WickrIOAPI;
process.stdin.resume(); // so the program will not close instantly
var bot;


async function exitHandler(options, err) {
  try {
    var closed = await bot.close();
    console.log(closed);
    if (err) {
      console.log("Exit Error:", err);
      process.exit();
    }
    if (options.exit) {
      process.exit();
    } else if (options.pid) {
      process.kill(process.pid);
    }
  } catch (err) {
    console.log(err);
  }
}

//catches ctrl+c and stop.sh events
process.on('SIGINT', exitHandler.bind(null, {
  exit: true
}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {
  pid: true
}));
process.on('SIGUSR2', exitHandler.bind(null, {
  pid: true
}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {
  exit: true
}));

/////////////////////////////////////

// Respond to user's input.
async function createResponse(message, vGroupID) {
  // setup the clients
  bot.processesJsonToProcessEnv()
  var tokens = JSON.parse(process.env.tokens)
  const REGION = tokens.AWS_REGION.value
  const profileName = tokens.AWS_PROFILENAME.value

  console.log('entered createResponse')

  const client = new BedrockRuntimeClient({
    region: REGION,
    credentials: fromIni({profile: profileName,}),
  });

  const body = JSON.stringify({
    text_prompts: [
      {
        text: message
      }
    ],
    cfg_scale: 20,
    steps: 30
  });
  
  const modelId = 'stability.stable-diffusion-xl-v1';
  
  const invokeOptions = {
    body,
    modelId,
    accept: '*/*',
    contentType: 'application/json'
  };

  const command = new InvokeModelCommand(invokeOptions);
  const response = await client.send(command);
  const decoded = JSON.parse(
    new TextDecoder().decode(response.body)
  );
  console.log('response');
  const filename = uuidv4() + '.jpeg';
  const filePath = `../../attachments/${filename}`
  console.log('filename is: ', filename)
  let buff = new Buffer.from(decoded.artifacts[0].base64, 'base64'); // added Buffer.from
  fs.writeFileSync(`../../attachments/${filename}`, buff);
  console.log('file written');
  console.log('file path is ', filePath)
  WickrIOAPI.cmdSendRoomAttachment(vGroupID, filename)
}

async function main() { // entry point
  logger.info('entering main')
  try {
    var status;
    if (process.argv[2] === undefined) {
      var bot_username = fs.readFileSync('client_bot_username.txt', 'utf-8');
      bot_username = bot_username.trim();
      bot = new WickrIOBotAPI.WickrIOBot();
      status = await bot.start(bot_username)
    } else {
      bot = new WickrIOBotAPI.WickrIOBot();
      status = await bot.start(process.argv[2])
    }
    if (!status) {
      exitHandler(null, {
        exit: true,
        reason: 'Client not able to start'
      });
    }

    await bot.startListening(listen); // passes a callback function that will receive incoming messages into the bot client
  } catch (err) {
    logger.error(err);
  }
}

async function listen(rMessage) { // starts a listener. Message payload accessible as 'message' 
  logger.info('entering listen')
  rMessage = JSON.parse(rMessage);
  var sender = rMessage.sender;
  var vGroupID = rMessage.vgroupid;
  var userArr = [];
  userArr.push(sender);
  if (rMessage.message) {
    var request = rMessage.message;

    console.log('calling createResponse()')
    await createResponse(request, vGroupID)
  }
}

main();
