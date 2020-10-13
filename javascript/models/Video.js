"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_singleton_1 = __importDefault(require("../utils/pool.singleton"));
const sequelize_1 = require("sequelize");
const Comment_1 = __importDefault(require("./Comment"));
const Like_1 = __importDefault(require("./Like"));
const sequelize_2 = require("sequelize");
const UploadNotification_1 = __importDefault(require("./UploadNotification"));
const View_1 = __importDefault(require("./View"));
const Tag_1 = __importDefault(require("./Tag"));
const instance = pool_singleton_1.default.getInstance();
class Video extends sequelize_2.Model {
}
Video.init({
    title: {
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
    description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    video_url: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize: instance,
    modelName: "videos",
    tableName: 'videos',
    timestamps: true,
    createdAt: true,
    updatedAt: true
});
Video.hasMany(Comment_1.default, {
    foreignKey: "video_id"
});
Video.hasMany(Like_1.default, {
    foreignKey: "video_id"
});
Video.hasMany(UploadNotification_1.default, {
    foreignKey: "video_id"
});
Video.hasMany(View_1.default, {
    foreignKey: "video_id"
});
Comment_1.default.belongsTo(Video);
Like_1.default.belongsTo(Video);
View_1.default.belongsTo(Video);
Video.hasMany(UploadNotification_1.default);
UploadNotification_1.default.belongsTo(Video);
Video.belongsToMany(Tag_1.default, { through: "video_tags" });
Tag_1.default.belongsToMany(Video, { through: "video_tags" });
exports.default = Video;
