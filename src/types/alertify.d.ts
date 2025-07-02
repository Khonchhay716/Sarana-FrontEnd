declare module 'alertifyjs' {
  interface Alertify {
    success(message: string): void;
    error(message: string): void;
    warning(message: string): void;
    message(message: string): void;
    // Add more methods if you use them
  }

  const alertify: Alertify;
  export default alertify;
}