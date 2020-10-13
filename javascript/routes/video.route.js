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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const video_middleware_1 = require("../middlewares/video.middleware");
const generalRequestValidator_1 = __importDefault(require("../utils/generalRequestValidator"));
const formidable_1 = __importDefault(require("formidable"));
const cloudinary_config_1 = __importDefault(require("../config/cloudinary.config"));
const cloudinary_1 = require("cloudinary");
const publishers_1 = require("../pubsubs/publishers");
const video_controller_1 = __importDefault(require("../controllers/video.controller"));
const view_controller_1 = __importDefault(require("../controllers/view.controller"));
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const like_controller_1 = __importDefault(require("../controllers/like.controller"));
const video_tag_controller_1 = __importDefault(require("../controllers/video_tag.controller"));
const tag_controller_1 = __importDefault(require("../controllers/tag.controller"));
const sequelize_1 = require("sequelize");
const pool_singleton_1 = __importDefault(require("../utils/pool.singleton"));
const like_controller = new like_controller_1.default();
const tag_controller = new tag_controller_1.default();
const video_tag_controller = new video_tag_controller_1.default();
const video_controller = new video_controller_1.default();
const user_controller = new user_controller_1.default();
const view_controller = new view_controller_1.default();
const router = express_1.default.Router();
cloudinary_1.v2.config(cloudinary_config_1.default);
router.post("/", video_middleware_1.validateVideoRequest("add"), generalRequestValidator_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () { }));
function uploadImage(path) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            cloudinary_1.v2.uploader.upload_large(path, {
                folder: "videos",
                resource_type: "video",
                eager: [{ streaming_profile: "4k", format: "m3u8" }],
                eager_async: true,
            }, (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    });
}
router.post("/upload", video_middleware_1.validateVideoFields, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const form = new formidable_1.default.IncomingForm();
    const user_id = req.id;
    form.parse(req, (err, fields, files) => __awaiter(void 0, void 0, void 0, function* () {
        const transaction = yield pool_singleton_1.default.getInstance().transaction();
        try {
            console.log({ fields });
            if (err) {
                console.log({ err });
                return res.status(500).send("Could not load video. Please try again");
            }
            const payload = yield uploadImage(files.video.path);
            const video_url = payload.eager[0].secure_url;
            const { title, description, tags = '' } = fields;
            const parsed_tags = JSON.parse(tags);
            console.log({ video_url });
            const video = yield video_controller.create({
                title,
                description,
                video_url,
                user_id,
            }, { transaction });
            const tag_ids = yield Promise.all(parsed_tags.map((tag) => __awaiter(void 0, void 0, void 0, function* () {
                const [{ id }] = yield tag_controller.findOrCreate({
                    where: { name: tag },
                    defaults: { name: tag },
                    transaction
                });
                return id;
            })));
            if (tag_ids.length > 0) {
                yield Promise.all(tag_ids.map((tag) => __awaiter(void 0, void 0, void 0, function* () {
                    return yield video_tag_controller.findOrCreate({
                        where: {
                            [sequelize_1.Op.and]: [{ videoId: video.id }, { tagId: tag }]
                        },
                        defaults: { videoId: video.id, tagId: tag },
                        transaction
                    });
                })));
            }
            //Only send notification when transactions are successful
            transaction.afterCommit(() => __awaiter(void 0, void 0, void 0, function* () {
                yield publishers_1.uploadNotificationPublisher(video.id, video.video_url);
            }));
            yield transaction.commit();
            res.status(200).json(video);
        }
        catch (error) {
            console.log({ error });
            yield transaction.rollback();
            return res.status(500).send("An error occured during upload");
        }
    }));
}));
router.get("/:id", video_middleware_1.validateVideoRequest("one"), generalRequestValidator_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const payload = {};
    try {
        const video = yield video_controller.findOne({ where: { id } });
        if (video == null) {
            res.status(404).send("Video not found");
            return;
        }
        Object.assign(payload, { video: video });
        const user_id = video.user_id;
        const user = yield user_controller.findOne({ where: { id: user_id } });
        const likes = yield like_controller.findAll({ where: { video_id: id } });
        const views = yield view_controller.findAll({ where: { video_id: id } });
        Object.assign(payload, {
            user,
            like_count: likes.length,
            views: views.length,
        });
        res.status(200).send(payload);
    }
    catch (error) {
        res.status(500).send("Could not get video. Please try again");
        throw error;
    }
}));
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit = "20", offset = "0" } = req.query;
    try {
        const all_videos = yield video_controller.findAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
        const videos = yield Promise.all(all_videos.map((video) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield user_controller.findOne({
                where: {
                    id: video.user_id,
                },
            });
            const likes = yield like_controller.findAll({
                where: {
                    video_id: video.id,
                },
            });
            const views = yield view_controller.findAll({
                where: {
                    video_id: video.id,
                },
            });
            const data = { video, user, likes: likes.length, views: views.length };
            return data;
        })));
        res.status(200).json(videos);
    }
    catch (error) {
        res.status(500).send("Could not fetch videos. Please try");
        throw error;
    }
}));
exports.default = router;
