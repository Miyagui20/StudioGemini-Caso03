// Archivo desactivado. La aplicación ahora utiliza el SDK directamente en el cliente.
export default function handler(req, res) {
  res.status(410).json({ error: "Este endpoint ha sido migrado al cliente para mayor seguridad y rendimiento." });
}