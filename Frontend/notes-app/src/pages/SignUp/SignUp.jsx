import React, { useState } from 'react';
import NavBar from '../../components/NavBar/NavBar';
import { Link } from 'react-router-dom';
import PasswordInput from '../../components/Input/PasswordInput';

const SignUp = () => {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // // Function to validate email format
  // const validateEmail = (email) => {
  //   const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple regex to check email format
  //   return re.test(email);
  // };

  //This regex is mentioned in helper.

  const handleSignUp = async (e) => {
    e.preventDefault();

      
  if (!name) {
    setError("Please enter your name.");
    return;
  }

  
  if (!validateEmail(email)) {
    setError("Please enter a valid email address.");
    return;
  }

  
  if (!password) {
    setError("Please enter the password.");
    return;
  }

        // Continue with Signup logic (e.g., API call)
        console.log("Signing Up in with:", email, password);
        setError('')

        //Signup API call
  };


  return (
    <>
      <NavBar />

      <div className="flex items-center justify-center mt-28">
        <div className="w-96 border rounded bg-white px-7 py-10">
          <form onSubmit={handleSignUp}>
            <h4 className="text-2xl mb-7">SignUp</h4>

            <input 
              type="text" 
              placeholder="Name" 
              className="input-box"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input 
              type="text" 
              placeholder="Email" 
              className="input-box"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <PasswordInput 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

{error && <p className="text-red-500 text-sm">{error}</p>} {/* Display error message */}
            
            <button type="submit" className="btn-primary">
              Create Account
            </button>

            <p className="text-sm text-center mt-4">Already have an Account? {" "}
              <Link to="/login" className="font-medium text-primary underline">
                Login
              </Link>
              </p>

            </form>
        </div>
      </div>
    </>
  )
}

export default SignUp
