export function generateOrderId(): string {
  const timePart = Date.now().toString(36).toUpperCase().slice(-5);
  const randomPart = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `DN-${timePart}${randomPart}`;
}
