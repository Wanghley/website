import axios from "axios";

const baseURL = process.env.REACT_APP_cms_base_url;
const apiKey = process.env.REACT_APP_cms_api_token;

export async function fetchAllExperiences(limit = 100, sortBy = "start", sortOrder = "desc") {
    let allExperiences = [];
    let page = 1;
    let totalPages = 1;

    try {
        do {
            const response = await axios.get(
                `${baseURL}/api/experiences?populate=*&sort=${sortBy}:${sortOrder}&pagination[page]=${page}&pagination[pageSize]=${limit}`,
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`
                    }
                }
            );

            const { data, meta } = response.data;
            allExperiences = allExperiences.concat(data);

            totalPages = meta.pagination.totalPages;
            page++;
        } while (page <= totalPages);
        return allExperiences;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}


export default { fetchAllExperiences };


