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
exports.QueryBuilder = void 0;
class QueryBuilder {
    constructor(modelQuery, query) {
        this.query = query;
        this.modelQuery = modelQuery;
    }
    search(searchableFields) {
        var _a;
        let searchTerm = '';
        if ((_a = this.query) === null || _a === void 0 ? void 0 : _a.searchTerm) {
            searchTerm = this.query.searchTerm;
        }
        // {title: {$regex: searchTerm}}
        // {genre: {$regex: searchTerm}}
        this.modelQuery = this.modelQuery.find({
            $or: searchableFields.map((field) => ({
                [field]: new RegExp(searchTerm, 'i'),
            })),
        });
        return this;
    }
    paginate() {
        var _a, _b, _c;
        let limit = Number(((_a = this.query) === null || _a === void 0 ? void 0 : _a.limit) || 10);
        let skip = 0;
        if ((_b = this.query) === null || _b === void 0 ? void 0 : _b.page) {
            const page = Number(((_c = this.query) === null || _c === void 0 ? void 0 : _c.page) || 1);
            skip = Number((page - 1) * limit);
        }
        this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        return this;
    }
    sort() {
        var _a;
        let sortBy = '-createdAt';
        if ((_a = this.query) === null || _a === void 0 ? void 0 : _a.sortBy) {
            sortBy = this.query.sortBy;
        }
        this.modelQuery = this.modelQuery.sort(sortBy);
        return this;
    }
    fields() {
        var _a, _b;
        let fields = '';
        if ((_a = this.query) === null || _a === void 0 ? void 0 : _a.fields) {
            fields = ((_b = this.query) === null || _b === void 0 ? void 0 : _b.fields).split(',').join(' ');
        }
        this.modelQuery = this.modelQuery.select(fields);
        return this;
    }
    filter() {
        const queryObj = Object.assign({}, this.query);
        const excludeFields = ['searchTerm', 'page', 'limit', 'sortBy', 'fields'];
        excludeFields.forEach((e) => delete queryObj[e]);
        this.modelQuery = this.modelQuery.find(queryObj);
        return this;
    }
    countTotal() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const totalQueries = this.modelQuery.getFilter();
            const total = yield this.modelQuery.model.countDocuments(totalQueries);
            const page = Number((_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.page) || 1;
            const limit = Number((_b = this === null || this === void 0 ? void 0 : this.query) === null || _b === void 0 ? void 0 : _b.limit) || 10;
            const totalPage = Math.ceil(total / limit);
            return {
                page,
                limit,
                total,
                totalPage,
            };
        });
    }
}
exports.QueryBuilder = QueryBuilder;
