export type SupabaseSubjectsResponse = {
    available_subjects: {
        name: string;
        nrc: string;
    };
};

export type StudentSubjects = {
    name: string;
    nrc: string;
};

export type SupabaseSubjectsIdResponse = {
    available_subjects: {
        id: string;
    };
};

export type StudentRequest = {
    subjects: StudentSubjects[];
    request: boolean;
    status: 'under_review' | 'accepted' | 'rejected' | null;
};

export type StudentInformation = {
    personalData: {
        student_id: string;
        full_name: string;
        email: string;
        date_of_birth: string;
        country: string;
        state: string;
        municipality: string;
        postal_code: string;
        address: string;
        emergency_contact: string;
    };
    academicData: {
        student_id: string;
        full_name: string;
        student_code: string;
        career: string;
        average_score: number;
        enrollment_cycle: string;
        graduation_cycle: string;
        approved_credits: number;
        pending_credits: number;
        division: string;
    };
};