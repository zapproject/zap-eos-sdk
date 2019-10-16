"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const eos_registry_1 = require("@zapjs/eos-registry");
const eos_bondage_1 = require("@zapjs/eos-bondage");
const eos_arbiter_1 = require("@zapjs/eos-arbiter");
const eos_dispatch_1 = require("@zapjs/eos-dispatch");
const eos_tokendotfactory_1 = require("@zapjs/eos-tokendotfactory");
class Provider {
    constructor({ account, node }) {
        this._account = account;
        this._node = node;
        this._zap_account = node.getZapAccount();
        this.registry = new eos_registry_1.Regsitry({
            account: this._account,
            node
        });
        this.bondage = new eos_bondage_1.Bondage({
            account: this._account,
            node
        });
        this.arbiter = new eos_arbiter_1.Arbiter({
            account: this._account,
            node
        });
        this.dispatch = new eos_dispatch_1.Dispatch({
            account: this._account,
            node
        });
        this.tokenDotFactory = new eos_tokendotfactory_1.TokenDotFactory({
            // @ts-ignore
            account: this._account,
            // @ts-ignore
            node
        });
        this.title = '';
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._node.connect();
        });
    }
    setTitle(title) {
        this.title = title;
    }
    getTitle() {
        return this.title;
    }
    getAccount() {
        return this._account;
    }
    getNode() {
        return this._node;
    }
    initiateProvider(title, public_key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.registry.initiateProvider(title, public_key);
        });
    }
    addEndpoint(endpoint_specifier, functions, broker) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.registry.addEndpoint(endpoint_specifier, functions, broker);
        });
    }
    setParams(endpoint, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.registry.setParams(endpoint, params);
        });
    }
    queryProviderList(from, to, limit = -1) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.registry.queryProviderList(from, to, limit);
        });
    }
    queryProviderEndpoints(from, to, limit = -1) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.registry.queryProviderEndpoints(from, to, limit);
        });
    }
    queryIssued(from, to, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.bondage.queryIssued(from, to, limit);
        });
    }
    unsubscribeProvider(subscriber, endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.arbiter.unsubscribeProvider(subscriber, endpoint);
        });
    }
    querySubscriptions(from, to, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.arbiter.querySubscriptions(this.getAccount().name, from, to, limit);
        });
    }
    respond(id, params, subscriber) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.dispatch.respond(id, params, subscriber);
        });
    }
    queryQueriesInfo(from, to, limit, indexType) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.dispatch.queryQueriesInfo(from, to, limit, indexType);
        });
    }
    queryParams(from, to, limit = -1, index) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.registry.queryParams(from, to, limit, index);
        });
    }
    tokenCurveInit(name, endpoint, functions, maximum_supply) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.tokenDotFactory.tokenCurveInit(name, endpoint, functions, maximum_supply);
        });
    }
    getTokenProviders(lower_bound, upper_bound, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.tokenDotFactory.getTokenProviders(lower_bound, upper_bound, limit);
        });
    }
    getProviderTokens(lower_bound, upper_bound, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.tokenDotFactory.getProviderTokens(lower_bound, upper_bound, limit);
        });
    }
}
exports.Provider = Provider;
