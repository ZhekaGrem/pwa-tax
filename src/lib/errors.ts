export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = this.constructor.name
  }
}
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION', 422)
  }
}
export class NotAuthenticated extends AppError {
  constructor() {
    super('Not authenticated', 'UNAUTHENTICATED', 401)
  }
}
export class NotOwner extends AppError {
  constructor() {
    super('Not the owner of this resource', 'FORBIDDEN', 403)
  }
}
export class PdfGenerationError extends AppError {
  constructor(message: string) {
    super(message, 'PDF_GEN_FAIL', 500)
  }
}
export class FirestoreError extends AppError {
  constructor(message: string, firestoreCode: string) {
    super(`${firestoreCode}: ${message}`, 'FIRESTORE', 500)
  }
}
