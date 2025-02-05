import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const PUT: APIRoute = async ({ request }) => {
    try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!userData?.user?.id) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const userId = userData.user.id;
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const fileName = formData.get('name') as string;
        const fileFolder = formData.get('folder') as String;

        if (!file || !fileName) {
            return new Response(JSON.stringify({ error: "Missing file or file name" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const { error: removeError } = await supabase.storage
            .from('files')
            .remove([`${userId}/documents/${fileFolder}/${fileName}`]);

        if (removeError) {
            throw removeError;
        }

        const { error: uploadError } = await supabase.storage
            .from('files')
            .upload(`${userId}/documents/${fileFolder}/${file.name}`, file)
        
        if (uploadError) {
            throw uploadError;
        }
        
        return new Response(JSON.stringify({ message: `Archivo ${fileName} actualizado correctamente.` }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: 'An unexpected error occurred.' }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
