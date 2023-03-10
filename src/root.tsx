// @refresh reload
import { Suspense } from "solid-js";
import { createSignal } from "solid-js";
import {
	Body,
	ErrorBoundary,
	FileRoutes,
	Head,
	Html,
	Meta,
	Routes,
	Scripts,
	Title,
	Link,
} from "solid-start";
import { Router } from "solid-start/islands/server-router";
import "./root.css";
import { createServerData$ } from "solid-start/server";
import { getUserPrefs } from "./lib/user.sever";

export const [darkmode, setDarkmode] = createSignal(false);

export default function Root() {
	const userPrefs = createServerData$(async (_, { request }) => {
		const userPrefs = await getUserPrefs(request);

		return userPrefs;
	});

	setDarkmode(userPrefs()?.lightmode == "on");
	return (
		<Html lang='sv' data-dark-mode={darkmode()}>
			<BaseHead />
			<Body>
				<Suspense>
					<ErrorBoundary>
						<Routes>
							<FileRoutes />
						</Routes>
					</ErrorBoundary>
				</Suspense>
				<Scripts />
			</Body>
		</Html>
	);
}

function BaseHead() {
	return (
		<>
			<Head>
				<Link
					href='https://fonts.googleapis.com/css?family=Roboto:300,400,500'
					rel='stylesheet'
				/>
				<Meta charset='utf-8' />
				<Meta name='viewport' content='width=device-width, initial-scale=1' />
				<Link
					rel='stylesheet'
					href='https://fonts.googleapis.com/icon?family=Material+Icons'
				/>
				<Title>Valeria Roleplay</Title>
				<Link rel='icon' href='/favicon.ico?' type='image/x-icon' />

				<Link
					rel='stylesheet'
					href='https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/styles/base16/google-light.min.css'
					id='light-code-styling'
				/>
				<Link
					rel='stylesheet'
					href='https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/styles/tokyo-night-dark.min.css'
					id='dark-code-styling'
					disabled
				/>
				<Meta name='twitter:image:src' content='/images/valeria.png' />
				<Meta name='twitter:site' content='@valeriarp' />
				<Meta name='twitter:card' content='summary' />
				<Meta
					name='twitter:title'
					content="Valeria Roleplay · Sverige's bästa FiveM server*"
				/>
				<Meta
					name='twitter:description'
					content='En svensk FiveM server med många funktioner och ett trevlig community.'
				/>
				<Meta property='og:image' content='/images/valeria.png' />
				<Meta property='og:image:alt' content='Valeria Roleplays logga' />
				<Meta property='og:image:width' content='1200' />
				<Meta property='og:image:height' content='600' />
				<Meta property='og:site_name' content='Valeria Roleplay' />
			</Head>
		</>
	);
}
