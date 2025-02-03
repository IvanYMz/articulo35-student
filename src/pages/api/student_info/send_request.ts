import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const PUT: APIRoute = async function ({ request }) {
    try {
        const { data, error } = await supabase.auth.getUser();

        if (!data) {
            return new Response("No user authenticated", { status: 401 }); // Si no hay usuario autenticado
        }

        console.log(data.user?.id)

        const formData = await request.formData();
        const student_id = data.user?.id; // Extraemos el student_id
        const evidence = formData.get('evidence'); // Extraemos el archivo de evidencia
        const guardianLetter = formData.get('guardianLetter'); // Extraemos el archivo de la carta del tutor

        // Verificamos si student_id, evidence y guardianLetter son válidos
        if (!student_id || !(evidence instanceof File) || !(guardianLetter instanceof File)) {
            return new Response("Missing parameters or files are not valid", { status: 400 });
        }
        console.log(student_id);
        // Subir el archivo de evidencia
        const evidencePath = `${student_id}/documents/evidence/${evidence.name}`;
        const { data: evidenceData, error: evidenceError } = await supabase
            .storage
            .from('files')
            .upload(evidencePath, evidence, {
                cacheControl: '3600',
                upsert: false
            });

        if (evidenceError) {
            console.log(evidenceError.message);
            return new Response(evidenceError.message, { status: 500 });
        }

        // Subir la carta del tutor
        const guardianLetterPath = `${student_id}/documents/guardianLetter/${guardianLetter.name}`;
        const { data: guardianLetterData, error: guardianLetterError } = await supabase
            .storage
            .from('files')
            .upload(guardianLetterPath, guardianLetter, {
                cacheControl: '3600',
                upsert: false
            });

        if (guardianLetterError) {
            console.log(guardianLetterError.message);
            return new Response(guardianLetterError.message, { status: 500 });
        }

        return new Response("Request successfully uploaded", { status: 200 });
    } catch (err) {
        console.error("Error:", err);
        return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
