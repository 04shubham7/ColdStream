export class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  static ok(data, message = "Success") {
    return new ApiResponse(200, data, message);
  }

  static created(data, message = "Created") {
    return new ApiResponse(201, data, message);
  }

  static accepted(data = null, message = "Accepted") {
    return new ApiResponse(202, data, message);
  }

  static noContent() {
    return new ApiResponse(204, null, "No content");
  }
}
