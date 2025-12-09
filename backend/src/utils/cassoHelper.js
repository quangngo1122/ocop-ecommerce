import crypto from "crypto";

export const verifySignature = (req) => {
  try {
    const headers = req.headers;
    const webhookData = req.body;
    const checksumKey = process.env.CASSO_WEBHOOK_SECRET;
    function sortObjDataByKey(data) {
      const sortedObj = {};
      Object.keys(data)
        .sort()
        .forEach((key) => {
          if (typeof data[key] === "object") {
            sortedObj[key] = sortObjDataByKey(data[key]);
          } else {
            sortedObj[key] = data[key];
          }
        });
      return sortedObj;
    }

    function verifyWebhookSignature(headers, data, checksumKey) {
      const receivedSignature = headers["x-casso-signature"];
      const [, timestampStr, signature] =
        receivedSignature.match(/t=(\d+),v1=([a-f0-9]+)/) || [];
      const timestamp = parseInt(timestampStr, 10);

      const sortedDataByKey = sortObjDataByKey(data);
      const messageToSign = timestamp + "." + JSON.stringify(sortedDataByKey);
      const generatedSignature = crypto
        .createHmac("sha512", checksumKey)
        .update(messageToSign)
        .digest("hex");
      return signature === generatedSignature;
    }

    const isValid = verifyWebhookSignature(headers, webhookData, checksumKey);
    console.log(isValid);
    return isValid;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
};
