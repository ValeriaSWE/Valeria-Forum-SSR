import TextField from "@suid/material/TextField";
import $ from "jquery";
import { createServerAction$ } from "solid-start/server/data.js";
import { LoginUserServerPost } from "~/api/user.js";
import { createUserSession, login } from "~/lib/user.sever.js";
import { Show } from "solid-js/web";
// import { Auth } from "../lib/user.js";

import styles from "./StylingModules/Login.module.css";
import { FormError, Navigate, useSearchParams } from "solid-start";
import { createSignal } from "solid-js";

/**
 * Creates the visual elements for a login form
 */

export default function Login(props: { cancel: () => void } | {}) {
	// const location = useLocation();
	// console.log(location.pathname);
	const [params] = useSearchParams();

	const [loggingIn, { Form }] = createServerAction$(
		async (form: FormData, { request }) => {
			const field_username = form.get("login-email") as string; // $("#login-email").val();
			const password = form.get("login-password") as string; // $("#login-password").val();
			const loc = form.get("redirectTo") as string;
			// console.log(loc);

			const fields = { field_username, password };
			// console.table(fields);

			try {
				const { data } = await LoginUserServerPost(field_username, password);
				// Auth(data);
				// console.log(data);
				// if (!data.result) throw
				const { _id, username, email, role, roleRank, profilePicture } =
					data.result;
				// console.log(data.result);
				return login(
					_id,
					username,
					email,
					role,
					roleRank,
					profilePicture._id,
					loc,
					request
				);
				// 		// window.location.reload();
			} catch (error) {
				console.error(error);
				throw new FormError(error?.response?.data?.message, {
					fields,
				});
				// $("#error").html(error.response.data.message);
			}
		}
	);
	// const body = document.querySelector("body");
	// body.style.overflow = "hidden";

	const [canceling, setCanceling] = createSignal(false);

	function cancel(this) {
		if (props.cancel && typeof props.cancel == "function") {
			props.cancel();
		}

		setCanceling(true);
	}

	return (
		<>
			<Form>
				{canceling() ? <Navigate href={params.redirect || "/forum"} /> : <></>}
				<div class={styles.loginInnerContainer}>
					<input
						type='hidden'
						name='redirectTo'
						value={params.redirect || "/forum"}
					/>
					<h2 class={styles.title}> LOGGA IN</h2>

					{/* <div class={styles.input}>
                        <p>Anändarnamn / Email:</p>
                        <input type="text" name="email" id="login-email" />
                        <TextField />
                    </div> */}
					<TextField
						id='login-email'
						label='Användarnamn / Epost'
						variant='standard'
						required
						name='login-email'
						classes={{ root: styles.input }}
					/>

					{/* <div class={styles.input}>
                        <p>Lösenord:</p>
                        <input type="password" name="password" id="login-password"/>
                    </div> */}
					<TextField
						id='login-password'
						name='login-password'
						label='Lösenord'
						variant='standard'
						type='password'
						autoComplete='current-password'
						required
						classes={{ root: styles.input }}
					/>

					<div class={styles.forgotPassword}>
						<p></p>
					</div>

					<button
						class={styles.loginBtn}
						id='login-submit'
						type='submit'
						// onClick={loginSubmit}
					>
						Logga in
					</button>

					<button
						class={styles.cancelBtn}
						id='login-cancel'
						onClick={cancel}
						type='button'
					>
						Avbryt
					</button>

					<Show when={loggingIn.error}>
						<p role='alert' class={styles.loginError} id='error-message'>
							{loggingIn.error.message}
						</p>
					</Show>
					{/* <span class={styles.loginError} id='error'></span> */}

					<div class={styles.loginFooter}>
						<p>Valeria Roleplay | Inloggning</p>
					</div>
				</div>
			</Form>
		</>
	);
}

/**
 * This function takes a username and password as arguments, and returns a promise that resolves to the
 * response from the server when the server is sent a POST request with the username and password as
 * the body.
 * @param {String} username - String
 * @param {String} password - String
 */
// const loginUserServerPost = (username: String, password: String) => axios.post(`http://localhost:8000/user/login`, {username, password})

/**
 * It takes the username and password from the form, sends it to the server, and if the server responds
 * with a token, it saves the token in local storage.
 */
// const loginSubmit = async () => {
// 	const username = $("#login-email").val();
// 	const password = $("#login-password").val();

// 	try {
// 		const { data } = await LoginUserServerPost(username, password);
// 		Auth(data);
// 		// window.location.reload();
// 	} catch (error) {
// 		$("#error").html(error.response.data.message);
// 	}
// };
