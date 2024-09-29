import axios from "axios";

const baseURL = process.env.REACT_APP_cms_base_url;
const apiKey = process.env.REACT_APP_cms_api_token;

export async function fetchAllPublications(limit = 10, sortBy = "publication", sortOrder = "desc") {
    let allPublications = [];
    let page = 1;
    let totalPages;

    try {
        do {
            const response = await axios.get(
                `${baseURL}/api/publications?populate=*&sort=${sortBy}:${sortOrder}&pagination[page]=${page}&pagination[pageSize]=${limit}`,
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`
                    }
                }
            );

            const { data, meta } = response.data;
            allPublications = allPublications.concat(data);

            totalPages = meta.pagination.pageCount; // Corrected to use pageCount instead of totalPages
            page++;
        } while (page <= totalPages);
        
        return allPublications;
    } catch (error) {
        console.error("Error fetching data:", error);
        return []; // Return empty array on error
    }
}

export default { fetchAllPublications };
