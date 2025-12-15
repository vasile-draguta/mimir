export interface SelectionContext {
  selected: string;
  before?: string;
  after?: string;
  model?: string;
}

export interface ContextResponse {
  context: string;
}

export interface ErrorResponse {
  error: string;
}
