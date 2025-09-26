"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userFilterableFields = exports.userSearchableFields = exports.DEFAULT_PROFILE_URL = exports.USER_STATUS = exports.USER_ROLE = void 0;
exports.USER_ROLE = {
    ADMIN: 'ADMIN',
    USER: 'USER',
};
exports.USER_STATUS = {
    ACTIVE: 'ACTIVE',
    BAN: 'BAN',
};
exports.DEFAULT_PROFILE_URL = 'https://www.pngall.com/wp-content/uploads/5/Profile-PNG-Free-Download.png';
exports.userSearchableFields = ['name', 'email', 'phone'];
exports.userFilterableFields = [
    'name',
    'email',
    'phone',
    'role',
    'status',
    'searchTerm',
];
