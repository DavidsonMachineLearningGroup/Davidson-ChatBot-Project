//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
"use strict";
const request = require("request");
const utils_1 = require("../utils");
const settings_1 = require("./settings");
const HttpStatus = require("http-status-codes");
const ResponseTypes = require("../types/responseTypes");
const responseTypes_1 = require("../types/responseTypes");
const emulator_1 = require("./emulator");
const log = require("./log");
const utils = require("../utils");
const serverSettingsTypes_1 = require("../types/serverSettingsTypes");
const moment = require("moment");
/**
 * Stores and propagates conversation messages.
 */
class Conversation {
    constructor(botId, conversationId, user) {
        // the list of activities in this conversation
        this.activities = [];
        this.members = [];
        this.botId = botId;
        this.conversationId = conversationId;
        this.members.push({ id: botId, name: "Bot" });
        this.members.push({ id: user.id, name: user.name });
    }
    getCurrentUser() {
        const users = settings_1.getSettings().users;
        let currentUser = users.usersById[users.currentUserId];
        // TODO: This is a band-aid until state system cleanup
        if (!currentUser) {
            currentUser = serverSettingsTypes_1.usersDefault.usersById['default-user'];
            settings_1.dispatch({
                type: 'Users_SetCurrentUser',
                state: {
                    user: currentUser
                }
            });
        }
        return currentUser;
    }
    postage(recipientId, activity) {
        const date = moment();
        activity.id = activity.id || utils_1.uniqueId();
        activity.channelId = 'emulator';
        activity.timestamp = date.toISOString();
        activity.localTimestamp = date.format();
        activity.recipient = { id: recipientId };
        activity.conversation = { id: this.conversationId };
    }
    /**
     * Sends the activity to the conversation's bot.
     */
    postActivityToBot(activity, recordInConversation, cb) {
        // Do not make a shallow copy here before modifying
        this.postage(this.botId, activity);
        activity.from = this.getCurrentUser();
        if (!activity.recipient.name) {
            activity.recipient.name = "Bot";
        }
        const settings = settings_1.getSettings();
        const bot = settings.botById(this.botId);
        if (bot) {
            // bypass ngrok url for localhost because ngrok will rate limit
            // (if the user has asked for this behaviour)
            if (settings.framework.bypassNgrokLocalhost && utils.isLocalhostUrl(bot.botUrl))
                activity.serviceUrl = emulator_1.emulator.framework.localhostServiceUrl;
            else
                activity.serviceUrl = emulator_1.emulator.framework.serviceUrl;
            let options = {
                url: bot.botUrl,
                method: "POST",
                json: activity,
                agent: emulator_1.emulator.proxyAgent,
                strictSSL: false
            };
            let responseCallback = (err, resp, body) => {
                let messageActivity = activity;
                let text = messageActivity.text || '';
                if (text && text.length > 50)
                    text = text.substring(0, 50);
                if (err) {
                    log.error('->', log.makeInspectorLink("POST", activity), err.message);
                }
                else if (resp) {
                    if (!/^2\d\d$/.test(`${resp.statusCode}`)) {
                        log.error('->', log.makeInspectorLink("POST", activity), log.makeInspectorLink(`${resp.statusCode}`, body, `(${resp.statusMessage})`), `[${activity.type}]`, text);
                        if (Number(resp.statusCode) == 401 || Number(resp.statusCode) == 402) {
                            log.error("Error: The bot's MSA appId or password is incorrect.");
                            log.error(log.botCredsConfigurationLink('Edit your bot\'s MSA info'));
                        }
                        cb(err, resp ? resp.statusCode : undefined);
                    }
                    else {
                        log.info('->', log.makeInspectorLink("POST", activity), log.makeInspectorLink(`${resp.statusCode}`, body, `(${resp.statusMessage})`), `[${activity.type}]`, text);
                        if (recordInConversation) {
                            this.activities.push(Object.assign({}, activity));
                        }
                        cb(null, resp.statusCode, activity.id);
                    }
                }
            };
            if (!utils.isLocalhostUrl(bot.botUrl) && utils.isLocalhostUrl(emulator_1.emulator.framework.serviceUrl)) {
                log.error('Error: The bot is remote, but the callback URL is localhost. Without tunneling software you will not receive replies.');
                log.error(log.makeLinkMessage('Connecting to bots hosted remotely', 'https://aka.ms/cnjvpo'));
                log.error(log.ngrokConfigurationLink('Edit ngrok settings'));
            }
            if (bot.msaAppId && bot.msaPassword) {
                this.authenticatedRequest(options, responseCallback);
            }
            else {
                request(options, responseCallback);
            }
        }
        else {
            cb("bot not found");
        }
    }
    sendConversationUpdate(membersAdded, membersRemoved) {
        const activity = {
            type: 'conversationUpdate',
            membersAdded,
            membersRemoved
        };
        this.postActivityToBot(activity, false, () => { });
    }
    /**
     * Queues activity for delivery to user.
     */
    postActivityToUser(activity) {
        const settings = settings_1.getSettings();
        // Make a shallow copy before modifying & queuing
        activity = Object.assign({}, activity);
        this.postage(settings.users.currentUserId, activity);
        const botId = activity.from.id;
        if (!activity.from.name) {
            activity.from.name = "Bot";
        }
        this.activities.push(activity);
        return ResponseTypes.createResourceResponse(activity.id);
    }
    // updateActivity with replacement
    updateActivity(updatedActivity) {
        // if we found the activity to reply to
        let oldActivity = this.activities.find((val) => val.id == updatedActivity.id);
        if (oldActivity) {
            Object.assign(oldActivity, updatedActivity);
            return ResponseTypes.createResourceResponse(updatedActivity.id);
        }
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, responseTypes_1.ErrorCodes.BadArgument, "not a known activity id");
    }
    deleteActivity(id) {
        // if we found the activity to reply to
        let index = this.activities.findIndex((val) => val.id == id);
        if (index >= 0) {
            this.activities.splice(index, 1);
            return;
        }
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, responseTypes_1.ErrorCodes.BadArgument, "The activity id was not found");
    }
    // add member
    addMember(id, name) {
        name = name || `user-${utils_1.uniqueId(4)}`;
        id = id || utils_1.uniqueId();
        let user = { name, id };
        this.members.push(user);
        this.sendConversationUpdate([user], undefined);
        return user;
    }
    removeMember(id) {
        let index = this.members.findIndex((val) => val.id == id);
        if (index >= 0) {
            this.members.splice(index, 1);
        }
        this.sendConversationUpdate(undefined, [{ id, name: undefined }]);
    }
    sendContactAdded() {
        const activity = {
            type: 'contactRelationUpdate',
            action: 'add'
        };
        this.postActivityToBot(activity, false, () => { });
    }
    sendContactRemoved() {
        const activity = {
            type: 'contactRelationUpdate',
            action: 'remove'
        };
        this.postActivityToBot(activity, false, () => { });
    }
    sendTyping() {
        const activity = {
            type: 'typing'
        };
        this.postActivityToBot(activity, false, () => { });
    }
    sendPing() {
        const activity = {
            type: 'ping'
        };
        this.postActivityToBot(activity, false, () => { });
    }
    sendDeleteUserData() {
        const activity = {
            type: 'deleteUserData'
        };
        this.postActivityToBot(activity, false, () => { });
    }
    /**
     * Returns activities since the watermark.
     */
    getActivitiesSince(watermark) {
        return this.activities.slice(watermark);
    }
    authenticatedRequest(options, callback, refresh = false) {
        if (refresh) {
            this.accessToken = null;
        }
        this.addAccessToken(options, (err) => {
            if (!err) {
                request(options, (err, response, body) => {
                    if (!err) {
                        switch (response.statusCode) {
                            case HttpStatus.UNAUTHORIZED:
                            case HttpStatus.FORBIDDEN:
                                if (!refresh) {
                                    this.authenticatedRequest(options, callback, true);
                                }
                                else {
                                    callback(null, response, body);
                                }
                                break;
                            default:
                                if (response.statusCode < 400) {
                                    callback(null, response, body);
                                }
                                else {
                                    let txt = "Request to '" + options.url + "' failed: [" + response.statusCode + "] " + response.statusMessage;
                                    callback(new Error(txt), response, null);
                                }
                                break;
                        }
                    }
                    else {
                        callback(err, null, null);
                    }
                });
            }
            else {
                callback(err, null, null);
            }
        });
    }
    getAccessToken(cb) {
        if (!this.accessToken || new Date().getTime() >= this.accessTokenExpires) {
            const bot = settings_1.getSettings().botById(this.botId);
            // Refresh access token
            let opt = {
                method: 'POST',
                url: settings_1.v30AuthenticationSettings.tokenEndpoint,
                form: {
                    grant_type: 'client_credentials',
                    client_id: bot.msaAppId,
                    client_secret: bot.msaPassword,
                    scope: settings_1.v30AuthenticationSettings.tokenScope
                },
                agent: emulator_1.emulator.proxyAgent,
                strictSSL: false
            };
            request(opt, (err, response, body) => {
                if (!err) {
                    if (body && response.statusCode < 300) {
                        // Subtract 5 minutes from expires_in so they'll we'll get a
                        // new token before it expires.
                        let oauthResponse = JSON.parse(body);
                        this.accessToken = oauthResponse.access_token;
                        this.accessTokenExpires = new Date().getTime() + ((oauthResponse.expires_in - 300) * 1000);
                        cb(null, this.accessToken);
                    }
                    else {
                        cb(new Error('Refresh access token failed with status code: ' + response.statusCode), null);
                    }
                }
                else {
                    cb(err, null);
                }
            });
        }
        else {
            cb(null, this.accessToken);
        }
    }
    addAccessToken(options, cb) {
        const bot = settings_1.getSettings().botById(this.botId);
        if (bot.msaAppId && bot.msaPassword) {
            this.getAccessToken((err, token) => {
                if (!err && token) {
                    options.headers = {
                        'Authorization': 'Bearer ' + token
                    };
                    cb(null);
                }
                else {
                    cb(err);
                }
            });
        }
        else {
            cb(null);
        }
    }
}
exports.Conversation = Conversation;
/**
 * A set of conversations with a bot.
 */
class ConversationSet {
    constructor(botId) {
        this.conversations = [];
        this.botId = botId;
    }
    newConversation(user, conversationId) {
        const conversation = new Conversation(this.botId, conversationId || utils_1.uniqueId(), user);
        this.conversations.push(conversation);
        return conversation;
    }
    conversationById(conversationId) {
        return this.conversations.find(value => value.conversationId === conversationId);
    }
}
/**
 * Container for conversations.
 */
class ConversationManager {
    constructor() {
        this.conversationSets = [];
        settings_1.addSettingsListener((settings) => {
            this.configure(settings);
        });
        this.configure(settings_1.getSettings());
    }
    /**
     * Applies configuration changes.
     */
    configure(settings) {
        // Remove conversations that reference nonexistent bots.
        const deadBotIds = this.conversationSets.filter(set => !settings.bots.find(bot => bot.botId === set.botId)).map(conversation => conversation.botId);
        this.conversationSets = this.conversationSets.filter(set => !deadBotIds.find(botId => set.botId === botId));
    }
    /**
     * Creates a new conversation.
     */
    newConversation(botId, user, conversationId) {
        let conversationSet = this.conversationSets.find(value => value.botId === botId);
        if (!conversationSet) {
            conversationSet = new ConversationSet(botId);
            this.conversationSets.push(conversationSet);
        }
        let conversation = conversationSet.newConversation(user, conversationId);
        return conversation;
    }
    /**
     * Gets the existing conversation, or returns undefined.
     */
    conversationById(botId, conversationId) {
        const set = this.conversationSets.find(set => set.botId === botId);
        if (set) {
            return set.conversationById(conversationId);
        }
    }
}
exports.ConversationManager = ConversationManager;
//# sourceMappingURL=conversationManager.js.map