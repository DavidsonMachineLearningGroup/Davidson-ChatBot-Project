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
const HttpStatus = require("http-status-codes");
const ResponseTypes = require("../../../types/responseTypes");
const log = require("../../log");
const responseTypes_1 = require("../../../types/responseTypes");
const jsonBodyParser_1 = require("../../jsonBodyParser");
const settings_1 = require("../../settings");
class BotStateController {
    constructor() {
        this.botDataStore = {};
        // Get USER Data
        this.getUserData = (req, res, next) => {
            try {
                const activeBot = settings_1.getSettings().getActiveBot();
                if (!activeBot) {
                    throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, responseTypes_1.ErrorCodes.BadArgument, "bot not found");
                }
                const botData = this.getBotData(activeBot.botId, req.params.channelId, req.params.conversationId, req.params.userId);
                res.send(HttpStatus.OK, botData);
                res.end();
                log.api('getUserData', req, res, req.params, botData);
            }
            catch (err) {
                var error = ResponseTypes.sendErrorResponse(req, res, next, err);
                log.api('getUserData', req, res, req.params, error);
            }
        };
        // Get Conversation Data
        this.getConversationData = (req, res, next) => {
            try {
                const activeBot = settings_1.getSettings().getActiveBot();
                if (!activeBot) {
                    throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, responseTypes_1.ErrorCodes.BadArgument, "bot not found");
                }
                const botData = this.getBotData(activeBot.botId, req.params.channelId, req.params.conversationId, req.params.userId);
                res.send(HttpStatus.OK, botData);
                res.end();
                log.api('getConversationData', req, res, req.params, botData);
            }
            catch (err) {
                var error = ResponseTypes.sendErrorResponse(req, res, next, err);
                log.api('getConversationData', req, res, req.params, error);
            }
        };
        // Get PrivateConversation Data
        this.getPrivateConversationData = (req, res, next) => {
            try {
                const activeBot = settings_1.getSettings().getActiveBot();
                if (!activeBot) {
                    throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, responseTypes_1.ErrorCodes.BadArgument, "bot not found");
                }
                const botData = this.getBotData(activeBot.botId, req.params.channelId, req.params.conversationId, req.params.userId);
                res.send(HttpStatus.OK, botData);
                res.end();
                log.api('getPrivateConversationData', req, res, req.params, botData);
            }
            catch (err) {
                var error = ResponseTypes.sendErrorResponse(req, res, next, err);
                log.api('getPrivateConversationData', req, res, req.params, error);
            }
        };
        // Set User Data
        this.setUserData = (req, res, next) => {
            let botData;
            try {
                const activeBot = settings_1.getSettings().getActiveBot();
                if (!activeBot) {
                    throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, responseTypes_1.ErrorCodes.BadArgument, "bot not found");
                }
                botData = this.setBotData(activeBot.botId, req.params.channelId, req.params.conversationId, req.params.userId, req.body);
                res.send(HttpStatus.OK, botData);
                res.end();
                log.api('setUserData', req, res, { key: req.params, state: req.body }, botData);
            }
            catch (err) {
                var error = ResponseTypes.sendErrorResponse(req, res, next, err);
                log.api('setUserData', req, res, { key: req.params, state: req.body }, error);
            }
        };
        // set conversation data
        this.setConversationData = (req, res, next) => {
            try {
                const activeBot = settings_1.getSettings().getActiveBot();
                if (!activeBot) {
                    throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, responseTypes_1.ErrorCodes.BadArgument, "bot not found");
                }
                const botData = this.setBotData(activeBot.botId, req.params.channelId, req.params.conversationId, req.params.userId, req.body);
                res.send(HttpStatus.OK, botData);
                res.end();
                log.api('setConversationData', req, res, { key: req.params, state: req.body }, botData);
            }
            catch (err) {
                var error = ResponseTypes.sendErrorResponse(req, res, next, err);
                log.api('setConversationData', req, res, { key: req.params, state: req.body }, error);
            }
        };
        // set private conversation data
        this.setPrivateConversationData = (req, res, next) => {
            try {
                const activeBot = settings_1.getSettings().getActiveBot();
                if (!activeBot) {
                    throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, responseTypes_1.ErrorCodes.BadArgument, "bot not found");
                }
                const botData = this.setBotData(activeBot.botId, req.params.channelId, req.params.conversationId, req.params.userId, req.body);
                res.send(HttpStatus.OK, botData);
                res.end();
                log.api('setPrivateConversationData', req, res, { key: req.params, state: req.body }, botData);
            }
            catch (err) {
                var error = ResponseTypes.sendErrorResponse(req, res, next, err);
                log.api('setPrivateConversationData', req, res, { key: req.params, state: req.body }, error);
            }
        };
        // delete state for user
        this.deleteStateForUser = (req, res, next) => {
            try {
                const activeBot = settings_1.getSettings().getActiveBot();
                if (!activeBot) {
                    throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, responseTypes_1.ErrorCodes.BadArgument, "bot not found");
                }
                let keys = Object.keys(this.botDataStore);
                let userPostfix = `!${req.params.userId}`;
                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i];
                    if (key.startsWith(`${activeBot.botId}!`) && key.endsWith(`!${req.params.userId}`)) {
                        delete this.botDataStore[key];
                    }
                }
                res.send(HttpStatus.OK);
                res.end();
                log.api('deleteStateForUser', req, res, req.params, null);
            }
            catch (err) {
                var error = ResponseTypes.sendErrorResponse(req, res, next, err);
                log.api('deleteStateForUser', req, res, req.params, error);
            }
        };
    }
    botDataKey(botId, channelId, conversationId, userId) {
        return `${botId || '*'}!${channelId || '*'}!${conversationId || '*'}!${userId || '*'}`;
    }
    getBotData(botId, channelId, conversationId, userId) {
        const key = this.botDataKey(botId, channelId, conversationId, userId);
        return this.botDataStore[key] || {
            data: null, eTag: '*'
        };
    }
    setBotData(botId, channelId, conversationId, userId, incomingData) {
        const key = this.botDataKey(botId, channelId, conversationId, userId);
        let oldData = this.botDataStore[key];
        if (oldData && oldData.eTag && (oldData.eTag.length > 0) && (incomingData.eTag != '*') && (oldData.eTag != incomingData.eTag)) {
            throw ResponseTypes.createAPIException(HttpStatus.PRECONDITION_FAILED, responseTypes_1.ErrorCodes.BadArgument, "The data is changed");
        }
        let newData = {
            eTag: new Date().getTime().toString(),
            data: incomingData.data
        };
        if (!incomingData.data) {
            delete this.botDataStore[key];
            newData.eTag = '*';
        }
        else {
            this.botDataStore[key] = newData;
        }
        return newData;
    }
    static registerRoutes(server, auth) {
        let controller = new BotStateController();
        server.router.get('/v3/botstate/:channelId/users/:userId', auth.verifyBotFramework, controller.getUserData);
        server.router.get('/v3/botstate/:channelId/conversations/:conversationId', auth.verifyBotFramework, controller.getConversationData);
        server.router.get('/v3/botstate/:channelId/conversations/:conversationId/users/:userId', auth.verifyBotFramework, controller.getPrivateConversationData);
        server.router.post('/v3/botstate/:channelId/users/:userId', [auth.verifyBotFramework], jsonBodyParser_1.jsonBodyParser(), [controller.setUserData]);
        server.router.post('/v3/botstate/:channelId/conversations/:conversationId', [auth.verifyBotFramework], jsonBodyParser_1.jsonBodyParser(), [controller.setConversationData]);
        server.router.post('/v3/botstate/:channelId/conversations/:conversationId/users/:userId', [auth.verifyBotFramework], jsonBodyParser_1.jsonBodyParser(), [controller.setPrivateConversationData]);
        server.router.del('/v3/botstate/:channelId/users/:userId', auth.verifyBotFramework, controller.deleteStateForUser);
    }
}
exports.BotStateController = BotStateController;
//# sourceMappingURL=botStateController.js.map