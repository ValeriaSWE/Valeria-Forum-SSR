import Navbar from "./Navbar";
import styles from "./StylingModules/Forum.module.css";

export default function Forum(props: {children: any}) {
    return(<>
        <Navbar />
        <div class={styles.forum}>
            <div class={styles.tabContent}>
                {props.children}
            </div>
        </div>
    </>)
}