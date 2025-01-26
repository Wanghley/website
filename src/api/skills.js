import axios from "axios";

const baseURL = process.env.REACT_APP_skills_api_url;
const apiKey = process.env.REACT_APP_cms_api_token;

async function fetchFeaturedSkills() {
  try {
    const url = `${baseURL}?filters[Featured][$eq]=true&populate=Icon`;
    // console.log("Fetching from URL: ", url); // Log the URL
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${apiKey}` // Ensure Bearer prefix if needed
      }
    });

    // console.log("Response Data: ", response.data); // Log the entire response

    // Check if the response data is structured as expected
    if (!response.data.data) {
      throw new Error("Unexpected response structure");
    }

    // Map through the response data to extract necessary fields
    let skills = response.data.data.map((skill) => {
      const name = skill.attributes.Name;
      const type = skill.attributes.Type;
      const iconData = skill.attributes.Icon.data;

      // Handle cases where Icon.data might be null
      const icon = iconData && iconData.attributes.formats && iconData.attributes.formats.thumbnail
        ? iconData.attributes.formats.thumbnail.url
        : "https://res.cloudinary.com/wanghley/image/upload/v1720032994/placeholder_icon.png";

      return { name, type, icon };
    });

    // console.log("Mapped Skills: ", skills); // Log the mapped skills
    return skills;

  } catch (error) {
    console.error("Error fetching featured skills: ", error);
    throw error;
  }
}


async function fetchData(nextPage = 1, prevData = null) {
  try {
    const url = `${baseURL}?pagination[page]=${nextPage}`;
    const response = await axios.get(url);

    // console.log(response.data.data);

    const updatedData = {
      ...response.data,
      data: prevData ? [...prevData.data, ...response.data.data] : response.data.data
    };

    if (response.data.meta.pagination.pageCount <= nextPage) {
      return updatedData;
    } else {
      return fetchData(nextPage + 1, updatedData);
    }
  } catch (e) {
    console.error(e);
    throw e; // Rethrow the error for the caller to handle
  }
}

export async function getSkills() {
  try {
    const initialChart = await fetchData();
    // console.log(initialChart.data);
    return initialChart.data;
  } catch (e) {
    console.error(e);
    return null; // or throw e; depending on your error handling strategy
  }
};

export async function getSkillsgrouped() {
  const skills = await getSkills();
  const groupedSkills = {};

  skills.forEach(skill => {
    const type = skill.attributes.Type;
    const name = skill.attributes.Name;
    const expertise = skill.attributes.Expertise;

    // If the type doesn't exist, create it
    if (!groupedSkills[type]) {
      groupedSkills[type] = [];
    }

    // Push the skill into the correct type category
    groupedSkills[type].push({ name, expertise });
  });

  return groupedSkills;
}

export async function getUniqueElements() {
  try {
    const initialChart = await fetchData();
    // console.log(initialChart.data);
    const uniqueElements = initialChart.data.reduce((acc, { id, attributes }) => {
      acc[id] = attributes;
      return acc;
    }, {});
    /* The line `// console.log(uniqueElements);` is commented out, which means it is not being
    executed. It is likely used for debugging purposes to log the `uniqueElements` object to the
    console. By logging the object, you can inspect its contents and verify that it contains the
    expected data. */
    // console.log(uniqueElements);
    return uniqueElements;
  } catch (e) {
    console.error(e);
    return null; // or throw e; depending on your error handling strategy
  }
}

export { fetchFeaturedSkills };