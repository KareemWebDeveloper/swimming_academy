import axios from "axios";
export async function adminAuthorize(): Promise<boolean> {
  let token = localStorage.getItem("SwimmingToken");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      let admin : any = await axios.post("https://akademia.website/api/adminAuthorize");
      localStorage.setItem('user_info' , JSON.stringify(admin.data.user))
      return true;
    } catch (err) {
      localStorage.removeItem('user_info')
      return false;
    }
  } else {
    localStorage.removeItem('user_info')
    return false;
  }
}
