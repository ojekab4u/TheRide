// Resolves which frontend URL to use for links (e.g. password reset).
// Uses the request Origin when it is in the allowlist, otherwise
// falls back to FRONTEND_URL.

const resolveFrontendUrl = (req) => {
    const fallback =
        process.env.FRONTEND_URL || "http://localhost:5500";

    const origin = req?.headers?.origin;

    if (!origin) {
        return fallback;
    }

    const allowed = (
        process.env.ALLOWED_FRONTEND_ORIGINS || ""
    )
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);

    return allowed.includes(origin) ? origin : fallback;
};

export default resolveFrontendUrl;
