import axios from "axios";

const TENOR_API_KEY = "LIVDSRZULELA";

export async function fetchCategories(locale = "en") {
    const { data } = await axios("https://g.tenor.com/v1/categories", {
        params: {
            key: TENOR_API_KEY,
            locale
        }
    });
    return data.tags;
};

export async function fetchTrending(locale = "en", limit = 50) {
    const { data } = await axios("https://g.tenor.com/v1/trending", {
        params: {
            key: TENOR_API_KEY,
            locale,
            limit
        }
    });
    return data.results;
};

export async function searchGifs(query, locale = "en", limit = 100) {
    const { data } = await axios("https://g.tenor.com/v1/search", {
        params: {
            key: TENOR_API_KEY,
            locale,
            q: query,
            limit
        }
    });
    return data.results;
};