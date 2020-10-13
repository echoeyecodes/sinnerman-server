"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_singleton_1 = __importDefault(require("../utils/pool.singleton"));
const sequelize_1 = require("sequelize");
const Video_1 = __importDefault(require("./Video"));
const sequelize_2 = require("sequelize");
const Like_1 = __importDefault(require("./Like"));
const Comment_1 = __importDefault(require("./Comment"));
const UploadNotification_1 = __importDefault(require("./UploadNotification"));
const View_1 = __importDefault(require("./View"));
const instance = pool_singleton_1.default.getInstance();
class User extends sequelize_2.Model {
}
User.init({
    fullname: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        unique: true
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    profile_url: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: ""
    },
    is_verified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize: instance,
    modelName: "users",
    tableName: 'users',
    timestamps: true,
    createdAt: true,
    updatedAt: true
});
User.hasMany(Video_1.default, {
    foreignKey: "user_id"
});
User.hasMany(View_1.default, {
    foreignKey: "user_id"
});
User.hasMany(Like_1.default, {
    foreignKey: "user_id"
});
User.hasMany(Comment_1.default, {
    foreignKey: "user_id"
});
User.hasMany(UploadNotification_1.default, {
    foreignKey: "user_id"
});
UploadNotification_1.default.belongsTo(User);
Comment_1.default.belongsTo(User);
View_1.default.belongsTo(User);
Like_1.default.belongsTo(User);
Video_1.default.belongsTo(User);
exports.default = User;
