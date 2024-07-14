import axios from "axios";

const baseURL = process.env.REACT_APP_cms_base_url;
const apiKey = process.env.REACT_APP_cms_api_token;

export async function fetchProjects(page=1, limit=10, sortBy = "Start", sortOrder = "desc") {
    try {
        const response = await axios.get(`${baseURL}/api/projects?populate=*&sort=${sortBy}:${sortOrder}&pagination[page]=${page}&pagination[pageSize]=${limit}`,
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            }
        );

        return response.data.data;   
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

export default { fetchProjects };


