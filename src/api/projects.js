import axios from "axios";

const baseURL = process.env.REACT_APP_cms_base_url;
const apiKey = process.env.REACT_APP_cms_api_token;

export async function fetchProjects(page = 1, limit = 10, sortBy = "Start", sortOrder = "desc") {
    try {
        const response = await axios.get(
            `${baseURL}/api/projects?populate=*&sort=${sortBy}:${sortOrder}&pagination[page]=${page}&pagination[pageSize]=${limit}`,
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            }
        );

        // Return full response with data and meta (pagination info)
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return { data: [], meta: null };
    }
}

// Optional: Fetch just the total count (useful for stats)
export async function fetchProjectsCount() {
    try {
        const response = await axios.get(
            `${baseURL}/api/projects?pagination[pageSize]=1`,
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            }
        );

        return response.data.meta?.pagination?.total || 0;
    } catch (error) {
        console.error("Error fetching project count:", error);
        return 0;
    }
}

export default { fetchProjects, fetchProjectsCount };


