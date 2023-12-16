import axios from "axios";
export async function employeeAuthorize(): Promise<boolean | any> {
  let token = localStorage.getItem("SwimmingToken");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      let result = await axios.post(
        "https://akademia.website/api/employeeAuthorize"
      );
      return result.data;
    } catch (err) {
      return false;
    }
  } else {
    return false;
  }
}
