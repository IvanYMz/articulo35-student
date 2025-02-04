import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import type { StudentSubjects, SupabaseSubjectsResponse, StudentRequest } from "../../../types/types";

export const GET: APIRoute = async () => {
    try {
        // Fetch subjects where attempts equal 3
        const { data: studentSubjectsQuery, error: errorSubjects } = await supabase
            .from('student_subjects')
            .select('available_subjects(name, nrc)')
            .eq('attempts', 3);

        if (errorSubjects) {
            return new Response(JSON.stringify({ error: errorSubjects.message }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Map the fetched data to match the StudentSubjects type
        const studentSubjects: StudentSubjects[] = (studentSubjectsQuery as unknown as SupabaseSubjectsResponse[]).map((item) => {
            const { name, nrc } = item.available_subjects;
            return { name, nrc };
        });

        // Fetch the request status, limiting to one record
        const { data: dataRequests, error: errorRequests } = await supabase
            .from('requests')
            .select('status')
            .limit(1);

        let has_request = false;
        let request_status: 'under_review' | 'accepted' | 'rejected' | null = null;

        if (errorRequests) {
            return new Response(JSON.stringify({ error: errorRequests.message }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        if (dataRequests && dataRequests.length > 0) {
            has_request = true;
            request_status = dataRequests[0].status;
        }

        // Prepare the final response data structure
        const responseData: StudentRequest = {
            subjects: studentSubjects,
            request: has_request,
            status: request_status,
        };

        // Return the combined response
        return new Response(JSON.stringify(responseData), {
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
};