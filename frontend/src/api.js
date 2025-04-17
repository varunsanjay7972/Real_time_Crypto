import axios from 'axios';

// connect to your backend running at localhost:8000
export const getPredictions = () => {
  return axios.get("http://127.0.0.1:8000/predict/");
};
