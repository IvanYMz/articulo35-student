import type { APIRoute } from "astro";
import type { StudentInformation } from "../../../types/types";
import { supabase } from "../../../lib/supabase";

export const GET: APIRoute = async () => {
    try {
        const [
            { data: academicData, error: academicError },
            { data: personalData, error: personalError }
        ] = await Promise.all([
            supabase.from('academic_records').select('*').single(),
            supabase.from('student_profiles').select('*').single()
        ]);

        const errorMessage = academicError?.message || personalError?.message;
        if (errorMessage) {
            return new Response(JSON.stringify({ error: errorMessage }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        };

        const studentInformation: StudentInformation = {
            academicData: academicData,
            personalData: personalData,
        };

        return new Response(JSON.stringify(studentInformation), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        // Catch unexpected errors and return a generic server error
        return new Response(JSON.stringify({ error: 'An unexpected error occurred.' }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}