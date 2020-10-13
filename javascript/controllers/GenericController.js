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
class GenericController {
    constructor(key) {
        this.model = key;
    }
    updateOne(params, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.model.update(Object.assign({}, params), Object.assign({}, options));
            return;
        });
    }
    destroy(attributes) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.model.destroy(Object.assign({}, attributes));
            return value;
        });
    }
    findOrCreate(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const [new_model, exists] = yield this.model.findOrCreate(Object.assign({}, params));
            return [new_model.get(), exists];
        });
    }
    findAll(attributes) {
        return __awaiter(this, void 0, void 0, function* () {
            const new_model = yield this.model.findAll(Object.assign({}, attributes));
            return new_model.map((item) => item.get());
        });
    }
    create(params, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const new_model = this.model.build(Object.assign({}, params));
            yield new_model.save(Object.assign({}, options));
            return new_model.get();
        });
    }
    findOne(attributes) {
        return __awaiter(this, void 0, void 0, function* () {
            const new_model = yield this.model.findOne(Object.assign({}, attributes));
            return new_model === null || new_model === void 0 ? void 0 : new_model.get();
        });
    }
}
exports.default = GenericController;
