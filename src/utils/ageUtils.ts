export function calculateAge(dateOfBirth: string | Date): number {
  if (!dateOfBirth) return 0;
  const birthDate = new Date(dateOfBirth);
  const ageDiff = Date.now() - birthDate.getTime();
  return Math.floor(ageDiff / (365.25 * 24 * 60 * 60 * 1000));
}

export function calculateAgeAt(dateOfBirth: string | Date, atDate: string | Date): number {
  if (!dateOfBirth || !atDate) return 0;
  const birth = new Date(dateOfBirth);
  const at = new Date(atDate);
  const diff = at.getTime() - birth.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}
