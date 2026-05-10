export const DEVICE_STATUS_ON = "Bật";
export const DEVICE_STATUS_OFF = "Tắt";

export const normalizeDeviceStatus = (value) => {
  if (value === undefined || value === null || value === "") return value;

  if (value === true || value === 1) return DEVICE_STATUS_ON;
  if (value === false || value === 0) return DEVICE_STATUS_OFF;

  const normalized = String(value).trim().toLowerCase();

  if (["bật", "bat", "on", "1", "true"].includes(normalized)) {
    return DEVICE_STATUS_ON;
  }

  if (["tắt", "tat", "off", "0", "false"].includes(normalized)) {
    return DEVICE_STATUS_OFF;
  }

  return value;
};

export const getStatusFromControlValue = (value) => {
  return Number(value) === 0 ? DEVICE_STATUS_OFF : DEVICE_STATUS_ON;
};
