export function encodeContactValue(value: string): string {
  return Array.from(value, (character) =>
    character.charCodeAt(0).toString(16).padStart(2, '0')
  ).join('');
}

export function decodeContactValue(value: string): string | null {
  if (!/^(?:[0-9a-f]{2})+$/i.test(value)) {
    return null;
  }

  const bytes = value.match(/.{2}/g);
  if (!bytes) {
    return null;
  }

  return bytes.map((byte) => String.fromCharCode(Number.parseInt(byte, 16))).join('');
}
