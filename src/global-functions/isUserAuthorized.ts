import axios from "axios";
export async function userAuthorize(): Promise<boolean> {
  let token = localStorage.getItem("SwimmingToken");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      await axios.post("https://akademia.website/api/userAuthorize");
      return true;
    } catch (err) {
      return false;
    }
  } else {
    return false;
  }
}
