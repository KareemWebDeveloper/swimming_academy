import axios from "axios";
export async function adminAuthorize(): Promise<boolean> {
  let token = localStorage.getItem("SwimmingToken");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      await axios.post("https://akademia.website/api/adminAuthorize");
      return true;
    } catch (err) {
      return false;
    }
  } else {
    return false;
  }
}
