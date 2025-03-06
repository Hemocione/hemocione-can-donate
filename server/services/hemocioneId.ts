interface Me {
  id: string;
  givenName: string;
  surName: string;
  bloodType: string;
  email: string;
  phone: string;
  document: string;
  birthDate: string;
}

export async function getMe(token: string): Promise<Me> {
  const config = useRuntimeConfig();

  const response = await fetch(`${config.public.hemocioneIdApiUrl}/users/me`, {
    method: "GET",
    headers: {
      Authorization: token.startsWith("Bearer") ? token : `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }

  return await response.json();
}
