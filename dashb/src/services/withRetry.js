export async function withRetry(operation, { retries = 2, shouldRetry = () => true, delay = 500 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const canRetry = attempt < retries && shouldRetry(error);
      if (!canRetry) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1)));
    }
  }
}

export function isNetworkError(error) {
  return error instanceof TypeError;
}
