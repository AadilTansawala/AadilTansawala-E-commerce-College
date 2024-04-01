import React from 'react'
import './CSS/LoginSignup.css'
import { useState } from 'react';


const LoginSignup = () => {

  const SERVER = "https://aadiltansawala-e-commerce-college-api.onrender.com/";
    const [state, setState] = useState("Log in");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: ""
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const login = async () => {
    
    try {
      // Define formData with user signup data
      console.log("Log In", formData);
      // Define variable to store response data
      let responseData;

      // Make a POST request to the signup endpoint
      await fetch(`${SERVER}login`, {
        method: 'POST',
        headers: {
          Accept: 'application/form-data',
          'Content-Type': 'application/json',
        },
        // Convert formData to JSON string and include it in the request body
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          // Store response data in responseData variable
          responseData = data;

          // Check if signup was successful
          if (responseData.success) {
            // Store token in localStorage
            localStorage.setItem('auth-token', responseData.token);

            // Redirect user to home page
            window.location.replace("/");
          }
          else{
            alert(responseData.errors)
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });

      // Note: Make sure to handle errors appropriately
    } catch (error) {
      console.error('Error:', error);
    }

  }

  const signup = async () => {

    try {
      // Define formData with user signup data
      console.log("Signup", formData);
      // Define variable to store response data
      let responseData;

      // Make a POST request to the signup endpoint
      await fetch(`${SERVER}signup`, {
        method: 'POST',
        headers: {
          Accept: 'application/form-data',
          'Content-Type': 'application/json',
        },
        // Convert formData to JSON string and include it in the request body
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          // Store response data in responseData variable
          responseData = data;

          // Check if signup was successful
          if (responseData.success) {
            // Store token in localStorage
            localStorage.setItem('auth-token', responseData.token);

            // Redirect user to home page
            window.location.replace("/");
          }
          else{
            alert(responseData.errors)
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });

      // Note: Make sure to handle errors appropriately
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <div className='loginSignup'>
      <div className="loginSignup-container">
        <h1>{state}</h1>
        <div className="loginSignup-fields">
          {state === "Sign Up" ? <input name="username" value={formData.username} onChange={changeHandler} type="text" placeholder='Enter Your Name' /> : <></>}
          <input name="email" value={formData.email} onChange={changeHandler} type="email" placeholder='Enter Your Email ID' />
          <input name="password" value={formData.password} onChange={changeHandler} type="password" placeholder='Enter Your Password' />
        </div>
        <button onClick={() => { state === "Log in" ? login() : signup() }}>Continue</button>
        {state === "Log in"
          ?
          <p className="loginSignup-login">Create an Account ? <span onClick={() => { setState("Sign Up") }}>Click Here</span></p>
          :
          <p className="loginSignup-login">Already Have an Account ? <span onClick={() => { setState("Log in") }}>Login Here</span></p>
        }

        <div className="loginSignup-agree">
          <input type="checkbox" name="" id="" />
          <p>By Continuing , I agree to te terms of use & privacy policy</p>
        </div>
      </div>
    </div>
  )
}

export default LoginSignup
