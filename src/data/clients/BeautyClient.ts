import axios from 'axios';

// @ts-expect-error
const baseUrl = import.meta.env.VITE_BASE_URL;

export default axios.create({
    baseURL: baseUrl,
});
