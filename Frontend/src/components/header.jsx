import React, { useState } from "react";
import axios from "axios";

export const Header = (props) => {
  const [formData, setFormData] = useState({ text: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false); // State to manage loading status
  const [error, setError] = useState(null);

  const handleInputChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); // Set loading to true when form is submitted
    setResult(null); // Clear previous result
    setError(null); // Clear previous error
    try {
      const response = await axios.post("/api/detect", formData);
      setResult(response.data.result); // Update state with result
      setLoading(false); // Set loading to false after getting the response
    } catch (error) {
      console.error("Error submitting the form:", error);
      setError("Error analyzing the news. Please try again.");
      setLoading(false); // Set loading to false in case of error
    }
  };

  return (
    <header id="header">
      <div className="intro">
        <div className="overlay">
          <div className="container">
            <div className="row">
              <div className="col-md-8 col-md-offset-2 intro-text">
                <h1>
                  {props.data ? props.data.title : "Loading"}
                  <span></span>
                </h1>
                <p>{props.data ? props.data.paragraph : "Loading"}</p>
                <form onSubmit={handleSubmit}>
                  <input
                    className="form-control rounded border-0 w-50 py-2 mx-auto"
                    type="text"
                    name="text"
                    placeholder="Enter headline or URL of news"
                    value={formData.text}
                    onChange={handleInputChange}
                    required
                  />
                  <br />
                  <br />
                  <button type="submit" className="btn btn-custom btn-lg page-scroll">
                    Let's Detect
                  </button>
                </form>
                {loading && (
                  <div className="result mt-4" style={{ backgroundColor: "#66bfbf" }}>
                    <h2 style={{ color: "white" }}>Loading...</h2>
                  </div>
                )}
                {result && (
                  <div className="result mt-4" style={{ backgroundColor: "#66bfbf" }}>
                    <h2 style={{ color: "white" }}>News Analysis Result</h2>
                    <p>{result}</p>
                  </div>
                )}
                {error && (
                  <div className="error mt-4">
                    <p className="text-danger">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
