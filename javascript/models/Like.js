"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_singleton_1 = __importDefault(require("../utils/pool.singleton"));
const sequelize_1 = require("sequelize");
const sequelize_2 = require("sequelize");
const instance = pool_singleton_1.default.getInstance();
class Like extends sequelize_2.Model {
}
Like.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        unique: true
    },
}, {
    sequelize: instance,
    modelName: "likes",
    tableName: 'likes',
    timestamps: true,
    createdAt: true,
    updatedAt: true
});
exports.default = Like;
