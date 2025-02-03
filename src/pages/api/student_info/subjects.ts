import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

type SupabaseResponse = {
    available_subjects: {
        name: string;
        nrc: string;
    };
};

type StudentSubjects = {
    name: string;
    nrc: string;
};

export const GET: APIRoute = async () => {
    const { data: student_subjectsQuery, error: errorSubjects } = await supabase
        .from('student_subjects')
        .select('available_subjects(name, nrc)')
        .eq('attempts', 3);

    if (errorSubjects) {
        return new Response(JSON.stringify({ error: errorSubjects.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    const studentSubjects: StudentSubjects[] = (student_subjectsQuery as unknown as SupabaseResponse[]).map((item) => {
        const { name, nrc } = item.available_subjects;
        return { name, nrc };
    });

    return new Response(JSON.stringify(studentSubjects), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
};
