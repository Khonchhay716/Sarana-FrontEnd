import alertify from "alertifyjs";

const decodeMsg = (msg: string): string => {
  return msg;
};

// Typed alertError function
export const alertError = (msg: any): void => {
  (alertify as any).alert('Error', decodeMsg(msg)).set('label', 'OK');
};