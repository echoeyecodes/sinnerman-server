"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_singleton_1 = __importDefault(require("../utils/pool.singleton"));
const sequelize_1 = require("sequelize");
const sequelize_2 = require("sequelize");
const instance = pool_singleton_1.default.getInstance();
class UploadNotification extends sequelize_2.Model {
}
UploadNotification.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        unique: true
    },
    is_read: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    thumbnail: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize: instance,
    modelName: "upload_notifications",
    tableName: 'upload_notifications',
    timestamps: true,
    createdAt: true,
    updatedAt: true
});
exports.default = UploadNotification;
