import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return apiError("No autorizado", 401);

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string;

    if (!file || !folder) return apiError("Archivo y carpeta son obligatorios", 400);
    if (folder !== "businesses" && folder !== "products") return apiError("Carpeta inválida", 400);

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) return apiError("Formato no válido (solo JPG, PNG, WEBP)", 400);

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) return apiError("El archivo no debe pesar más de 5MB", 400);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const { url, publicId } = await uploadImage(base64, folder);
    return apiSuccess({ url, publicId });
  } catch (error) {
    console.error("Upload error:", error);
    return apiError("Error al subir la imagen", 500);
  }
}
