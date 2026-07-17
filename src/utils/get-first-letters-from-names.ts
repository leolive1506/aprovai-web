export function getFirstLettersFromNames(names: string): string {
  const nameParts = names.trim().split(" ");
  return nameParts
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}