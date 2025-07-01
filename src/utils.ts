/**
 * Formatea una fecha en string (ej: "2025-06-30T00:00:00") 
 * a un formato localizado DD/MM/YYYY.
 * @param dateString La fecha en formato string.
 * @returns La fecha formateada o un string vacío si la entrada no es válida.
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return 'N/A'; // O un string vacío '', como prefieras
  }
  
  // Creamos un objeto Date. Usar en-GB (Inglés de Gran Bretaña)
  // nos da el formato DD/MM/YYYY de forma consistente.
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB');
};