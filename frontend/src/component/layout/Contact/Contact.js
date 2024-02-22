import React from "react";
import "./Contact.css";
import { Button } from "@material-ui/core";

const Contact = () => {
  return (
    <div className="contactContainer">
      <a className="mailBtn" href="mailto:kartik.mudgal22@st.niituniversity.in">
        <Button>If you're facing some issues then feel free contact us.</Button>
      </a>
    </div>
  );
};

export default Contact;
