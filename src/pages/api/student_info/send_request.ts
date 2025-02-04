import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import type { SupabaseSubjectsIdResponse } from "../../../types/types";

// Helper function for file uploads
const uploadFile = async (path: string, file: File) => {
  return supabase.storage
    .from("files")
    .upload(path, file, { cacheControl: "3600", upsert: false });
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    // Authentication check
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw authError;
    if (!userData?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Form data processing
    const formData = await request.formData();
    const studentId = userData.user.id;
    const evidence = formData.get("evidence");
    const guardianLetter = formData.get("guardianLetter");
    const studentDescription = formData.get("reasons")?.toString() || "";

    // Validate required files
    if (!(evidence instanceof File) || !(guardianLetter instanceof File)) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing file attachments" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parallel file uploads
    const uploadPromises = [
      uploadFile(`${studentId}/documents/evidence/${evidence.name}`, evidence),
      uploadFile(`${studentId}/documents/guardianLetter/${guardianLetter.name}`, guardianLetter),
    ];

    const uploadResults = await Promise.all(uploadPromises);
    
    // Check for upload errors
    for (const result of uploadResults) {
      if (result.error) throw result.error;
    }

    // Get subjects with maximum attempts
    const { data: problematicSubjects, error: subjectsError } = await supabase
      .from("student_subjects")
      .select("available_subjects(id)")
      .eq("attempts", 3);

    if (subjectsError) throw subjectsError;

    // Prepare request data
    const requestsData = (problematicSubjects as unknown as SupabaseSubjectsIdResponse[]).map(
      ({ available_subjects }) => ({
        student_id: studentId,
        subject_id: available_subjects.id,
        description: studentDescription,
      })
    );

    // Skip insert if no subjects need processing
    if (requestsData.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subjects requiring attention" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Batch insert requests
    const { error: insertError } = await supabase
      .from("requests")
      .insert(requestsData);

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ message: "Request processed successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Processing error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        ...(error instanceof Error && { details: error.message }) 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};