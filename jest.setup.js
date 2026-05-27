import '@testing-library/jest-dom';

// Required by service modules that guard NEXT_PUBLIC_API_URL at module load time.
process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
