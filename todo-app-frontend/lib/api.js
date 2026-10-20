
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
).replace(/\/$/, "");

export async function apiRequest(path, options = {}) {
  const { token, headers: customHeaders, ...fetchOptions } = options;

  const headers = {
    ...(fetchOptions.body
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(customHeaders || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  let result;

  try {
    result = await response.json();
  } catch {
    result = { message: "The server returned an invalid response." };
  }

  if (!response.ok) {
    const error = new Error(
      result.message || `Request failed (${response.status})`
    );

    error.statusCode = response.status;
    throw error;
  }

  return result;
}
