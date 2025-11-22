export function getApiErrorMessage(error: any): string {
  const res = error?.response;

  if (!res) return "Erro desconhecido. Tente novamente.";

  if (typeof res.data === "string") return res.data;

  if (res.data?.error) return res.data.error;

  if (Array.isArray(res.data?.details)) {
    return res.data.details.join("\n");
  }

  return "Erro inesperado. Tente novamente.";
}
