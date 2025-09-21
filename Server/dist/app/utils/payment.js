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
exports.verifyPayment = exports.initiatePayment = void 0;
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
const config_1 = __importDefault(require("../config"));
const axios_1 = __importDefault(require("axios"));
const initiatePayment = (paymentData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.post(config_1.default.payment_url, {
            store_id: config_1.default.store_id,
            signature_key: config_1.default.signature_key,
            tran_id: paymentData.transactionId,
            success_url: `https://destiny-diary-server.vercel.app/api/v1/payments/confirmation?transactionId=${paymentData.transactionId}&status=success`,
            fail_url: `https://destiny-diary-server.vercel.app/api/v1/payments/confirmation?status=failed`,
            cancel_url: 'https://shine-slot-client.vercel.app/',
            amount: paymentData.amount,
            currency: 'BDT',
            desc: 'Merchant Registration Payment',
            cus_name: paymentData.customerName,
            cus_email: paymentData.customerEmail,
            cus_add1: paymentData.customerAddress,
            cus_add2: 'N/A',
            cus_city: 'N/A',
            cus_state: 'N/A',
            cus_postcode: 'N/A',
            cus_country: 'N/A',
            cus_phone: paymentData.customerMobile,
            type: 'json',
        });
        return response.data;
    }
    catch (error) {
        throw new Error('Payment initiation failed!');
    }
});
exports.initiatePayment = initiatePayment;
const verifyPayment = (tnxId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(config_1.default.payment_verify_url, {
            params: {
                store_id: config_1.default.store_id,
                signature_key: config_1.default.signature_key,
                type: 'json',
                request_id: tnxId,
            },
        });
        return response.data;
    }
    catch (err) {
        throw new Error('Payment validation failed!');
    }
});
exports.verifyPayment = verifyPayment;
