export interface GeminiContentPart {
  text?: string;
}

export interface GeminiContent {
  role?: string;
  parts?: GeminiContentPart[];
}

export interface GeminiCandidate {
  content?: GeminiContent;
}

export interface GeminiResponse {
  candidates?: GeminiCandidate[];
}