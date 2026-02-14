const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function createCheckoutSession(userId: string): Promise<{ sessionId: string; url: string }> {
  const response = await fetch(`${API_URL}/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error("Failed to create checkout session");
  }

  return response.json();
}

export async function checkPayment(sessionId: string): Promise<boolean> {
  const response = await fetch(`${API_URL}/check-payment?session_id=${sessionId}`);

  if (!response.ok) {
    throw new Error("Failed to check payment");
  }

  const data = await response.json();
  return data.paid;
}

export async function getUserStats(userId: string): Promise<{ totalSpent: number; totalPayments: number }> {
  const response = await fetch(`${API_URL}/user-stats?user_id=${userId}`);

  if (!response.ok) {
    throw new Error("Failed to get user stats");
  }

  return response.json();
}
