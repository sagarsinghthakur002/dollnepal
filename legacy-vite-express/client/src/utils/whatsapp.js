export const WHATSAPP_NUMBER = '9779761302887'; // +977-9761302887, digits only

export function buildWhatsAppLink(productName, pageUrl = window.location.href) {
  const message = `Hello DollNepal! I am interested in purchasing/inquiring about: ${productName}. Here is the link: ${pageUrl}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildGeneralWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
