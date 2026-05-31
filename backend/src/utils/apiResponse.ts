export class ApiResponse {
  statusCode: number;
  message: string;
  data: any;
  success: boolean = true;
  constructor(statusCode: number, message: string, data: any) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
