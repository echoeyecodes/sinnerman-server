"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_singleton_1 = __importDefault(require("../utils/pool.singleton"));
const sequelize_1 = require("sequelize");
const sequelize_2 = require("sequelize");
const Video_1 = __importDefault(require("./Video"));
const Tag_1 = __importDefault(require("./Tag"));
const instance = pool_singleton_1.default.getInstance();
class Video_Tags extends sequelize_2.Model {
}
Video_Tags.init({
    videoId: {
        type: sequelize_1.DataTypes.UUID,
        references: {
            model: Video_1.default,
            key: 'id'
        }
    },
    tagId: {
        type: sequelize_1.DataTypes.UUID,
        references: {
            model: Tag_1.default,
            key: 'id'
        }
    },
}, {
    sequelize: instance,
    modelName: "video_tags",
    tableName: 'video_tags',
    timestamps: true,
    createdAt: true,
    updatedAt: true
});
exports.default = Video_Tags;
