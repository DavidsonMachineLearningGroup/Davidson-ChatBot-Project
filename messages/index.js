/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var cognitiveservices = require ("botbuilder-cognitiveservices")

var devmode  = 'debugWithEmulator'; // options are 'prod' 'debugWithEmulator' 'debugWithSlack'

/*var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({*/
if (devmode == 'prod')
{
    var connector = new botbuilder_azure.BotServiceConnector({    
        appId: process.env['MicrosoftAppId'], 
        appPassword: process.env['MicrosoftAppPassword'], 
        stateEndpoint: process.env['BotStateEndpoint'],
        openIdMetadata: process.env['BotOpenIdMetadata']
    });
}
else if (devmode == 'debugWithSlack')
{
    require('dotenv').load();
    var connector = new builder.ChatConnector({    
        appId: process.env['MicrosoftAppId'], 
        appPassword: process.env['MicrosoftAppPassword'], 
        stateEndpoint: process.env['BotStateEndpoint'],
        openIdMetadata: process.env['BotOpenIdMetadata']
    });
}
else if (devmode == 'debugWithEmulator')
{
    var connector = new builder.ChatConnector();
}
else 
{
    console.log('Invalid devmode ' + devmode);
    process.exit (1);
}

var bot = new builder.UniversalBot(connector);
var recognizer = new cognitiveservices.QnAMakerRecognizer({
	knowledgeBaseId: process.env['knowledgeBaseId'],
	subscriptionKey: process.env['subscriptionKey'],
	top: 3});

var qnaMakerTools = new cognitiveservices.QnAMakerTools();
bot.library(qnaMakerTools.createLibrary());

var basicQnAMakerDialog = new cognitiveservices.QnAMakerDialog({
	recognizers: [recognizer],
	defaultMessage: 'No match to your question! My master should add an answer to our FAQ.',
	qnaThreshold: 0.3,
	feedbackLib: qnaMakerTools
});

bot.dialog('FAQ_QnA', basicQnAMakerDialog);
//bot.dialog('/', basicQnAMakerDialog);
bot.dialog('/', [
    function (session, args, next) {
        if (/^faq /i.test (session.message.text) == true)
        {
            session.message.text = session.message.text.replace (/^faq /i, '');
            session.send('Looking up FAQ question: %s', session.message.text);
///            session.beginDialog (basicQnAMakerDialog)
//            session.beginDialog('/profile');
            console.log(session.message.text);
            session.beginDialog ('FAQ_QnA');
        } else {
            next();
        }
    },
//    function (session, results) {
//        session.send('Hello %s!', session.userData.name);
//    }
]);


/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
/*
.onDefault((session) => {
//   session.send('Sorry, I did not understand you \'%s\'.', session.message.text);
});
*/


// originally from https://github.com/Microsoft/BotBuilder-Samples/tree/master/Node/core-GetConversationMembers
var userStore = [];
// Push address where there is new users to greet.
bot.on('conversationUpdate', function (message) {
    if (message.membersAdded && message.membersAdded.length > 0) 
    {
        var membersAdded = message.membersAdded
            .map(function (m) {
                // Don't add for bot joining event
                if(m.id === message.address.bot.id)
                    return;
                return (m.name) || '' + ' (Id: ' + m.id + ')';
            })
            .join(', ');

        // If blank, then only the bot was added. Don't greet yourself bot that's weird
        if (membersAdded)
        {
            var channelName = message.address.conversation.name || 'awesome';
            bot.send(new builder.Message()
                .address(message.address)
                .text('Welcome ' + membersAdded + ' to our ' + channelName + ' channel.  If you don\'t mind I\'ll ask you a few questions. (full disclosure: I\'m just a bot trying to facalitate introductions!)'));
        }
    }
});

// Every 5 seconds, check for new registered users and start a new dialog
setInterval(function () {
    var newAddresses = userStore.splice(0);
    newAddresses.forEach(function (address) {

        console.log('Starting survey for address:', address);
        bot.beginDialog(address, 'survey', null, function (err) {
            if (err) {
                // error ocurred while starting new conversation. Channel not supported?
                bot.send(new builder.Message()
                    .text('This channel does not support this operation: ' + err.message)
                    .address(address));
            }
        });
    });
}, 5000);


bot.dialog('survey', [
    function (session) {
        builder.Prompts.text(session, 'First, what do you want group members to call you?');
    },
    function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.text(session, 'Hi ' + results.response + ', What\'s your favorite programming language and how long have you been coding (if at all!)?');
    },
    function (session, results) {
        session.userData.coding = results.response;
        builder.Prompts.choice(session, 'So glad you joined us then.  What interests you most about joining our group?', ['Presentations', 'Hands on Projects', 'Study Groups', 'Networking']);
    },
    function (session, results) {
        session.userData.interests = results.response.entity;
        builder.Prompts.text(session, 'Glad you are most interested in: ' + results.response.entity + '!  Last question I promise.  Tell us something cool about yourself (cool programming project, amazing vacation, if you\'re in school, favorite food, etc.)');
    },
    function (session, results) {
        session.userData.somethingcool = results.response;
        session.send ('That\'s super.  Welcome!!  Make sure to checkout our other channels such as #dml_chatbot (for bot development), #studygroups, #kaggle (for help with data science competitions), ...')
        session.endDialog ()
//        builder.Prompts.text(session, 'That\'s super.  Welcome!!');
    }
]);


if (devmode != 'prod') {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}

