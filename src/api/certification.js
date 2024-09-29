import axios from "axios";

const baseURL = process.env.REACT_APP_cms_base_url;
const apiKey = process.env.REACT_APP_cms_api_token;

export async function fetchAllCertifications(limit = 10, sortBy = "date", sortOrder = "desc") {
    let allEducations = [];
    let page = 1;
    let totalPages;

    try {
        do {
            const response = await axios.get(`${baseURL}/api/certifications?populate=*&sort=${sortBy}:${sortOrder}&pagination[page]=${page}&pagination[pageSize]=${limit}`,
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`
                    }
                }
            );

            const { data, meta } = response.data;
            allEducations = allEducations.concat(data);

            totalPages = meta.pagination.totalPages;
            page++;
        } while (page <= totalPages);
        return allEducations;   
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}


export default { fetchAllCertifications };


