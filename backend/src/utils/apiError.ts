export class ApiError extends Error {
  status: number = 500;
  success: boolean = false;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.success = false;
  }
}
