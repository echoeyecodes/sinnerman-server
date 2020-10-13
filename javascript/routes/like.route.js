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
const sequelize_1 = require("sequelize");
const like_middleware_1 = require("../middlewares/like.middleware");
const like_controller_1 = __importDefault(require("../controllers/like.controller"));
const generalRequestValidator_1 = __importDefault(require("../utils/generalRequestValidator"));
const router = express_1.default.Router();
const like_controller = new like_controller_1.default();
router.post("/", like_middleware_1.validateLikeRequest("add"), generalRequestValidator_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { video_id } = req.body;
    const { type } = req.query;
    const user_id = req.id;
    try {
        if (parseInt(type) == 0) {
            yield like_controller.findOrCreate({
                where: { [sequelize_1.Op.and]: [{ user_id }, { video_id }] },
                defaults: { video_id, user_id },
            });
        }
        else {
            yield like_controller.destroy({
                where: { [sequelize_1.Op.and]: [{ user_id }, { video_id }] },
            });
        }
        res.status(202).send("done");
    }
    catch (error) {
        console.log(error);
        res.status(400).send("Could not like video. Please try again");
    }
}));
router.get("/:id", like_middleware_1.validateLikeRequest("find"), generalRequestValidator_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const likes = yield like_controller.findAll({ where: { video_id: id } });
        res.status(200).send(`${likes.length}`);
    }
    catch (error) {
        res.status(500).send("Could not fetch likes");
        throw error;
    }
}));
exports.default = router;
