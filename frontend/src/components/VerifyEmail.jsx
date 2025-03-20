import { useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function VerifyEmail() {
  const { token } = useParams();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/verify/${token}`
        );
        alert(response.data.message);
      } catch (error) {
        alert(error.response.data.error);
      }
    };
    verifyEmail();
  }, [token]);

  return <div>Verifying your email...</div>;
}

export default VerifyEmail;
