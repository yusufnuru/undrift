export async function getUserId(): Promise<string> {
  const result = await chrome.storage.sync.get("userId");
  if (result.userId) {
    return result.userId;
  }

  const userId = crypto.randomUUID();
  await chrome.storage.sync.set({ userId });
  return userId;
}
