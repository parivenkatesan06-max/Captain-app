import labels from "../assets/Labels/labels.json"
export function getLabels(userInfo) {
    const client = userInfo.clientName;
    if (labels[client]) {
        return labels[client];
    } else {
        return {
            "menuTitle": "Menu",
            "qrCodeTitle": "QR Code",
            "seat": "Seat"
        };
    }
}