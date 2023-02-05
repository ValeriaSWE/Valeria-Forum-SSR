// import styles from './StylingModules/Home.module.css'
import { A, Title } from "solid-start";
import styles from "./Home.module.css";

export default function Home() {
	return (
		<>
			<Title>Valeria Roleplay</Title>
			<div class={styles.home}>
				<div class={styles.container}>
					<img class={styles.logo} src='../images/valeria.png' alt='Bild' />

					<h1 class={styles.title}>VALERIA ROLEPLAY</h1>

					<div class={styles.buttons}>
						<A
							class={styles.btn}
							href='https://discord.gg/nveyQhUBQr'
							target='_blank'
						>
							Discord
						</A>
						<A class={styles.btn} href='/forum'>
							Forum
						</A>
						<A class={styles.btn} href='#' target='_blank'>
							FiveM
						</A>
					</div>
				</div>
			</div>
		</>
	);
}
