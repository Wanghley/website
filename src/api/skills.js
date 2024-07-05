import axios from "axios";

const baseURL = process.env.REACT_APP_skills_api_url;
const apiKey = process.env.REACT_APP_cms_api_token;

//TODO: Need to test with pagination
async function fetchFeaturedSkills() {
  try {
    const url = `${baseURL}?filters[Featured][$eq]=true&populate=Icon`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `${apiKey}`
      }
    });

    // just need to get the Name and Icon.data.thumbnail.url for each skill
    let r = response.data.data.map((skill) => {
      const name = skill.attributes.Name;
      let icon = skill.attributes.Icon.data;
      icon = icon==null? "https://res.cloudinary.com/wanghley/image/upload/v1720032994/placeholder_icon.png" : icon.attributes.formats.thumbnail.url;
      const type = skill.attributes.Type;
      return { name, type, icon};
    });

    return r;
  }catch(e){
    console.error(e);
    throw e;
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