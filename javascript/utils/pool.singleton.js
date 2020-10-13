"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Pool_singleton = (function () {
    let sequelize;
    function getClient() {
        return __awaiter(this, void 0, void 0, function* () {
            sequelize = new sequelize_1.Sequelize({ dialect: 'postgres', host: process.env.DB_HOST, port: parseInt(`${process.env.POSTGRES_PORT}`), password: process.env.POSTGRES_PASSWORD, database: process.env.POSTGRES_DB, username: process.env.POSTGRES_USERNAME });
            try {
                yield Promise.all([sequelize.authenticate(), sequelize.sync({ alter: true })]);
            }
            catch (error) {
                throw new Error(`Couldn't connect to database. Reason: ${error}`);
            }
        });
    }
    return {
        getInstance: function () {
            if (!sequelize) {
                getClient();
            }
            return sequelize;
        }
    };
})();
exports.default = Pool_singleton;
