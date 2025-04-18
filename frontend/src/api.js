import axios from 'axios';

export const getPredictions = () => {
  return axios.get("https://real-time-crypto-2.onrender.com/predict/");
};
