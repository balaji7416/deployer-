export class ApiError extends Error {
  status: number = 500;
  message: string = "Something went wrong";
  success: boolean = false;
  constructor(status: number, message: string) {
    super(message);
    this.message = message;
    this.status = status;
    this.success = false;
  }
}
