// import Navbar from "../Components/Navbar";
import { Title } from "solid-start";
import styles from "./404.module.css";

export default function NotFound() {
	return (
		<>
			<Title>404 Sidan kunde inte hittas</Title>
			<div class={styles.pageNotFound}>
				<div class={styles.content}>
					<i class='material-icons'>error</i>
					<h1>
						Sidan du söker verkar <br /> inte finnas.
					</h1>
					<a
						onClick={() => {
							history.back();
						}}
					>
						Tillbaka
					</a>
				</div>
			</div>
		</>
	);
}
