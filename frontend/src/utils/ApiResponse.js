export class ApiResponse {
  static json(data, message = "Success", status = 200, success = true) {
    return new Response(
      JSON.stringify({
        success,
        message,
        data,
      }),
      {
        status,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  static success(data = null, message = "Success", status = 200) {
    return this.json(data, message, status, true);
  }

  static error(message = "An error occurred", status = 500, errors = null) {
    return new Response(
      JSON.stringify({
        success: false,
        message,
        errors,
      }),
      {
        status,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  static badRequest(message = "Bad request", errors = null) {
    return this.error(message, 400, errors);
  }

  static unauthorized(message = "Unauthorized") {
    return this.error(message, 401);
  }

  static forbidden(message = "Forbidden") {
    return this.error(message, 403);
  }

  static notFound(message = "Resource not found") {
    return this.error(message, 404);
  }
}
