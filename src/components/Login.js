import React, { useEffect, useRef, useState, useContext } from "react";
import AuthContext from "../context/AuthProvider";
import axios from "../api/axios";

const LOGIN_URL = "/login";

const Login = () => {
    const { setAuth } = useContext(AuthContext);

    const userRef = useRef(); //to set the focus on the input when the component loads
    const errorRef = useRef(); //to set the focus on the errors to let screen readers read when the component loads

    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [success, setSuccess] = useState(false);

    // 1 useEffect to set the focus on the input when the component loads
    //since there is nothing in the dependency array, so this will only happen when the component loads, and putting the focus on the user input that is referenced using the userRef
    useEffect(() => {
        userRef.current.focus();
    }, []);

    // 2 useEffect to empty out any error msg, if the user changes the user state or the password state, the error will disappear
    useEffect(() => {
        setErrorMsg("");
    }, [user, password]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                LOGIN_URL,
                JSON.stringify({ email: user, password: password }),
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );
            console.log(response?.data);
            if (response?.data?.email) {
                setSuccess(false);
                setErrorMsg(response?.data?.email[0]);
                errorRef.current.focus();
            } else {
                const access_token = response?.data?.access_token;
                console.log(access_token);
                setAuth({ user, password, access_token });
                setUser("");
                setPassword("");
                setSuccess(true);
            }
        } catch (error) {
            if (!error?.response?.data) {
                setErrorMsg("No Server Response!");
            } else if (error.response?.status === 403) {
                setErrorMsg(error?.response?.data?.detail);
            } else if (error.response?.status === 401) {
                setErrorMsg(error?.response?.data?.detail);
            } else {
                setErrorMsg("Login Failed!");
            }
            errorRef.current.focus();
        }
    };

    return (
        <>
            {success ? (
                <div>
                    <h1>You are logged in!</h1>
                </div>
            ) : (
                <section>
                    <p
                        ref={errorRef}
                        className={errorMsg ? "errorMsg" : "offscreen"}
                        aria-live="assertive"
                    >
                        {errorMsg}
                    </p>
                    <h1>Login</h1>
                    <form action="" onSubmit={submitHandler}>
                        <div className="form-group">
                            <label htmlFor="username">Email:</label>
                            <input
                                type="email"
                                className="form-control"
                                id="username"
                                ref={userRef}
                                autoComplete="off"
                                onChange={(e) => setUser(e.target.value)}
                                value={user}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password:</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                required
                            />
                        </div>
                        <button>Login</button>
                    </form>
                </section>
            )}
        </>
    );
};

export default Login;
