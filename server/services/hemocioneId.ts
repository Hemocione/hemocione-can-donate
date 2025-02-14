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

  console.log("🔗 Fetching user data from Hemocione ID API...");
  const response = await fetch(`${config.public.hemocioneIdApiUrl}/users/me`, {
    method: "GET",
    headers: {
      Authorization: token.startsWith("Bearer") ? token : `Bearer ${token}`,
    },
  });

  console.log(response);

  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }

  return response.json();
}
