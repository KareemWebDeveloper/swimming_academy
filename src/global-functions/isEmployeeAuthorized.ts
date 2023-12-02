import axios from "axios";
  export async function employeeAuthorize(): Promise<boolean | any> {
    let token = localStorage.getItem('SwimmingToken');
    if (token) {      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        let result = await axios.post('http://127.0.0.1:8000/api/employeeAuthorize');
        return result.data;
      } catch (err) {
        return false;
      }
    } else {
      return false;
    }
  }