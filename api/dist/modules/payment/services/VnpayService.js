import crypto from "crypto";
import { env } from "@/config/env";
import qs from "qs";
export class VnpayService {
    tmnCode = env.VNP_TMN_CODE;
    secretKey = env.VNP_HASH_SECRET;
    vnpUrl = env.VNP_URL;
    vnpApiUrl = env.VNP_API_URL;
    returnUrl = env.VNP_RETURN_URL;
    createPaymentUrl(ipAddr, amount, orderInfo, orderId) {
        const date = new Date();
        const createDate = this.formatDate(date);
        const expireDate = this.formatDate(new Date(date.getTime() + 15 * 60000)); // Hết hạn sau 15p
        let vnp_Params = {};
        vnp_Params["vnp_Version"] = "2.1.0";
        vnp_Params["vnp_Command"] = "pay";
        vnp_Params["vnp_TmnCode"] = this.tmnCode;
        vnp_Params["vnp_Locale"] = "vn";
        vnp_Params["vnp_CurrCode"] = "VND";
        vnp_Params["vnp_TxnRef"] = orderId;
        vnp_Params["vnp_OrderInfo"] = orderInfo;
        vnp_Params["vnp_OrderType"] = "other";
        vnp_Params["vnp_Amount"] = amount * 100;
        vnp_Params["vnp_ReturnUrl"] = this.returnUrl;
        vnp_Params["vnp_IpAddr"] = ipAddr;
        vnp_Params["vnp_CreateDate"] = createDate;
        vnp_Params["vnp_ExpireDate"] = expireDate;
        vnp_Params = this.sortObject(vnp_Params);
        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", this.secretKey);
        const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
        vnp_Params["vnp_SecureHash"] = signed;
        let vnpUrl = this.vnpUrl;
        vnpUrl += "?" + qs.stringify(vnp_Params, { encode: false });
        return vnpUrl;
    }
    verifyIpn(vnp_Params) {
        const secureHash = vnp_Params["vnp_SecureHash"];
        delete vnp_Params["vnp_SecureHash"];
        delete vnp_Params["vnp_SecureHashType"];
        vnp_Params = this.sortObject(vnp_Params);
        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", this.secretKey);
        const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
        if (secureHash === signed) {
            const orderId = vnp_Params["vnp_TxnRef"];
            const responseCode = vnp_Params["vnp_ResponseCode"];
            const amount = Number(vnp_Params["vnp_Amount"]) / 100;
            if (responseCode === "00") {
                return { isSuccess: true, orderId, amount, message: "Success", responseCode };
            }
            return { isSuccess: false, orderId, amount, message: "Transaction failed", responseCode };
        }
        return { isSuccess: false, orderId: "", amount: 0, message: "Invalid signature", responseCode: "97" };
    }
    formatDate(date) {
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const hour = date.getHours().toString().padStart(2, "0");
        const minute = date.getMinutes().toString().padStart(2, "0");
        const second = date.getSeconds().toString().padStart(2, "0");
        return `${year}${month}${day}${hour}${minute}${second}`;
    }
    sortObject(obj) {
        let sorted = {};
        let str = [];
        let key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (key = 0; key < str.length; key++) {
            sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
        }
        return sorted;
    }
}
