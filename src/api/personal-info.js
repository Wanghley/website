import axios from "axios";

const baseURL = process.env.REACT_APP_cms_base_url;
const apiKey = process.env.REACT_APP_cms_api_token;

export async function fetchPersonalInfo() {
    try {
        const response = await axios.get(`${baseURL}/api/personal-information?populate=*`,
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            }
        );

        return response.data.data.attributes;   
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

export default { fetchPersonalInfo };


